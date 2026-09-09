import { NextRequest, NextResponse } from "next/server";
import {
  MIN_USD,
  PRICE_SLIPPAGE,
  TREASURY_ADDRESS,
  resolveSolUsdPrice,
} from "@/lib/solana-pay";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const usdRaw = Number(request.nextUrl.searchParams.get("usd") ?? MIN_USD);
  const usd = Number.isFinite(usdRaw) ? Math.max(MIN_USD, usdRaw) : MIN_USD;

  const resolved = await resolveSolUsdPrice();
  // When the print is approximate, quote a little extra SOL so ≥ $1 still
  // clears verification slippage if the live price moved.
  const quotePrice = resolved.approximate
    ? resolved.price * (1 - PRICE_SLIPPAGE / 2)
    : resolved.price;
  const solAmount = usd / quotePrice;
  const lamports = Math.ceil(solAmount * 1e9);
  const minLamports = Math.floor(lamports * (1 - PRICE_SLIPPAGE));
  const approxNote = resolved.approximate
    ? " Approximate SOL/USD — live oracles were unreachable from this server."
    : "";

  return NextResponse.json({
    treasury: TREASURY_ADDRESS,
    usd,
    solUsd: quotePrice,
    solAmount,
    lamports,
    minLamports,
    source: resolved.source,
    approximate: resolved.approximate,
    note: `$${usd.toFixed(2)} ≈ ${solAmount.toFixed(6)} SOL (min verified ${minLamports} lamports).${approxNote}`,
  });
}
