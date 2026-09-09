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

type VerifyInput = {
  signature: string;
  email: string;
  name?: string;
  marketingOptIn?: boolean;
  /** Contribution intent (display). Verification only requires ≥ $MIN_USD. */
  usd?: number;
};

async function verifyPayment(input: VerifyInput) {
  const signature = input.signature.trim();
  const email = input.email.trim().toLowerCase();
  const usd = Math.max(MIN_USD, Number(input.usd) || MIN_USD);

  if (!signature) {
    return NextResponse.json(
      { error: "Missing transaction signature." },
      { status: 400 },
    );
  }
  if (!email.includes("@")) {
    return NextResponse.json(
      { error: "A valid adult email is required." },
      { status: 400 },
    );
  }

  const treasury = new PublicKey(TREASURY_ADDRESS);
  const connection = new Connection(SOLANA_RPC_URL, "confirmed");
  const tx = await connection.getParsedTransaction(signature, {
    maxSupportedTransactionVersion: 0,
    commitment: "confirmed",
  });

  if (!tx || tx.meta?.err) {
    return NextResponse.json(
      { paid: false, error: "Transaction not found or failed on Solana." },
      { status: 402 },
    );
  }

  const messageIxs = tx.transaction.message.instructions;
  const innerIxs =
    tx.meta?.innerInstructions?.flatMap((group) => group.instructions) ?? [];
  const transferred =
    sumTransfersToTreasury(messageIxs, treasury.toBase58()) +
    sumTransfersToTreasury(innerIxs, treasury.toBase58());

  if (transferred <= 0) {
    return NextResponse.json(
      {
        paid: false,
        error: `No SOL transfer to treasury ${TREASURY_ADDRESS} found in this transaction.`,
      },
      { status: 402 },
    );
  }

  const solUsd = await fetchSolUsdPrice();
  // Accept any treasury transfer ≥ $1 (with slippage). Do not require the form
  // USD to match — price drift and rounded wallet sends must not block checkout.
  const minThreshold = minLamportsForUsd(MIN_USD, solUsd);
  if (transferred < minThreshold) {
    const receivedUsd = (transferred / 1e9) * solUsd;
    return NextResponse.json(
      {
        paid: false,
        error: `Payment too small (~$${receivedUsd.toFixed(2)}). Founding Family requires at least $${MIN_USD}.`,
        transferredLamports: transferred,
        requiredLamports: minThreshold,
      },
      { status: 402 },
    );
  }

  const receivedUsd = (transferred / 1e9) * solUsd;
  const referralCode = signature.slice(0, 8).toUpperCase();

  return NextResponse.json({
    paid: true,
    email,
    name: input.name?.trim() || "",
    marketingOptIn: Boolean(input.marketingOptIn),
    referralCode,
    signature,
    treasury: TREASURY_ADDRESS,
    transferredLamports: transferred,
    receivedUsd,
    solUsd,
    usd,
  });
}

export async function POST(request: NextRequest) {
  let body: VerifyInput;
  try {
    body = (await request.json()) as VerifyInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  try {
    return await verifyPayment({
      signature: body.signature ?? "",
      email: body.email ?? "",
      name: body.name,
      marketingOptIn: body.marketingOptIn,
      usd: body.usd,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Verification failed.";
    console.error("[checkout/verify]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const signature = request.nextUrl.searchParams.get("signature")?.trim() ?? "";
  const email =
    request.nextUrl.searchParams.get("email")?.trim() ||
    "founding@veya.family";
  const usd = Number(request.nextUrl.searchParams.get("usd") ?? MIN_USD);

  try {
    return await verifyPayment({
      signature,
      email,
      usd,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Verification failed.";
    console.error("[checkout/verify]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
