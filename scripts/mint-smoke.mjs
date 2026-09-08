/**
 * Smoke-test one badge mint against the local API (or a deployed origin).
 *
 *   node scripts/mint-smoke.mjs [badgeId]
 *
 * Requires .env.local with BADGE_MINTER_SECRET + BADGE_TREE, and a running
 * `npm run dev` (or set MINT_SMOKE_URL).
 */
import { existsSync, readFileSync } from "fs";

if (existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const eq = line.indexOf("=");
    if (eq === -1 || line.trim().startsWith("#")) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    process.env[key] ??= val;
  }
}

const base = process.env.MINT_SMOKE_URL ?? "http://localhost:3000";
const badgeId = process.argv[2] ?? "daisy--outdoor-art-maker";
const owner =
  process.env.NEXT_PUBLIC_DEMO_OWNER ??
  process.env.MINT_SMOKE_OWNER;

async function main() {
  const statusRes = await fetch(`${base}/api/mint`);
  const status = await statusRes.json();
  console.log("Mint status:", status);

  const metaRes = await fetch(
    `${base}/api/badge-meta/${encodeURIComponent(badgeId)}`,
  );
  console.log("Meta status:", metaRes.status);
  if (!metaRes.ok) {
    console.error(await metaRes.text());
    process.exit(1);
  }
  console.log("Meta:", await metaRes.json());

  if (!status.configured) {
    console.error(
      "Not configured — run npm run setup:badge-tree and fund the minter.",
    );
    process.exit(1);
  }
  if (!owner) {
    console.error("Set NEXT_PUBLIC_DEMO_OWNER in .env.local");
    process.exit(1);
  }

  console.log(`Minting ${badgeId} → ${owner}…`);
  const mintRes = await fetch(`${base}/api/mint`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ badgeId, ownerAddress: owner }),
  });
  const body = await mintRes.json();
  console.log("Mint response:", mintRes.status, body);
  if (!mintRes.ok || !body.signature) process.exit(1);
  console.log("Explorer:", body.explorerUrl);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
