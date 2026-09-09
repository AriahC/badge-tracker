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
