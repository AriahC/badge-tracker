import { NextRequest, NextResponse } from "next/server";
import {
  MIN_USD,
  PRICE_SLIPPAGE,
  TREASURY_ADDRESS,
  fetchSolUsdPrice,
} from "@/lib/solana-pay";

export async function GET(request: NextRequest) {
  const usdRaw = Number(request.nextUrl.searchParams.get("usd") ?? MIN_USD);
  const usd = Number.isFinite(usdRaw) ? Math.max(MIN_USD, usdRaw) : MIN_USD;

  try {
    const solUsd = await fetchSolUsdPrice();
    const solAmount = usd / solUsd;
    const lamports = Math.ceil(solAmount * 1e9);
    const minLamports = Math.floor(lamports * (1 - PRICE_SLIPPAGE));

    return NextResponse.json({
      treasury: TREASURY_ADDRESS,
      usd,
      solUsd,
      solAmount,
      lamports,
      minLamports,
      note: `$${usd.toFixed(2)} ≈ ${solAmount.toFixed(6)} SOL (min verified ${minLamports} lamports)`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Quote failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
