/** Founding Family Solana payment config */

import type {
  ParsedInstruction,
  PartiallyDecodedInstruction,
} from "@solana/web3.js";

export const TREASURY_ADDRESS =
  process.env.NEXT_PUBLIC_SOLANA_TREASURY_ADDRESS?.trim() ||
  "R9wEoz95MmM5uqgn1iuxqcgxeqakyeMnRVaXY1xEh9P";

/** Minimum Founding Family contribution in USD. */
export const MIN_USD = 1;

/**
 * Allow up to this fraction of price slippage when verifying lamports.
 * Generous on purpose — SOL can move between quote and confirm, and recovery
 * only needs to prove a ≥ $1 contribution hit the treasury.
 */
export const PRICE_SLIPPAGE = 0.15;

export const SOLANA_RPC_URL =
  process.env.SOLANA_RPC_URL?.trim() ||
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.trim() ||
  "https://api.mainnet-beta.solana.com";

export const EXPLORER_TX_BASE =
  process.env.NEXT_PUBLIC_SOLANA_EXPLORER_BASE?.trim() ||
  "https://explorer.solana.com/tx";

/** Browser RPC for wallet send / blockhash (prefer dedicated URL in prod). */
export const PUBLIC_SOLANA_RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.trim() ||
  "https://api.mainnet-beta.solana.com";

/**
 * Build a Solana Pay transfer request URL (scan with Phantom / mobile wallets).
 * Spec: https://docs.solanapay.com/spec#transfer-request
 */
export function buildSolanaPayTransferUrl(opts: {
  recipient: string;
  /** Exact SOL amount (decimal string preferred for precision). */
  amountSol: string;
  reference: string;
  label?: string;
  message?: string;
}): string {
  const params = new URLSearchParams();
  params.set("amount", opts.amountSol);
  params.set("reference", opts.reference);
  if (opts.label) params.set("label", opts.label);
  if (opts.message) params.set("message", opts.message);
  return `solana:${opts.recipient}?${params.toString()}`;
}

function isParsed(
  ix: ParsedInstruction | PartiallyDecodedInstruction,
): ix is ParsedInstruction {
  return "parsed" in ix;
}

/** Sum native SOL transfers to the treasury across top-level + inner ixs. */
export function sumTransfersToTreasury(
  instructions: (ParsedInstruction | PartiallyDecodedInstruction)[],
  treasury: string,
): number {
  let total = 0;
  for (const ix of instructions) {
    if (!isParsed(ix)) continue;
    if (ix.program !== "system" || ix.parsed?.type !== "transfer") continue;
    const info = ix.parsed.info as {
      destination?: string;
      lamports?: number | string;
    };
    if (info.destination !== treasury) continue;
    const lamports =
      typeof info.lamports === "string"
        ? Number(info.lamports)
        : info.lamports;
    if (typeof lamports === "number" && Number.isFinite(lamports)) {
      total += lamports;
    }
  }
  return total;
}

/** Minimum lamports that still count as a $MIN_USD Founding Family payment. */
export function minLamportsForUsd(usd: number, solUsd: number): number {
  const safeUsd = Math.max(MIN_USD, usd);
  return Math.ceil((safeUsd / solUsd) * 1e9 * (1 - PRICE_SLIPPAGE));
}

const WSOL_MINT = "So11111111111111111111111111111111111111112";
const PYTH_SOL_USD_ID =
  "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";

/** Per-oracle timeout so one hang cannot fail the whole quote. */
const PRICE_TIMEOUT_MS = 2500;

/**
 * Last-resort SOL/USD if every live oracle is unreachable from this runtime.
 * Slightly conservative (low) so quotes send a bit more SOL than a high print
 * would — verification still allows 15% slippage for ≥ $1 treasury transfers.
 */
export const FALLBACK_SOL_USD = 120;

const FALLBACK_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export type SolUsdQuote = {
  price: number;
  source: string;
  approximate: boolean;
};

let lastGoodPrice: { price: number; source: string; at: number } | null = null;

function assertSanePrice(price: number, source: string): number {
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error(`${source} invalid`);
  }
  if (price < 5 || price > 2500) {
    throw new Error(`${source} out of range`);
  }
  return price;
}

function rememberPrice(price: number, source: string): number {
  const sane = assertSanePrice(price, source);
  lastGoodPrice = { price: sane, source, at: Date.now() };
  return sane;
}

async function fetchJson(url: string, source: string): Promise<unknown> {
  const res = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(PRICE_TIMEOUT_MS),
    headers: {
      Accept: "application/json",
      "User-Agent": "veya-founding-family/1.0",
    },
  });
  if (!res.ok) throw new Error(`${source} ${res.status}`);
  return res.json();
}

function labeledError(source: string, err: unknown): Error {
  if (err instanceof Error) {
    if (err.name === "TimeoutError" || err.name === "AbortError") {
      return new Error(`${source} timeout`);
    }
    if (err.message.startsWith(source)) return err;
    return new Error(`${source} ${err.message}`);
  }
  return new Error(`${source} failed`);
}

async function priceFrom(
  source: string,
  url: string,
  parse: (data: unknown) => number,
): Promise<{ price: number; source: string }> {
  try {
    const data = await fetchJson(url, source);
    const price = rememberPrice(parse(data), source);
    return { price, source };
  } catch (err) {
    throw labeledError(source, err);
  }
}

function num(value: unknown): number {
  return typeof value === "string" ? Number(value) : Number(value);
}

const PRICE_SOURCES: Array<() => Promise<{ price: number; source: string }>> = [
  () =>
    priceFrom(
      "coingecko",
      "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
      (data) => num((data as { solana?: { usd?: unknown } }).solana?.usd),
    ),
  () =>
    priceFrom(
      "binance",
      "https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT",
      (data) => num((data as { price?: unknown }).price),
    ),
  () =>
    priceFrom(
      "binance-vision",
      "https://data-api.binance.vision/api/v3/ticker/price?symbol=SOLUSDT",
      (data) => num((data as { price?: unknown }).price),
    ),
  () =>
    priceFrom(
      "binance-us",
      "https://api.binance.us/api/v3/ticker/price?symbol=SOLUSD",
      (data) => num((data as { price?: unknown }).price),
    ),
  () =>
    priceFrom(
      "coinbase",
      "https://api.coinbase.com/v2/prices/SOL-USD/spot",
      (data) =>
        num((data as { data?: { amount?: unknown } }).data?.amount),
    ),
  () =>
    priceFrom(
      "kraken",
      "https://api.kraken.com/0/public/Ticker?pair=SOLUSD",
      (data) => {
        const result = (data as { result?: Record<string, { c?: unknown[] }> })
          .result;
        const pair = result ? Object.values(result)[0] : undefined;
        return num(pair?.c?.[0]);
      },
    ),
  () =>
    priceFrom(
      "jupiter",
      `https://api.jup.ag/price/v3?ids=${WSOL_MINT}`,
      (data) => {
        const row = (data as Record<string, { usdPrice?: unknown }>)[WSOL_MINT];
        if (row?.usdPrice != null) return num(row.usdPrice);
        const nested = (
          data as { data?: Record<string, { usdPrice?: unknown; price?: unknown }> }
        ).data?.[WSOL_MINT];
        return num(nested?.usdPrice ?? nested?.price);
      },
    ),
  () =>
    priceFrom(
      "cryptocompare",
      "https://min-api.cryptocompare.com/data/price?fsym=SOL&tsyms=USD",
      (data) => num((data as { USD?: unknown }).USD),
    ),
  () =>
    priceFrom(
      "coinpaprika",
      "https://api.coinpaprika.com/v1/tickers/sol-solana",
      (data) =>
        num(
          (data as { quotes?: { USD?: { price?: unknown } } }).quotes?.USD
            ?.price,
        ),
    ),
  () =>
    priceFrom(
      "pyth",
      `https://hermes.pyth.network/v2/updates/price/latest?ids[]=${PYTH_SOL_USD_ID}`,
      (data) => {
        const parsed = (
          data as {
            parsed?: Array<{
              price?: { price?: unknown; expo?: number };
            }>;
          }
        ).parsed?.[0]?.price;
        const expo = parsed?.expo ?? 0;
        return num(parsed?.price) * 10 ** expo;
      },
    ),
  () =>
    priceFrom(
      "dexscreener",
      `https://api.dexscreener.com/latest/dex/tokens/${WSOL_MINT}`,
      (data) => {
        const pairs = (data as { pairs?: Array<{ priceUsd?: unknown }> }).pairs;
        return num(pairs?.[0]?.priceUsd);
      },
    ),
];

/**
 * Resolve SOL/USD from public oracles in parallel. Never throws: falls back to
 * the last good in-memory price, then a conservative hardcoded band, so
 * Founding Family checkout cannot be bricked by CoinGecko/Binance/Jupiter
 * outages (common from Vercel serverless IPs).
 */
export async function resolveSolUsdPrice(): Promise<SolUsdQuote> {
  try {
    const live = await Promise.any(PRICE_SOURCES.map((source) => source()));
    return { price: live.price, source: live.source, approximate: false };
  } catch (err) {
    const errors =
      err instanceof AggregateError
        ? err.errors.map((reason) =>
            reason instanceof Error ? reason.message : "failed",
          )
        : [err instanceof Error ? err.message : "failed"];

    if (
      lastGoodPrice &&
      Date.now() - lastGoodPrice.at < FALLBACK_MAX_AGE_MS
    ) {
      console.warn(
        "[sol-price] using cached last-good",
        lastGoodPrice.source,
        lastGoodPrice.price,
        errors.join(", "),
      );
      return {
        price: lastGoodPrice.price,
        source: `${lastGoodPrice.source}-cached`,
        approximate: true,
      };
    }

    console.warn(
      "[sol-price] using hardcoded fallback",
      FALLBACK_SOL_USD,
      errors.join(", "),
    );
    return {
      price: FALLBACK_SOL_USD,
      source: "fallback",
      approximate: true,
    };
  }
}

export async function fetchSolUsdPrice(): Promise<number> {
  const quote = await resolveSolUsdPrice();
  return quote.price;
}
