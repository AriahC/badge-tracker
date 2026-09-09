import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import {
  MIN_USD,
  SOLANA_RPC_URL,
  TREASURY_ADDRESS,
  fetchSolUsdPrice,
  minLamportsForUsd,
  sumTransfersToTreasury,
} from "@/lib/solana-pay";

type FindBody = {
  /** Solana Pay reference pubkey (base58). */
  reference?: string;
  /** Unix seconds — ignore older treasury transfers when falling back. */
  sinceUnix?: number;
  /** Quoted lamports at pay time (optional hint for treasury scan). */
  expectedLamports?: number;
};

/**
 * Locate a Founding Family payment without relying on the browser RPC.
 *
 * 1. Prefer Solana Pay `reference` account keys (getSignaturesForAddress).
 * 2. Fall back to recent treasury transfers ≥ $1 — many wallets / manual sends
 *    never attach the reference, so reference-only polling never completes.
 */
export async function POST(request: NextRequest) {
  let body: FindBody;
  try {
    body = (await request.json()) as FindBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  try {
    const connection = new Connection(SOLANA_RPC_URL, "confirmed");
    const reference = body.reference?.trim();

    if (reference) {
      try {
        const refKey = new PublicKey(reference);
        const sigs = await connection.getSignaturesForAddress(refKey, {
          limit: 5,
        });
        const confirmed = sigs.find((s) => !s.err);
        if (confirmed) {
          return NextResponse.json({
            found: true,
            signature: confirmed.signature,
            source: "reference",
          });
        }
      } catch (err) {
        // Invalid reference or transient RPC — still try treasury fallback.
        console.warn(
          "[checkout/find] reference lookup failed",
          err instanceof Error ? err.message : err,
        );
      }
    }

    const solUsd = await fetchSolUsdPrice();
    const minThreshold = minLamportsForUsd(MIN_USD, solUsd);
    const expected = Number(body.expectedLamports);
    const hasExpected = Number.isFinite(expected) && expected > 0;

    const sinceUnix =
      typeof body.sinceUnix === "number" && Number.isFinite(body.sinceUnix)
        ? body.sinceUnix
        : Math.floor(Date.now() / 1000) - 60 * 30;

    const treasury = new PublicKey(TREASURY_ADDRESS);
    const recent = await connection.getSignaturesForAddress(treasury, {
      limit: 25,
    });

    for (const info of recent) {
      if (info.err) continue;
      if (info.blockTime != null && info.blockTime < sinceUnix) continue;

      const tx = await connection.getParsedTransaction(info.signature, {
        maxSupportedTransactionVersion: 0,
        commitment: "confirmed",
      });
      if (!tx || tx.meta?.err) continue;

      const messageIxs = tx.transaction.message.instructions;
      const innerIxs =
        tx.meta?.innerInstructions?.flatMap((g) => g.instructions) ?? [];
      const transferred =
        sumTransfersToTreasury(messageIxs, treasury.toBase58()) +
        sumTransfersToTreasury(innerIxs, treasury.toBase58());

      if (transferred < minThreshold) continue;

      // When we know the quoted size, require a nearby match so concurrent
      // checkouts are less likely to claim each other's payments. Recovery
      // without expectedLamports accepts any ≥ $1 transfer in the window.
      if (hasExpected) {
        const lo = Math.floor(expected * 0.8);
        const hi = Math.ceil(expected * 1.25);
        if (transferred < lo || transferred > hi) continue;
      }

      return NextResponse.json({
        found: true,
        signature: info.signature,
        source: "treasury",
        transferredLamports: transferred,
      });
    }

    return NextResponse.json({ found: false });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not search for payment.";
    console.error("[checkout/find]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
