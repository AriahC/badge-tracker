/** Founding Family Solana payment config */

export const TREASURY_ADDRESS =
  process.env.NEXT_PUBLIC_SOLANA_TREASURY_ADDRESS?.trim() ||
  "R9wEoz95MmM5uqgn1iuxqcgxeqakyeMnRVaXY1xEh9P";

/** Minimum Founding Family contribution in USD. */
export const MIN_USD = 1;

/** Allow up to this fraction of price slippage when verifying lamports. */
export const PRICE_SLIPPAGE = 0.08;

export const SOLANA_RPC_URL =
  process.env.SOLANA_RPC_URL?.trim() ||
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.trim() ||
  "https://api.mainnet-beta.solana.com";

export const EXPLORER_TX_BASE =
  process.env.NEXT_PUBLIC_SOLANA_EXPLORER_BASE?.trim() ||
  "https://explorer.solana.com/tx";

/** Browser + server RPC for quotes / Solana Pay polling. */
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
