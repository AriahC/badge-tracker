import "server-only";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  keypairIdentity,
  publicKey,
  none,
  type Umi,
} from "@metaplex-foundation/umi";
import { mintV1, mplBubblegum } from "@metaplex-foundation/mpl-bubblegum";
import bs58 from "bs58";

/**
 * Compressed-NFT badge minting (Metaplex Bubblegum) on Solana devnet.
 * App pays fees — kids never sign mint transactions.
 *
 * Env:
 *  - SOLANA_RPC_URL       (default: https://api.devnet.solana.com)
 *  - BADGE_MINTER_SECRET  base58 secret of the tree authority
 *  - BADGE_TREE           merkle tree address (scripts/setup-badge-tree.mjs)
 *  - NEXT_PUBLIC_APP_URL  origin for badge metadata URIs
 */

export function onchainConfigured(): boolean {
  return Boolean(process.env.BADGE_MINTER_SECRET && process.env.BADGE_TREE);
}

let cachedUmi: Umi | null = null;

function getUmi(): Umi {
  if (cachedUmi) return cachedUmi;
  const rpc = process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com";
  const secret = process.env.BADGE_MINTER_SECRET;
  if (!secret) throw new Error("BADGE_MINTER_SECRET is not set.");
  const umi = createUmi(rpc).use(mplBubblegum());
  const keypair = umi.eddsa.createKeypairFromSecretKey(bs58.decode(secret));
  umi.use(keypairIdentity(keypair));
  cachedUmi = umi;
  return umi;
}

/** Mint one badge cNFT. Returns the transaction signature (base58). */
export async function mintBadgeCnft(opts: {
  badgeId: string;
  badgeName: string;
  ownerAddress: string;
}): Promise<string> {
  const tree = process.env.BADGE_TREE;
  if (!tree) throw new Error("BADGE_TREE is not set.");

  const umi = getUmi();
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://badge-tracker-two.vercel.app";

  const name = `Badge Journey: ${opts.badgeName}`.slice(0, 32);

  const { signature } = await mintV1(umi, {
    leafOwner: publicKey(opts.ownerAddress),
    merkleTree: publicKey(tree),
    metadata: {
      name,
      symbol: "BJRN",
      uri: `${appUrl}/api/badge-meta/${encodeURIComponent(opts.badgeId)}`,
      sellerFeeBasisPoints: 0,
      collection: none(),
      creators: [
        { address: umi.identity.publicKey, verified: false, share: 100 },
      ],
    },
  }).sendAndConfirm(umi);

  return bs58.encode(signature);
}
