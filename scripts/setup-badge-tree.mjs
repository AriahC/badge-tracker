/**
 * One-time setup for on-chain badges: creates the minter keypair (unless
 * BADGE_MINTER_SECRET is provided), requests a devnet airdrop, and creates
 * the Bubblegum merkle tree the badge cNFTs mint into.
 *
 *   npm run setup:badge-tree
 *
 * Prints env lines for .env.local / Vercel. Safe to re-run; only creates a
 * new tree when BADGE_TREE is not already set.
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { generateSigner, keypairIdentity, sol } from "@metaplex-foundation/umi";
import { createTree, mplBubblegum } from "@metaplex-foundation/mpl-bubblegum";
import bs58 from "bs58";

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

function upsertEnvLocal(pairs) {
  const path = ".env.local";
  const existing = existsSync(path) ? readFileSync(path, "utf8") : "";
  const lines = existing.split("\n");
  const keys = new Set(Object.keys(pairs));
  const kept = lines.filter((line) => {
    const eq = line.indexOf("=");
    if (eq === -1) return true;
    const key = line.slice(0, eq).trim();
    return !keys.has(key);
  });
  while (kept.length && kept[kept.length - 1] === "") kept.pop();
  kept.push("");
  for (const [k, v] of Object.entries(pairs)) {
    if (v == null || v === "") continue;
    kept.push(`${k}=${v}`);
  }
  kept.push("");
  writeFileSync(path, kept.join("\n"));
  console.log("Wrote Solana mint vars to .env.local");
}

const RPC = process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com";

async function main() {
  const umi = createUmi(RPC).use(mplBubblegum());

  let secret = process.env.BADGE_MINTER_SECRET;
  if (!secret) {
    const fresh = umi.eddsa.generateKeypair();
    secret = bs58.encode(fresh.secretKey);
    console.log("Generated a new minter keypair.");
  }
  const keypair = umi.eddsa.createKeypairFromSecretKey(bs58.decode(secret));
  umi.use(keypairIdentity(keypair));
  console.log(`Minter: ${keypair.publicKey}`);

  let demoOwner = process.env.NEXT_PUBLIC_DEMO_OWNER;
  if (!demoOwner) {
    const demo = umi.eddsa.generateKeypair();
    demoOwner = String(demo.publicKey);
    console.log(`Generated demo owner wallet: ${demoOwner}`);
  } else {
    console.log(`Demo owner (from env): ${demoOwner}`);
  }

  let balance = await umi.rpc.getBalance(keypair.publicKey);
  console.log(`Balance: ${Number(balance.basisPoints) / 1e9} SOL`);
  if (balance.basisPoints < 100_000_000n) {
    let funded = false;
    for (let attempt = 1; attempt <= 3 && !funded; attempt++) {
      console.log(`Requesting 1 SOL devnet airdrop (attempt ${attempt})…`);
      try {
        await umi.rpc.airdrop(keypair.publicKey, sol(1));
        funded = true;
        console.log("Airdrop landed.");
      } catch (e) {
        console.error(`Airdrop failed: ${e.message}`);
        await new Promise((r) => setTimeout(r, 4000));
      }
    }
    // Re-check in case the wallet was funded manually while airdrops failed.
    balance = await umi.rpc.getBalance(keypair.publicKey);
    console.log(`Balance after funding attempts: ${Number(balance.basisPoints) / 1e9} SOL`);
    if (balance.basisPoints < 50_000_000n) {
      console.log(
        `\nFund the minter manually, then re-run this script:\nhttps://faucet.solana.com/?address=${keypair.publicKey}\n`,
      );
      console.log(`NEXT_PUBLIC_DEMO_OWNER=${demoOwner}`);
      console.log(`SOLANA_RPC_URL=${RPC}`);
      console.log("(BADGE_MINTER_SECRET is already in .env.local — not reprinted.)");
      process.exit(1);
    }
  }

  let tree = process.env.BADGE_TREE;
  if (tree) {
    console.log(`BADGE_TREE already set (${tree}); not creating a new tree.`);
  } else {
    const merkleTree = generateSigner(umi);
    console.log("Creating merkle tree…");
    const builder = await createTree(umi, {
      merkleTree,
      maxDepth: 14,
      maxBufferSize: 64,
      public: false,
    });
    await builder.sendAndConfirm(umi);
    tree = String(merkleTree.publicKey);
    console.log("Tree created.");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  upsertEnvLocal({
    BADGE_MINTER_SECRET: secret,
    BADGE_TREE: tree,
    NEXT_PUBLIC_DEMO_OWNER: demoOwner,
    SOLANA_RPC_URL: RPC,
    NEXT_PUBLIC_APP_URL: appUrl,
  });

  console.log("\nEnv ready (also written to .env.local):");
  console.log(`BADGE_TREE=${tree}`);
  console.log(`BADGE_MINTER_SECRET=${secret}`);
  console.log(`NEXT_PUBLIC_DEMO_OWNER=${demoOwner}`);
  console.log(`SOLANA_RPC_URL=${RPC}`);
  console.log(`NEXT_PUBLIC_APP_URL=${appUrl}`);
  console.log("\nRestart `npm run dev`, then: npm run mint:smoke");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
