import { NextResponse } from "next/server";
import { publicKey } from "@metaplex-foundation/umi";
import { getBadgeById } from "@/lib/badges";
import { mintBadgeCnft, onchainConfigured } from "@/lib/solana/onchain";

type MintBody = {
  badgeId?: string;
  ownerAddress?: string;
};

function isValidPubkey(value: string): boolean {
  try {
    publicKey(value);
    return true;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!onchainConfigured()) {
    return NextResponse.json(
      {
        error:
          "Solana minting is not configured. Set BADGE_MINTER_SECRET and BADGE_TREE.",
      },
      { status: 503 },
    );
  }

  let body: MintBody;
  try {
    body = (await request.json()) as MintBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const badgeId = body.badgeId?.trim();
  const ownerAddress =
    body.ownerAddress?.trim() || process.env.NEXT_PUBLIC_DEMO_OWNER?.trim();

  if (!badgeId) {
    return NextResponse.json({ error: "badgeId is required." }, { status: 400 });
  }
  if (!ownerAddress || !isValidPubkey(ownerAddress)) {
    return NextResponse.json(
      { error: "A valid Solana ownerAddress is required." },
      { status: 400 },
    );
  }

  const badge = getBadgeById(badgeId);
  if (!badge) {
    return NextResponse.json({ error: "Unknown badge." }, { status: 404 });
  }

  try {
    const signature = await mintBadgeCnft({
      badgeId: badge.id,
      badgeName: badge.name,
      ownerAddress,
    });
    return NextResponse.json({
      signature,
      explorerUrl: `https://explorer.solana.com/tx/${encodeURIComponent(signature)}?cluster=devnet`,
      ownerAddress,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Mint failed.";
    console.error("[mint]", message, err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    configured: onchainConfigured(),
    demoOwner: process.env.NEXT_PUBLIC_DEMO_OWNER ?? null,
    cluster: "devnet",
  });
}
