import { NextResponse } from "next/server";
import { badgeImageSrc } from "@/lib/assets";
import { getBadgeById } from "@/lib/badges";

/** NFT metadata for badge cNFTs — public so explorers can fetch without auth. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const badge = getBadgeById(decodeURIComponent(id));
  if (!badge) {
    return NextResponse.json({ error: "unknown badge" }, { status: 404 });
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://badge-tracker-two.vercel.app";
  const imagePath = badgeImageSrc(badge.iconSlug).split("?")[0];

  return NextResponse.json(
    {
      name: `Badge Journey: ${badge.name}`,
      symbol: "BJRN",
      image: `${appUrl}${imagePath}`,
      description: `${badge.description} Earned in Badge Journey — Girl Scout badge tracking for families.`,
      attributes: [
        { trait_type: "Badge", value: badge.name },
        { trait_type: "Level", value: badge.level },
        { trait_type: "Category", value: badge.category },
      ],
      external_url: appUrl,
    },
    { headers: { "Cache-Control": "public, max-age=3600" } },
  );
}
