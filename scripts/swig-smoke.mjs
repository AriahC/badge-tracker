/**
 * Smoke-test Swig wallet create on Solana devnet.
 *
 * Prefers BADGE_MINTER_SECRET from .env.local when present (funded minter).
 * Otherwise tries a throwaway airdrop (often rate-limited).
 *
 *   npm run swig:smoke
 */
import { createRequire } from "module";
import { existsSync, readFileSync } from "fs";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import bs58 from "bs58";

const require = createRequire(import.meta.url);
const {
  Actions,
  createEd25519AuthorityInfo,
  fetchNullableSwig,
  findSwigPda,
  getCreateSwigInstruction,
  getSwigWalletAddress,
} = require("@swig-wallet/classic");

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

const rpc = process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com";
const connection = new Connection(rpc, "confirmed");
const authority = Keypair.generate();

let payer;
if (process.env.BADGE_MINTER_SECRET) {
  payer = Keypair.fromSecretKey(bs58.decode(process.env.BADGE_MINTER_SECRET));
  console.log(`Using BADGE_MINTER_SECRET payer: ${payer.publicKey.toBase58()}`);
} else {
  payer = Keypair.generate();
  console.log(`Temp payer: ${payer.publicKey.toBase58()}`);
  const air = await connection.requestAirdrop(
    payer.publicKey,
    2 * LAMPORTS_PER_SOL,
  );
  const latest = await connection.getLatestBlockhash();
  await connection.confirmTransaction(
    { signature: air, ...latest },
    "confirmed",
  );
  console.log("Airdrop confirmed.");
}

const bal = await connection.getBalance(payer.publicKey);
console.log(`Payer balance: ${bal / LAMPORTS_PER_SOL} SOL`);

const id = crypto.getRandomValues(new Uint8Array(32));
const swigAddress = findSwigPda(id);
const ix = await getCreateSwigInstruction({
  payer: payer.publicKey,
  id,
  actions: Actions.set().all().get(),
  authorityInfo: createEd25519AuthorityInfo(authority.publicKey),
});
const sig = await sendAndConfirmTransaction(
  connection,
  new Transaction().add(ix),
  [payer],
  { commitment: "confirmed" },
);

const swig = await fetchNullableSwig(connection, swigAddress);
if (!swig) throw new Error("Swig account missing after create");
const wallet = await getSwigWalletAddress(swig);

console.log(`Swig config:  ${swigAddress.toBase58()}`);
console.log(`Wallet PDA:   ${wallet.toBase58()}`);
console.log(
  `Create tx:    https://explorer.solana.com/tx/${sig}?cluster=devnet`,
);
