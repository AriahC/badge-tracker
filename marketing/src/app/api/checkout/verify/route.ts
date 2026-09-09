import { NextRequest, NextResponse } from "next/server";
import {
  Connection,
  PublicKey,
  type ParsedInstruction,
  type PartiallyDecodedInstruction,
} from "@solana/web3.js";
import {
  MIN_USD,
  PRICE_SLIPPAGE,
  SOLANA_RPC_URL,
  TREASURY_ADDRESS,
} from "@/lib/solana-pay";

type VerifyInput = {
  signature: string;
  email: string;
  name?: string;
  marketingOptIn?: boolean;
  usd?: number;
};

async function fetchSolUsdPrice(): Promise<number> {
  const res = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
    { cache: "no-store" },
  );
  if (!res.ok) throw new Error("Unable to fetch SOL price.");
  const data = (await res.json()) as { solana?: { usd?: number } };
  const price = data.solana?.usd;
  if (!price || price <= 0) throw new Error("Invalid SOL price.");
  return price;
}

function isParsed(
  ix: ParsedInstruction | PartiallyDecodedInstruction,
): ix is ParsedInstruction {
  return "parsed" in ix;
}

function sumTransfersToTreasury(
  instructions: (ParsedInstruction | PartiallyDecodedInstruction)[],
  treasury: string,
): number {
  let total = 0;
  for (const ix of instructions) {
    if (!isParsed(ix)) continue;
    if (ix.program !== "system" || ix.parsed?.type !== "transfer") continue;
    const info = ix.parsed.info as {
      destination?: string;
      lamports?: number;
    };
    if (info.destination === treasury && typeof info.lamports === "number") {
      total += info.lamports;
    }
  }
  return total;
}

async function verifyPayment(input: VerifyInput) {
  const signature = input.signature.trim();
  const email = input.email.trim().toLowerCase();
  const usd = Math.max(MIN_USD, Number(input.usd) || MIN_USD);

  if (!signature) {
    return NextResponse.json({ error: "Missing transaction signature." }, { status: 400 });
  }
  if (!email.includes("@")) {
    return NextResponse.json({ error: "A valid adult email is required." }, { status: 400 });
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
  const requiredLamports = Math.ceil((usd / solUsd) * 1e9 * (1 - PRICE_SLIPPAGE));
  const minForOneDollar = Math.ceil((MIN_USD / solUsd) * 1e9 * (1 - PRICE_SLIPPAGE));
  const threshold = Math.max(requiredLamports, minForOneDollar);

  if (transferred < threshold) {
    const receivedUsd = (transferred / 1e9) * solUsd;
    return NextResponse.json(
      {
        paid: false,
        error: `Payment too small (~$${receivedUsd.toFixed(2)}). Founding Family requires at least $${MIN_USD}.`,
        transferredLamports: transferred,
        requiredLamports: threshold,
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
    request.nextUrl.searchParams.get("email")?.trim() || "founding@veya.family";
  const usd = Number(request.nextUrl.searchParams.get("usd") ?? MIN_USD);

  try {
    return await verifyPayment({ signature, email, usd });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Verification failed.";
    console.error("[checkout/verify]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
