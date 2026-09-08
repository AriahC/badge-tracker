/**
 * Polls until the minter has SOL, then creates BADGE_TREE and updates .env.local.
 *
 *   node scripts/wait-and-setup-tree.mjs
 *
 * Open the printed faucet URL (GitHub sign-in helps) while this waits.
 */
import { spawn } from "child_process";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { keypairIdentity } from "@metaplex-foundation/umi";
import bs58 from "bs58";

function loadEnvLocal() {
  if (!existsSync(".env.local")) return;
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
    kept.push(`${k}=${v}`);
  }
  kept.push("");
  writeFileSync(path, kept.join("\n"));
}

loadEnvLocal();

const RPC = process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com";
const secret = process.env.BADGE_MINTER_SECRET;
if (!secret) {
  console.error("BADGE_MINTER_SECRET missing. Run: npm run setup:badge-tree");
  process.exit(1);
}

const umi = createUmi(RPC);
const keypair = umi.eddsa.createKeypairFromSecretKey(bs58.decode(secret));
umi.use(keypairIdentity(keypair));
const pubkey = String(keypair.publicKey);

console.log(`Minter: ${pubkey}`);
console.log(`Faucet: https://faucet.solana.com/?address=${pubkey}`);
console.log("Waiting for ≥0.1 SOL… (Ctrl+C to stop)\n");

async function balanceLamports() {
  const bal = await umi.rpc.getBalance(keypair.publicKey);
  return Number(bal.basisPoints);
}

async function main() {
  for (;;) {
    let lamports = 0;
    try {
      lamports = await balanceLamports();
    } catch (e) {
      console.error(`Balance check failed: ${e.message}`);
    }
    console.log(
      `[${new Date().toISOString()}] balance=${(lamports / 1e9).toFixed(4)} SOL`,
    );
    if (lamports >= 100_000_000) {
      console.log("Funded — running setup:badge-tree…");
      await new Promise((resolve, reject) => {
        const child = spawn("npm", ["run", "setup:badge-tree"], {
          stdio: "inherit",
          shell: process.platform === "win32",
        });
        child.on("exit", (code) =>
          code === 0 ? resolve() : reject(new Error(`setup exited ${code}`)),
        );
      });
      // Re-load so we can persist BADGE_TREE if the setup printed it into env
      loadEnvLocal();
      if (process.env.BADGE_TREE) {
        upsertEnvLocal({
          BADGE_MINTER_SECRET: secret,
          BADGE_TREE: process.env.BADGE_TREE,
          NEXT_PUBLIC_DEMO_OWNER:
            process.env.NEXT_PUBLIC_DEMO_OWNER ?? "",
          SOLANA_RPC_URL: RPC,
          NEXT_PUBLIC_APP_URL:
            process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        });
        console.log("Updated .env.local with BADGE_TREE.");
      } else {
        console.log(
          "Setup finished — if BADGE_TREE was printed, paste it into .env.local and restart the dev server.",
        );
      }
      return;
    }
    await new Promise((r) => setTimeout(r, 15_000));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
