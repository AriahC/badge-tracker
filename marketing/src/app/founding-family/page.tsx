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
  MIN_USD,
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

  const pollCancelRef = useRef(false);
  const referenceRef = useRef<PublicKey | null>(null);

  const usd = Math.max(MIN_USD, Number(usdInput) || MIN_USD);

  const refreshQuote = useCallback(async (amount: number) => {
    setQuoteLoading(true);
    try {
      const res = await fetch(
        `/api/checkout/quote?usd=${encodeURIComponent(amount)}`,
      );
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

  function validateForm(): string | null {
    if (!email.trim() || !email.includes("@")) {
      return "Please enter a valid adult email address.";
    }
    if (usd < MIN_USD) {
      return `Founding Family contributions start at $${MIN_USD}.`;
    }
    if (consents.some((c) => !c)) {
      return "Please confirm all required acknowledgements.";
    }
    return null;
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

  async function startQrPayment() {
    setError("");
    const formError = validateForm();
    if (formError) {
      setError(formError);
      return;
    }

    setLoading(true);
    pollCancelRef.current = false;

    try {
      const quoteRes = await fetch(
        `/api/checkout/quote?usd=${encodeURIComponent(usd)}`,
      );
      const q = (await quoteRes.json()) as Quote;
      if (!quoteRes.ok || !q.lamports) {
        throw new Error(q.error || "Could not refresh SOL quote.");
      }
      setQuote(q);

      const recipient = q.treasury || TREASURY_ADDRESS;
      const amountSol = (q.lamports / 1e9).toFixed(9);
      const reference = Keypair.generate().publicKey;
      referenceRef.current = reference;

      const urlString = buildSolanaPayTransferUrl({
        recipient,
        amountSol,
        reference: reference.toBase58(),
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
      setLoading(false);

      const connection = new Connection(PUBLIC_SOLANA_RPC_URL, "confirmed");

      // Solana Pay wallets include `reference` as a tx account key — poll until it appears.
      for (;;) {
        if (pollCancelRef.current) return;
        try {
          const sigs = await connection.getSignaturesForAddress(reference, {
            limit: 5,
          });
          const confirmed = sigs.find((s) => !s.err);
          if (confirmed) {
            setQrStatus("confirming");
            await verifyAndRedirect(confirmed.signature);
            setQrStatus("done");
            return;
          }
        } catch {
          // Transient RPC errors — keep waiting.
        }
        await new Promise((r) => setTimeout(r, 2500));
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not start QR payment.";
      setError(message);
      setQrStatus("idle");
      setLoading(false);
    }
  }

  function cancelQrPayment() {
    pollCancelRef.current = true;
    setQrStatus("idle");
    setQrDataUrl(null);
    setPayUrl(null);
    referenceRef.current = null;
    setLoading(false);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const formError = validateForm();
    if (formError) {
      setError(formError);
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
        // No extension — fall through to Solana Pay QR (mobile wallets).
        setLoading(false);
        await startQrPayment();
        return;
      }

      const live = provider;
      const quoteRes = await fetch(
        `/api/checkout/quote?usd=${encodeURIComponent(usd)}`,
      );
      const q = (await quoteRes.json()) as Quote;
      if (!quoteRes.ok || !q.lamports) {
        setError(q.error || "Could not refresh SOL quote.");
        setLoading(false);
        return;
      }
      setQuote(q);

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
              disabled={loading || qrStatus === "waiting" || qrStatus === "confirming"}
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
              disabled={loading || qrStatus === "waiting" || qrStatus === "confirming"}
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
              disabled={loading || qrStatus === "waiting" || qrStatus === "confirming"}
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
                  disabled={
                    loading || qrStatus === "waiting" || qrStatus === "confirming"
                  }
                >
                  ${amount}
                </button>
              ))}
            </div>
            <p className="microcopy" style={{ marginTop: "0.45rem" }}>
              {quoteLoading
                ? "Updating SOL quote…"
                : quote
                  ? `≈ ${quote.solAmount.toFixed(6)} SOL at ~$${quote.solUsd.toFixed(2)}/SOL`
                  : `Minimum $${MIN_USD}.`}{" "}
              Enter any amount from ${MIN_USD} up — contribute as much as
              you&apos;d like. ${MIN_USD} gets early access once the app is
              available.
            </p>
          </div>

          <div className="pay-placeholder" role="note">
            <strong style={{ color: "var(--veya-forest)" }}>
              Mobile wallet — scan to pay
            </strong>
            <p style={{ marginTop: "0.35rem" }}>
              Confirm the acknowledgements below, then show a Solana Pay QR.
              Open Phantom (or another Solana wallet) on your phone and scan it.
            </p>

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
                onClick={() => void startQrPayment()}
                disabled={loading || quoteLoading}
              >
                Show QR for mobile wallet
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
              disabled={loading || qrStatus === "waiting" || qrStatus === "confirming"}
            >
              {walletLabel ? `Connected · ${walletLabel}` : "Connect browser wallet"}
            </button>
          </div>

          {checkout.consents.map((label, index) => (
            <label key={label} className="consent">
              <input
                type="checkbox"
                checked={consents[index]}
                onChange={() => toggleConsent(index)}
                disabled={loading || qrStatus === "waiting" || qrStatus === "confirming"}
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
              disabled={loading || qrStatus === "waiting" || qrStatus === "confirming"}
            />
            <span>{checkout.marketingOptIn}</span>
          </label>

          <button
            type="button"
            className="btn btn-ghost"
            style={{ width: "100%", fontSize: "0.9rem" }}
            onClick={() => setShowManual((v) => !v)}
            disabled={loading || qrStatus === "waiting" || qrStatus === "confirming"}
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
            disabled={
              loading ||
              quoteLoading ||
              qrStatus === "waiting" ||
              qrStatus === "confirming"
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
