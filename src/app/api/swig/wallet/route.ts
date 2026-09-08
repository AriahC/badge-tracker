import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import {
  ensureSwigWallet,
  swigCreateConfigured,
} from "@/lib/solana/swig";

type Body = {
  authorityPublicKey?: string;
  idBase64?: string;
};

function isValidPubkey(value: string): boolean {
  try {
    // eslint-disable-next-line no-new
    new PublicKey(value);
    return true;
  } catch {
    return false;
  }
}

function isValidIdBase64(value: string): boolean {
  try {
    return Buffer.from(value, "base64").length === 32;
  } catch {
    return false;
  }
}

export async function GET() {
  return NextResponse.json({
    configured: swigCreateConfigured(),
    cluster: "devnet",
  });
}

export async function POST(request: Request) {
  if (!swigCreateConfigured()) {
    return NextResponse.json(
      {
        error:
          "Swig wallet creation is not configured. Set BADGE_MINTER_SECRET so the app can pay create fees.",
      },
      { status: 503 },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const authorityPublicKey = body.authorityPublicKey?.trim() ?? "";
  const idBase64 = body.idBase64?.trim() ?? "";

  if (!authorityPublicKey || !isValidPubkey(authorityPublicKey)) {
    return NextResponse.json(
      { error: "A valid authorityPublicKey is required." },
      { status: 400 },
    );
  }
  if (!idBase64 || !isValidIdBase64(idBase64)) {
    return NextResponse.json(
      { error: "idBase64 must decode to 32 bytes." },
      { status: 400 },
    );
  }

  try {
    const result = await ensureSwigWallet({ authorityPublicKey, idBase64 });
    return NextResponse.json({
      ...result,
      explorerUrl: result.signature
        ? `https://explorer.solana.com/tx/${encodeURIComponent(result.signature)}?cluster=devnet`
        : `https://explorer.solana.com/address/${encodeURIComponent(result.swigAddress)}?cluster=devnet`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Swig create failed.";
    console.error("[swig/wallet]", message, err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
