"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { checkout, site } from "@/lib/copy";
import { MIN_USD, TREASURY_ADDRESS } from "@/lib/solana-pay";

type Quote = {
  treasury: string;
  usd: number;
  solUsd: number;
  solAmount: number;
  lamports: number;
  note?: string;
  error?: string;
};

type SolanaProvider = {
  isPhantom?: boolean;
  publicKey?: { toBase58: () => string };
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toBase58: () => string } }>;
  signAndSendTransaction: (
    transaction: Transaction,
  ) => Promise<{ signature: string }>;
};

function getProvider(): SolanaProvider | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & { solana?: SolanaProvider; phantom?: { solana?: SolanaProvider } };
  return w.phantom?.solana ?? w.solana ?? null;
}

function FoundingFamilyInner() {
  const searchParams = useSearchParams();
  const referredByCode = searchParams.get("ref") ?? undefined;

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [usdInput, setUsdInput] = useState(String(MIN_USD));
  const [consents, setConsents] = useState([false, false, false]);
  const [marketing, setMarketing] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [walletLabel, setWalletLabel] = useState<string | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [manualSig, setManualSig] = useState("");
  const [showManual, setShowManual] = useState(false);

  const usd = Math.max(MIN_USD, Number(usdInput) || MIN_USD);

  const refreshQuote = useCallback(async (amount: number) => {
    setQuoteLoading(true);
    try {
      const res = await fetch(`/api/checkout/quote?usd=${encodeURIComponent(amount)}`);
      const data = (await res.json()) as Quote;
      if (!res.ok) {
        setQuote(null);
        setError(data.error || "Could not load SOL quote.");
        return;
      }
      setQuote(data);
      setError("");
    } catch {
      setQuote(null);
      setError("Could not load SOL quote. Please try again.");
    } finally {
      setQuoteLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void refreshQuote(usd);
    }, 280);
    return () => window.clearTimeout(t);
  }, [usd, refreshQuote]);

  function toggleConsent(index: number) {
    setConsents((prev) => prev.map((v, i) => (i === index ? !v : v)));
  }

  async function connectWallet() {
    setError("");
    const provider = getProvider();
    if (!provider) {
      setError(
        "No Solana wallet found. Install Phantom (or another Solana wallet), then refresh this page.",
      );
      setShowManual(true);
      return;
    }
    try {
      const res = await provider.connect();
      const key = res.publicKey.toBase58();
      setWalletLabel(`${key.slice(0, 4)}…${key.slice(-4)}`);
    } catch {
      setError("Wallet connection was canceled.");
    }
  }

  async function verifyAndRedirect(signature: string) {
    const res = await fetch("/api/checkout/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        signature,
        email: email.trim(),
        name: name.trim() || undefined,
        marketingOptIn: marketing,
        usd,
        referredByCode,
      }),
    });
    const data = (await res.json()) as { paid?: boolean; error?: string };
    if (!res.ok || !data.paid) {
      throw new Error(data.error || "Could not verify payment on Solana.");
    }
    const q = new URLSearchParams({
      signature,
      email: email.trim(),
      usd: String(usd),
    });
    window.location.href = `/welcome/founding-family?${q.toString()}`;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid adult email address.");
      return;
    }
    if (usd < MIN_USD) {
      setError(`Founding Family contributions start at $${MIN_USD}.`);
      return;
    }
    if (consents.some((c) => !c)) {
      setError("Please confirm all required acknowledgements.");
      return;
    }

    setLoading(true);
    try {
      if (showManual && manualSig.trim()) {
        await verifyAndRedirect(manualSig.trim());
        return;
      }

      const provider = getProvider();
      if (!provider?.publicKey) {
        await connectWallet();
        const again = getProvider();
        if (!again?.publicKey) {
          setError("Connect a Solana wallet to pay, or paste a transaction signature below.");
          setShowManual(true);
          setLoading(false);
          return;
        }
      }

      const live = getProvider();
      if (!live?.publicKey) {
        setError("Wallet not connected.");
        setLoading(false);
        return;
      }

      const quoteRes = await fetch(`/api/checkout/quote?usd=${encodeURIComponent(usd)}`);
      const q = (await quoteRes.json()) as Quote;
      if (!quoteRes.ok || !q.lamports) {
        setError(q.error || "Could not refresh SOL quote.");
        setLoading(false);
        return;
      }
      setQuote(q);

      const rpc =
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.trim() ||
        "https://api.mainnet-beta.solana.com";
      const connection = new Connection(rpc, "confirmed");
      const from = new PublicKey(live.publicKey.toBase58());
      const to = new PublicKey(q.treasury || TREASURY_ADDRESS);

      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash("confirmed");

      const transaction = new Transaction({
        feePayer: from,
        blockhash,
        lastValidBlockHeight,
      }).add(
        SystemProgram.transfer({
          fromPubkey: from,
          toPubkey: to,
          lamports: q.lamports,
        }),
      );

      const { signature } = await live.signAndSendTransaction(transaction);
      await connection.confirmTransaction(
        { signature, blockhash, lastValidBlockHeight },
        "confirmed",
      );
      await verifyAndRedirect(signature);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Payment failed. Please try again.";
      setError(message);
      setLoading(false);
    }
  }

  return (
    <div className="shell section">
      <div className="page-hero" style={{ paddingTop: 0 }}>
        <p className="eyebrow">FOUNDING FAMILY</p>
        <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.2rem)" }}>
          Pay with Solana
        </h1>
        <p className="lede" style={{ marginTop: "0.75rem" }}>
          Contribute $1 or more in SOL. Your $1 gets early access to the app once
          it&apos;s available. One-time — not a subscription. Parent or guardian
          checkout required.
        </p>
      </div>

      {error ? (
        <p
          role="status"
          className="card"
          style={{
            marginTop: "1rem",
            color: "#9b2c2c",
            fontWeight: 600,
          }}
        >
          {error}
        </p>
      ) : null}

      <div
        className="checkout-layout"
        style={{ display: "grid", gap: "1.25rem", marginTop: "1.5rem" }}
      >
        <aside className="offer-panel" style={{ padding: "1.4rem" }}>
          <h2 style={{ fontSize: "1.65rem" }}>{checkout.title}</h2>
          <p
            style={{
              marginTop: "0.45rem",
              fontWeight: 700,
              color: "var(--veya-forest)",
              fontSize: "1.15rem",
            }}
          >
            {checkout.price}
          </p>
          <ul className="check-list">
            {checkout.includes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="quiet">{site.developmentStatus}</p>
          <p className="quiet" style={{ marginTop: "0.5rem" }}>
            Paid in SOL on Solana mainnet. Minimum ${MIN_USD} USD equivalent.
          </p>
          <p
            className="microcopy"
            style={{ marginTop: "0.75rem", wordBreak: "break-all" }}
          >
            Treasury: {TREASURY_ADDRESS}
          </p>
        </aside>

        <form className="card form" onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="adult-email">Adult email address</label>
            <input
              id="adult-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="parent@example.com"
              disabled={loading}
            />
          </div>

          <div className="field">
            <label htmlFor="adult-name">Adult name (optional)</label>
            <input
              id="adult-name"
              name="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Preferred name"
              disabled={loading}
            />
          </div>

          <div className="field">
            <label htmlFor="usd-amount">Contribution (USD)</label>
            <input
              id="usd-amount"
              name="usd"
              type="number"
              min={MIN_USD}
              step="0.01"
              required
              value={usdInput}
              onChange={(e) => setUsdInput(e.target.value)}
              disabled={loading}
            />
            <p className="microcopy" style={{ marginTop: "0.35rem" }}>
              {quoteLoading
                ? "Updating SOL quote…"
                : quote
                  ? `≈ ${quote.solAmount.toFixed(6)} SOL at ~$${quote.solUsd.toFixed(2)}/SOL`
                  : `Minimum $${MIN_USD}.`}{" "}
              ${MIN_USD} gets early access once the app is available; you may contribute more.
            </p>
          </div>

          <div className="pay-placeholder" role="note">
            <strong style={{ color: "var(--veya-forest)" }}>
              Pay with a Solana wallet
            </strong>
            <p style={{ marginTop: "0.35rem" }}>
              Connect Phantom (or another Solana wallet) and send SOL to Veya&apos;s
              treasury. We confirm the transfer on-chain — no cards, no
              subscription.
            </p>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ marginTop: "0.85rem" }}
              onClick={() => void connectWallet()}
              disabled={loading}
            >
              {walletLabel ? `Connected · ${walletLabel}` : "Connect wallet"}
            </button>
          </div>

          {checkout.consents.map((label, index) => (
            <label key={label} className="consent">
              <input
                type="checkbox"
                checked={consents[index]}
                onChange={() => toggleConsent(index)}
                disabled={loading}
              />
              <span>
                {index === 2 ? (
                  <>
                    I agree to the{" "}
                    <Link href="/terms" style={{ textDecoration: "underline" }}>
                      Early Access Terms
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" style={{ textDecoration: "underline" }}>
                      Privacy Policy
                    </Link>
                    .
                  </>
                ) : (
                  label
                )}
              </span>
            </label>
          ))}

          <label className="consent">
            <input
              type="checkbox"
              checked={marketing}
              onChange={(e) => setMarketing(e.target.checked)}
              disabled={loading}
            />
            <span>{checkout.marketingOptIn}</span>
          </label>

          <button
            type="button"
            className="btn btn-ghost"
            style={{ width: "100%", fontSize: "0.9rem" }}
            onClick={() => setShowManual((v) => !v)}
            disabled={loading}
          >
            {showManual ? "Hide" : "Already sent SOL?"} Paste transaction signature
          </button>

          {showManual ? (
            <div className="field">
              <label htmlFor="tx-sig">Solana transaction signature</label>
              <input
                id="tx-sig"
                name="signature"
                type="text"
                value={manualSig}
                onChange={(e) => setManualSig(e.target.value)}
                placeholder="Paste signature from your wallet or explorer"
                disabled={loading}
                autoComplete="off"
              />
            </div>
          ) : null}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%" }}
            disabled={loading || quoteLoading}
          >
            {loading
              ? "Confirming on Solana…"
              : showManual && manualSig.trim()
                ? "Verify payment →"
                : checkout.payCta}
          </button>
          <p className="microcopy" style={{ textAlign: "center" }}>
            One-time SOL payment · ${MIN_USD}+ · early access when the app is available
          </p>
        </form>
      </div>
    </div>
  );
}

export default function FoundingFamilyPage() {
  return (
    <Suspense fallback={<div className="shell section">Loading checkout…</div>}>
      <FoundingFamilyInner />
    </Suspense>
  );
}
