import "server-only";

import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  Actions,
  createEd25519AuthorityInfo,
  fetchNullableSwig,
  findSwigPda,
  getCreateSwigInstruction,
  getSwigWalletAddress,
} from "@swig-wallet/classic";
import bs58 from "bs58";

/**
 * Swig smart-wallet helpers (protocol SDK via @swig-wallet/classic).
 * App pays create rent/fees with BADGE_MINTER_SECRET; parent authority pubkey
 * is registered as root. Destination for mint is the Swig wallet-address PDA.
 */

export function swigCreateConfigured(): boolean {
  return Boolean(process.env.BADGE_MINTER_SECRET?.trim());
}

function getConnection(): Connection {
  const rpc = process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com";
  return new Connection(rpc, "confirmed");
}

function getMinterKeypair(): Keypair {
  const secret = process.env.BADGE_MINTER_SECRET?.trim();
  if (!secret) throw new Error("BADGE_MINTER_SECRET is not set.");
  return Keypair.fromSecretKey(bs58.decode(secret));
}

function decodeId(idBase64: string): Uint8Array {
  const buf = Buffer.from(idBase64, "base64");
  if (buf.length !== 32) {
    throw new Error("Swig id must be 32 bytes (base64).");
  }
  return new Uint8Array(buf);
}

export type EnsureSwigWalletResult = {
  walletAddress: string;
  swigAddress: string;
  idBase64: string;
  created: boolean;
  signature: string | null;
};

/**
 * Ensure a Swig wallet exists for the given 32-byte id + Ed25519 authority.
 * If the config account already exists, returns its wallet-address PDA.
 */
export async function ensureSwigWallet(opts: {
  authorityPublicKey: string;
  idBase64: string;
}): Promise<EnsureSwigWalletResult> {
  const connection = getConnection();
  const id = decodeId(opts.idBase64);
  const authority = new PublicKey(opts.authorityPublicKey);
  const swigAddress = findSwigPda(id);

  const existing = await fetchNullableSwig(connection, swigAddress);
  if (existing) {
    const wallet = await getSwigWalletAddress(existing);
    return {
      walletAddress: wallet.toBase58(),
      swigAddress: swigAddress.toBase58(),
      idBase64: opts.idBase64,
      created: false,
      signature: null,
    };
  }

  const payer = getMinterKeypair();
  const createIx = await getCreateSwigInstruction({
    payer: payer.publicKey,
    id,
    actions: Actions.set().all().get(),
    authorityInfo: createEd25519AuthorityInfo(authority),
  });

  const tx = new Transaction().add(createIx);
  const signature = await sendAndConfirmTransaction(connection, tx, [payer], {
    commitment: "confirmed",
  });

  const swig = await fetchNullableSwig(connection, swigAddress);
  if (!swig) {
    throw new Error("Swig account missing after create.");
  }
  const wallet = await getSwigWalletAddress(swig);

  return {
    walletAddress: wallet.toBase58(),
    swigAddress: swigAddress.toBase58(),
    idBase64: opts.idBase64,
    created: true,
    signature,
  };
}
