"use client";

import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import {
  loadSwigAuthoritySecret,
  loadSwigIdBase64,
  saveMintWallet,
  saveSwigAuthoritySecret,
  saveSwigIdBase64,
} from "./storage";

export type SwigConnectResult = {
  walletAddress: string;
  swigAddress: string;
  created: boolean;
  explorerUrl?: string;
};

function randomIdBase64(): string {
  const id = new Uint8Array(32);
  crypto.getRandomValues(id);
  let binary = "";
  for (const byte of id) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function ensureAuthorityKeypair(): Keypair {
  const existing = loadSwigAuthoritySecret();
  if (existing) {
    try {
      return Keypair.fromSecretKey(bs58.decode(existing));
    } catch {
      // fall through and mint a fresh demo authority
    }
  }
  const fresh = Keypair.generate();
  saveSwigAuthoritySecret(bs58.encode(fresh.secretKey));
  return fresh;
}

function ensureSwigId(): string {
  const existing = loadSwigIdBase64();
  if (existing) {
    try {
      if (atob(existing).length === 32) return existing;
    } catch {
      // regenerate
    }
  }
  const id = randomIdBase64();
  saveSwigIdBase64(id);
  return id;
}

/**
 * Create or reconnect the parent Swig smart wallet.
 * App pays on-chain create fees; this wallet is the cNFT leafOwner only.
 */
export async function connectParentSwigWallet(): Promise<SwigConnectResult> {
  const authority = ensureAuthorityKeypair();
  const idBase64 = ensureSwigId();

  const res = await fetch("/api/swig/wallet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      authorityPublicKey: authority.publicKey.toBase58(),
      idBase64,
    }),
  });

  const data = (await res.json()) as {
    walletAddress?: string;
    swigAddress?: string;
    created?: boolean;
    explorerUrl?: string;
    error?: string;
  };

  if (!res.ok || !data.walletAddress) {
    throw new Error(data.error || "Could not create Swig wallet.");
  }

  saveMintWallet(data.walletAddress);
  return {
    walletAddress: data.walletAddress,
    swigAddress: data.swigAddress ?? "",
    created: Boolean(data.created),
    explorerUrl: data.explorerUrl,
  };
}

export async function swigApiAvailable(): Promise<boolean> {
  try {
    const res = await fetch("/api/swig/wallet");
    if (!res.ok) return false;
    const data = (await res.json()) as { configured?: boolean };
    return Boolean(data.configured);
  } catch {
    return false;
  }
}

/** True when GET /api/mint reports Bubblegum minting is configured. */
export async function mintApiAvailable(): Promise<boolean> {
  try {
    const res = await fetch("/api/mint");
    if (!res.ok) return false;
    const data = (await res.json()) as { configured?: boolean };
    return Boolean(data.configured);
  } catch {
    return false;
  }
}
