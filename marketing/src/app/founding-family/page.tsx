"use client";

import Link from "next/link";
import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  Suspense,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import QRCode from "qrcode";
import { checkout, site } from "@/lib/copy";
import {
  FALLBACK_SOL_USD,
  MIN_USD,
  PRICE_SLIPPAGE,
  PUBLIC_SOLANA_RPC_URL,
  TREASURY_ADDRESS,
  buildSolanaPayTransferUrl,
} from "@/lib/solana-pay";

type Quote = {
  treasury: string;
  usd: number;
  solUsd: number;
  solAmount: number;
  lamports: number;
  note?: string;
  source?: string;
  approximate?: boolean;
  error?: string;
};

type SolanaProvider = {
  isPhantom?: boolean;
  publicKey?: { toBase58: () => string };
  connect: (opts?: {
    onlyIfTrusted?: boolean;
  }) => Promise<{ publicKey: { toBase58: () => string } }>;
  signAndSendTransaction: (
    transaction: Transaction,
  ) => Promise<{ signature: string }>;
};

function getProvider(): SolanaProvider | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    solana?: SolanaProvider;
    phantom?: { solana?: SolanaProvider };
  };
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
  const [quoteNotice, setQuoteNotice] = useState("");
  const [qrInlineError, setQrInlineError] = useState("");
  const [loading, setLoading] = useState(false);
  const [walletLabel, setWalletLabel] = useState<string | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [manualSig, setManualSig] = useState("");
  const [showManual, setShowManual] = useState(false);

  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [payUrl, setPayUrl] = useState<string | null>(null);
  const [qrStatus, setQrStatus] = useState<
    "idle" | "waiting" | "confirming" | "done"
  >("idle");
  const [hasInjectedWallet, setHasInjectedWallet] = useState(false);

  const usd = Math.max(MIN_USD, Number(usdInput) || MIN_USD);
  const formLocked =
    loading || qrStatus === "waiting" || qrStatus === "confirming";

  const pollCancelRef = useRef(false);
  const qrStartingRef = useRef(false);
  const referenceRef = useRef<string | null>(null);
  const payStartedUnixRef = useRef<number>(0);
  const expectedLamportsRef = useRef<number>(0);
  const emailRef = useRef(email);
  const nameRef = useRef(name);
  const consentsRef = useRef(consents);
  const marketingRef = useRef(marketing);
  const usdRef = useRef(usd);
  const quoteRef = useRef<Quote | null>(null);
  emailRef.current = email;
  nameRef.current = name;
  consentsRef.current = consents;
  marketingRef.current = marketing;
  usdRef.current = usd;
  quoteRef.current = quote;

  const refreshQuote = useCallback(async (amount: number) => {
    setQuoteLoading(true);
    try {
      const res = await fetch(
        `/api/checkout/quote?usd=${encodeURIComponent(amount)}`,
        { signal: AbortSignal.timeout(12000) },
      );
      const data = (await res.json()) as Quote;
      if (!res.ok || !data.lamports) {
        // Keep the last good quote so Show QR is never bricked by a refresh miss.
        setQuoteNotice(
          data.error ||
            "Could not refresh the live SOL quote. You can still show a QR; we'll retry when you tap.",
        );
        return;
      }
      setQuote(data);
      quoteRef.current = data;
      setQuoteNotice(
        data.approximate
          ? "SOL/USD is approximate right now. The QR still works — verification allows price slippage."
          : "",
      );
    } catch {
      setQuoteNotice(
        "Could not refresh the live SOL quote. You can still show a QR; we'll retry when you tap.",
      );
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

  useEffect(() => {
    setHasInjectedWallet(Boolean(getProvider()));
  }, []);

  useEffect(() => {
    return () => {
      pollCancelRef.current = true;
    };
  }, []);

  function toggleConsent(index: number) {
    setConsents((prev) => prev.map((v, i) => (i === index ? !v : v)));
  }

  function validateQuoteAmount(): string | null {
    if (usd < MIN_USD) {
      return `Founding Family contributions start at $${MIN_USD}.`;
    }
    return null;
  }

  function validateMembership(): string | null {
    const currentEmail = emailRef.current;
    if (!currentEmail.trim() || !currentEmail.includes("@")) {
      return "Please enter a valid adult email address.";
    }
    if (consentsRef.current.some((c) => !c)) {
      return "Please confirm all required acknowledgements.";
    }
    return null;
  }

  function validateForm(): string | null {
    return validateQuoteAmount() || validateMembership();
  }

  function quoteMatchesUsd(q: Quote | null, amount: number): q is Quote {
    return Boolean(
      q &&
        q.lamports > 0 &&
        Number.isFinite(q.lamports) &&
        Math.abs(q.usd - amount) < 0.005,
    );
  }

  async function loadQuoteForPayment(amount: number): Promise<Quote> {
    try {
      const quoteRes = await fetch(
        `/api/checkout/quote?usd=${encodeURIComponent(amount)}`,
        { signal: AbortSignal.timeout(20000) },
      );
      const q = (await quoteRes.json()) as Quote;
      if (quoteRes.ok && q.lamports) {
        setQuote(q);
        quoteRef.current = q;
        setQuoteNotice(
          q.approximate
            ? "SOL/USD is approximate right now. You can still pay — verification allows price slippage."
            : "",
        );
        return q;
      }
    } catch {
      // Fall through to last good quote.
    }

    const cached = quoteRef.current;
    if (quoteMatchesUsd(cached, amount)) {
      setQuoteNotice(
        "Using the last SOL quote. You can still pay — tap again if you want a fresh amount.",
      );
      return cached;
    }

    const quotePrice = FALLBACK_SOL_USD * (1 - PRICE_SLIPPAGE / 2);
    const lamports = Math.ceil((amount / quotePrice) * 1e9);
    const fallback: Quote = {
      treasury: TREASURY_ADDRESS,
      usd: amount,
      solUsd: quotePrice,
      solAmount: lamports / 1e9,
      lamports,
      approximate: true,
      source: "client-fallback",
    };
    setQuote(fallback);
    quoteRef.current = fallback;
    setQuoteNotice(
      "Using an approximate SOL amount so you can still pay. Verification allows price slippage.",
    );
    return fallback;
  }

  async function connectWallet() {
    setError("");
    const provider = getProvider();
    if (!provider) {
      setError(
        "No browser wallet detected. Use the QR code with Phantom (or another mobile Solana wallet), or install a browser extension.",
      );
      return;
    }
    try {
      const res = await provider.connect();
      const key = res.publicKey.toBase58();
      setWalletLabel(`${key.slice(0, 4)}…${key.slice(-4)}`);
      setHasInjectedWallet(true);
    } catch {
      setError("Wallet connection was canceled.");
    }
  }

  async function verifyAndRedirect(signature: string) {
    const currentEmail = emailRef.current.trim();
    const currentUsd = usdRef.current;
    const res = await fetch("/api/checkout/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        signature,
        email: currentEmail,
        name: nameRef.current.trim() || undefined,
        marketingOptIn: marketingRef.current,
        usd: currentUsd,
        referredByCode,
      }),
    });
    const data = (await res.json()) as { paid?: boolean; error?: string };
    if (!res.ok || !data.paid) {
      throw new Error(data.error || "Could not verify payment on Solana.");
    }
    const q = new URLSearchParams({
      signature,
      email: currentEmail,
      usd: String(currentUsd),
    });
    window.location.href = `/welcome/founding-family?${q.toString()}`;
  }

  async function findPaymentOnServer(opts?: {
    reference?: string | null;
    sinceUnix?: number;
    expectedLamports?: number;
  }): Promise<string | null> {
    const res = await fetch("/api/checkout/find", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reference: opts?.reference || undefined,
        sinceUnix: opts?.sinceUnix,
        expectedLamports: opts?.expectedLamports,
      }),
    });
    const data = (await res.json()) as {
      found?: boolean;
      signature?: string;
      error?: string;
    };
    if (!res.ok) {
      throw new Error(data.error || "Payment lookup failed.");
    }
    return data.found && data.signature ? data.signature : null;
  }

  async function startQrPayment() {
    if (qrStatus === "waiting" || qrStatus === "confirming") {
      return;
    }
    setError("");
    setQrInlineError("");
    const formError = validateForm();
    if (formError) {
      setQrInlineError(formError);
      return;
    }
    if (qrStartingRef.current) {
      return;
    }

    qrStartingRef.current = true;
    setLoading(true);
    pollCancelRef.current = false;

    try {
      const q = await loadQuoteForPayment(usd);
      expectedLamportsRef.current = q.lamports;

      const recipient = q.treasury || TREASURY_ADDRESS;
      const amountSol = (q.lamports / 1e9).toFixed(9);
      const reference = Keypair.generate().publicKey.toBase58();
      referenceRef.current = reference;
      payStartedUnixRef.current = Math.floor(Date.now() / 1000) - 15;

      const urlString = buildSolanaPayTransferUrl({
        recipient,
        amountSol,
        reference,
        label: "Veya Founding Family",
        message: `$${usd.toFixed(2)} early access — once the app is available`,
      });
      const dataUrl = await QRCode.toDataURL(urlString, {
        width: 320,
        margin: 2,
        color: { dark: "#1f3d2a", light: "#ffffff" },
      });

      setPayUrl(urlString);
      setQrDataUrl(dataUrl);
      setQrStatus("waiting");
      setShowManual(true);
      setLoading(false);
      qrStartingRef.current = false;

      // Poll via server (dedicated RPC) — not the browser public endpoint.
      // Also fall back to treasury scans: many wallets omit the Solana Pay
      // reference account, so reference-only polling never completes.
      for (let attempt = 0; ; attempt += 1) {
        if (pollCancelRef.current) return;

        try {
          const signature = await findPaymentOnServer({
            reference: referenceRef.current,
            sinceUnix: payStartedUnixRef.current,
            // After a few misses, loosen to any ≥ $1 treasury transfer.
            expectedLamports:
              attempt < 4 ? expectedLamportsRef.current : undefined,
          });

          if (signature) {
            setQrStatus("confirming");
            try {
              await verifyAndRedirect(signature);
              setQrStatus("done");
              return;
            } catch (verifyErr) {
              // Do not swallow verify failures inside the find loop.
              const message =
                verifyErr instanceof Error
                  ? verifyErr.message
                  : "Could not verify payment on Solana.";
              setError(
                `${message} If you already paid, paste your transaction signature below.`,
              );
              setQrStatus("waiting");
              setShowManual(true);
              // Keep polling — tx may still be indexing / price API may recover.
            }
          }
        } catch {
          // Transient find/RPC errors — keep waiting.
        }

        await new Promise((r) => setTimeout(r, 2500));
      }
    } catch (err) {
      const message =
        err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError")
          ? "Timed out loading the SOL quote. Tap again to retry."
          : err instanceof Error
            ? err.message
            : "Could not start QR payment.";
      setQrInlineError(message);
      setQrStatus("idle");
      setLoading(false);
      qrStartingRef.current = false;
    }
  }

  function cancelQrPayment() {
    pollCancelRef.current = true;
    qrStartingRef.current = false;
    setQrStatus("idle");
    setQrDataUrl(null);
    setPayUrl(null);
    setQrInlineError("");
    referenceRef.current = null;
    setLoading(false);
  }

  async function recheckPayment() {
    setError("");
    setQrInlineError("");
    const formError = validateForm();
    if (formError) {
      setQrInlineError(formError);
      setError(formError);
      return;
    }
    if (manualSig.trim()) {
      setLoading(true);
      try {
        await verifyAndRedirect(manualSig.trim());
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Could not verify that signature.",
        );
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    setQrStatus("confirming");
    try {
      const signature = await findPaymentOnServer({
        reference: referenceRef.current,
        sinceUnix: payStartedUnixRef.current || Math.floor(Date.now() / 1000) - 60 * 45,
        expectedLamports: expectedLamportsRef.current || undefined,
      });
      if (!signature) {
        setError(
          "No matching payment found yet. Keep this page open after paying, or paste the transaction signature from your wallet / explorer.",
        );
        setQrStatus(qrDataUrl ? "waiting" : "idle");
        setShowManual(true);
        setLoading(false);
        return;
      }
      await verifyAndRedirect(signature);
      setQrStatus("done");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not confirm payment. Paste your signature to recover.",
      );
      setQrStatus(qrDataUrl ? "waiting" : "idle");
      setShowManual(true);
      setLoading(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setQrInlineError("");

    const formError = validateForm();
    if (formError) {
      setError(formError);
      setQrInlineError(formError);
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
        setLoading(false);
        qrStartingRef.current = false;
        await startQrPayment();
        return;
      }

      const live = provider;
      const q = await loadQuoteForPayment(usd);
      expectedLamportsRef.current = q.lamports;

      const connection = new Connection(PUBLIC_SOLANA_RPC_URL, "confirmed");
      const from = new PublicKey(live.publicKey!.toBase58());
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
      setManualSig(signature);
      setShowManual(true);

      // Confirm is best-effort — public RPC often times out after a successful send.
      try {
        await connection.confirmTransaction(
          { signature, blockhash, lastValidBlockHeight },
          "confirmed",
        );
      } catch {
        // Fall through to verify; chain truth lives in /api/checkout/verify.
      }

      await verifyAndRedirect(signature);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Payment failed. Please try again.";
      setError(
        `${message} If the transfer already left your wallet, paste the signature below and verify.`,
      );
      setShowManual(true);
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
          Contribute as much as you&apos;d like in SOL — $1 minimum. That $1 gets
          early access to the app once it&apos;s available. Pay from a browser
          wallet or scan a QR with Phantom on your phone. One-time — not a
          subscription.
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
            Paid in SOL on Solana mainnet. Minimum ${MIN_USD} — contribute any
            amount above that.
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
              disabled={formLocked && !showManual}
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
              disabled={formLocked && !showManual}
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
              disabled={formLocked && !showManual}
            />
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.4rem",
                marginTop: "0.55rem",
              }}
            >
              {[1, 5, 10, 25, 50].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  className="btn btn-ghost"
                  style={{
                    minHeight: 36,
                    padding: "0.35rem 0.75rem",
                    fontSize: "0.9rem",
                    fontWeight: usd === amount ? 700 : 500,
                    borderColor:
                      usd === amount ? "var(--veya-forest)" : undefined,
                  }}
                  onClick={() => setUsdInput(String(amount))}
                  disabled={formLocked && !showManual}
                >
                  ${amount}
                </button>
              ))}
            </div>
            <p className="microcopy" style={{ marginTop: "0.45rem" }}>
              {quoteLoading
                ? "Updating SOL quote…"
                : quote
                  ? `≈ ${quote.solAmount.toFixed(6)} SOL at ~$${quote.solUsd.toFixed(2)}/SOL${quote.approximate ? " (approximate)" : ""}`
                  : `Minimum $${MIN_USD}.`}{" "}
              Enter any amount from ${MIN_USD} up — contribute as much as
              you&apos;d like. ${MIN_USD} gets early access once the app is
              available.
            </p>
            {quoteNotice ? (
              <p className="microcopy" style={{ marginTop: "0.35rem" }}>
                {quoteNotice}
              </p>
            ) : null}
          </div>

          {checkout.consents.map((label, index) => (
            <label key={label} className="consent">
              <input
                type="checkbox"
                checked={consents[index]}
                onChange={() => toggleConsent(index)}
                disabled={formLocked && !showManual}
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

          <div className="pay-placeholder">
            <strong style={{ color: "var(--veya-forest)" }}>
              Mobile wallet — scan to pay
            </strong>
            <p style={{ marginTop: "0.35rem" }}>
              Confirm the acknowledgements above, then show a Solana Pay QR.
              Open Phantom (or another Solana wallet) on your phone and scan it.
            </p>

            {qrInlineError ? (
              <p
                role="alert"
                style={{
                  marginTop: "0.75rem",
                  color: "#9b2c2c",
                  fontWeight: 600,
                }}
              >
                {qrInlineError}
              </p>
            ) : null}

            {qrDataUrl && (qrStatus === "waiting" || qrStatus === "confirming") ? (
              <div style={{ marginTop: "1rem", textAlign: "center" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrDataUrl}
                  alt="Solana Pay QR code — scan with your mobile wallet"
                  width={280}
                  height={280}
                  style={{
                    margin: "0 auto",
                    borderRadius: "0.75rem",
                    background: "#fff",
                  }}
                />
                <p className="microcopy" style={{ marginTop: "0.75rem" }}>
                  {qrStatus === "waiting"
                    ? "Waiting for payment… keep this page open after you scan."
                    : "Payment seen — confirming on Solana…"}
                </p>
                {payUrl ? (
                  <p style={{ marginTop: "0.5rem" }}>
                    <a
                      href={payUrl}
                      className="btn btn-secondary"
                      style={{ display: "inline-flex" }}
                    >
                      Open in wallet app
                    </a>
                  </p>
                ) : null}
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ marginTop: "0.5rem", width: "100%" }}
                  onClick={() => void recheckPayment()}
                  disabled={loading && qrStatus === "confirming"}
                >
                  I already paid — check again
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ marginTop: "0.5rem" }}
                  onClick={cancelQrPayment}
                >
                  Cancel QR payment
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-secondary"
                style={{ marginTop: "0.85rem", width: "100%" }}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  void startQrPayment();
                }}
              >
                {loading && qrStatus === "idle"
                  ? "Preparing QR…"
                  : "Show QR for mobile wallet"}
              </button>
            )}
          </div>

          <div className="pay-placeholder" role="note">
            <strong style={{ color: "var(--veya-forest)" }}>
              Browser wallet (optional)
            </strong>
            <p style={{ marginTop: "0.35rem" }}>
              {hasInjectedWallet
                ? "A Solana extension was detected. Connect it, then use Pay with Solana below."
                : "No browser extension detected — that’s fine. Use the QR above with your phone."}
            </p>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ marginTop: "0.85rem" }}
              onClick={() => void connectWallet()}
              disabled={formLocked && !showManual}
            >
              {walletLabel ? `Connected · ${walletLabel}` : "Connect browser wallet"}
            </button>
          </div>

          <label className="consent">
            <input
              type="checkbox"
              checked={marketing}
              onChange={(e) => setMarketing(e.target.checked)}
              disabled={formLocked && !showManual}
            />
            <span>{checkout.marketingOptIn}</span>
          </label>

          <button
            type="button"
            className="btn btn-ghost"
            style={{ width: "100%", fontSize: "0.9rem" }}
            onClick={() => setShowManual((v) => !v)}
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
                disabled={loading && qrStatus === "confirming"}
                autoComplete="off"
              />
              <button
                type="button"
                className="btn btn-secondary"
                style={{ marginTop: "0.65rem", width: "100%" }}
                onClick={() => void recheckPayment()}
                disabled={loading && qrStatus === "confirming"}
              >
                {manualSig.trim()
                  ? "Verify pasted signature →"
                  : "Re-check on-chain payment →"}
              </button>
            </div>
          ) : null}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%" }}
            disabled={
              qrStatus === "confirming" ||
              (qrStatus === "waiting" && !manualSig.trim()) ||
              (loading && !manualSig.trim())
            }
          >
            {loading
              ? "Confirming on Solana…"
              : showManual && manualSig.trim()
                ? "Verify payment →"
                : hasInjectedWallet
                  ? checkout.payCta
                  : "Pay with QR / wallet →"}
          </button>
          <p className="microcopy" style={{ textAlign: "center" }}>
            One-time SOL contribution · from ${MIN_USD} · give what you like ·
            early access when the app is available
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
