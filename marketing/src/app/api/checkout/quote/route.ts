import { NextRequest, NextResponse } from "next/server";
import { MIN_USD, PRICE_SLIPPAGE, TREASURY_ADDRESS } from "@/lib/solana-pay";

async function fetchSolUsdPrice(): Promise<number> {
  const res = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
    { next: { revalidate: 30 } },
  );
  if (!res.ok) {
    throw new Error("Unable to fetch SOL price.");
  }
  const data = (await res.json()) as { solana?: { usd?: number } };
  const price = data.solana?.usd;
  if (!price || price <= 0) {
    throw new Error("Invalid SOL price response.");
  }
  return price;
}

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
