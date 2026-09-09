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

/**
 * Fetch SOL/USD with multiple sources so verify/find don't fail when one API
 * is rate-limited.
 */
export async function fetchSolUsdPrice(): Promise<number> {
  const sources: Array<() => Promise<number>> = [
    async () => {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
        { cache: "no-store" },
      );
      if (!res.ok) throw new Error("coingecko");
      const data = (await res.json()) as { solana?: { usd?: number } };
      const price = data.solana?.usd;
      if (!price || price <= 0) throw new Error("coingecko invalid");
      return price;
    },
    async () => {
      const res = await fetch(
        "https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT",
        { cache: "no-store" },
      );
      if (!res.ok) throw new Error("binance");
      const data = (await res.json()) as { price?: string };
      const price = Number(data.price);
      if (!price || price <= 0) throw new Error("binance invalid");
      return price;
    },
    async () => {
      const res = await fetch(
        "https://price.jup.ag/v6/price?ids=SOL",
        { cache: "no-store" },
      );
      if (!res.ok) throw new Error("jupiter");
      const data = (await res.json()) as {
        data?: { SOL?: { price?: number } };
      };
      const price = data.data?.SOL?.price;
      if (!price || price <= 0) throw new Error("jupiter invalid");
      return price;
    },
  ];

  const errors: string[] = [];
  for (const source of sources) {
    try {
      return await source();
    } catch (err) {
      errors.push(err instanceof Error ? err.message : "price");
    }
  }
  throw new Error(`Unable to fetch SOL price (${errors.join(", ")}).`);
}
