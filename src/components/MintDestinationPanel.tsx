"use client";

import { useEffect, useState, type ReactNode } from "react";
import { t } from "@/lib/i18n";
import {
  connectParentSwigWallet,
  mintApiAvailable,
  swigApiAvailable,
} from "@/lib/swigClient";
import { loadSwigIdBase64 } from "@/lib/storage";

type Props = {
  lang: string;
  ownerAddress: string;
  onOwnerAddressChange: (value: string) => void;
  mintBusy: boolean;
  onMint: () => void;
  /** Extra controls under the mint button (e.g. celebrate "later"). */
  footer?: ReactNode;
  walletInputId: string;
};

export function MintDestinationPanel({
  lang,
  ownerAddress,
  onOwnerAddressChange,
  mintBusy,
  onMint,
  footer,
  walletInputId,
}: Props) {
  const [status, setStatus] = useState<"loading" | "ready" | "unconfigured">(
    "loading",
  );
  const [swigReady, setSwigReady] = useState(false);
  const [swigBusy, setSwigBusy] = useState(false);
  const [swigError, setSwigError] = useState<string | null>(null);
  const [showPaste, setShowPaste] = useState(false);
  const [swigLinked, setSwigLinked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([mintApiAvailable(), swigApiAvailable()]).then(
      ([mintOk, swigOk]) => {
        if (cancelled) return;
        setSwigReady(swigOk);
        setStatus(mintOk ? "ready" : "unconfigured");
        // Paste-only path when mint works but Swig create isn't available.
        if (mintOk && !swigOk) setShowPaste(true);
      },
    );
    setSwigLinked(Boolean(loadSwigIdBase64() && ownerAddress));
    return () => {
      cancelled = true;
    };
  }, [ownerAddress]);

  async function handleConnectSwig() {
    setSwigBusy(true);
    setSwigError(null);
    try {
      const result = await connectParentSwigWallet();
      onOwnerAddressChange(result.walletAddress);
      setSwigLinked(true);
      setShowPaste(false);
    } catch (err) {
      setSwigError(
        err instanceof Error ? err.message : t(lang, "swigConnectFail"),
      );
      setShowPaste(true);
    } finally {
      setSwigBusy(false);
    }
  }

  const busy = mintBusy || swigBusy;
  const hasOwner = Boolean(ownerAddress.trim());
  // Swig-first: keep paste collapsed until the judge asks, or Swig fails / isn't available.
  const showPasteField = status === "ready" && (!swigReady || showPaste);
  const canMint = status === "ready" && hasOwner && !busy;

  if (status === "loading") {
    return (
      <div className="mint-dest">
        <p className="hint soft mint-wallet-hint">{t(lang, "mintChecking")}</p>
      </div>
    );
  }

  if (status === "unconfigured") {
    return (
      <div className="mint-dest mint-unconfigured" role="status">
        <p className="mint-step-title">{t(lang, "mintNotConfiguredTitle")}</p>
        <p className="hint soft mint-wallet-hint">
          {t(lang, "mintNotConfiguredBody")}
        </p>
        {footer}
      </div>
    );
  }

  return (
    <div className="mint-dest">
      {swigReady ? (
        <div className="mint-step">
          <p className="mint-step-label">{t(lang, "mintStep1")}</p>
          <p className="hint soft mint-wallet-hint">{t(lang, "swigHint")}</p>
          <button
            type="button"
            className="primary-btn wide"
            onClick={() => void handleConnectSwig()}
            disabled={busy}
          >
            {swigBusy
              ? t(lang, "swigConnecting")
              : swigLinked
                ? t(lang, "swigReconnect")
                : t(lang, "swigConnect")}
          </button>
          {swigLinked && ownerAddress ? (
            <p className="mint-wallet-connected mono" title={ownerAddress}>
              {t(lang, "swigConnectedLabel")}: {ownerAddress.slice(0, 4)}…
              {ownerAddress.slice(-4)}
            </p>
          ) : null}
          {swigError ? (
            <p className="hint soft" role="alert">
              {swigError}
            </p>
          ) : null}
          <button
            type="button"
            className="ghost-btn wide mint-paste-toggle"
            onClick={() => setShowPaste((v) => !v)}
            disabled={busy}
          >
            {showPaste
              ? t(lang, "swigHidePaste")
              : t(lang, "swigShowPaste")}
          </button>
        </div>
      ) : (
        <p className="hint soft mint-wallet-hint">{t(lang, "mintWalletHint")}</p>
      )}

      {showPasteField && (
        <div className="mint-step">
          {!swigReady ? (
            <p className="mint-step-label">{t(lang, "mintStepWallet")}</p>
          ) : null}
          <label className="mint-wallet-label" htmlFor={walletInputId}>
            {t(lang, "mintWalletLabel")}
          </label>
          <input
            id={walletInputId}
            className="field mint-wallet-field"
            type="text"
            spellCheck={false}
            autoComplete="off"
            placeholder={t(lang, "mintWalletPlaceholder")}
            value={ownerAddress}
            onChange={(e) => {
              onOwnerAddressChange(e.target.value);
              setSwigLinked(false);
            }}
            disabled={busy}
          />
        </div>
      )}

      <div className="mint-step">
        <p className="mint-step-label">{t(lang, "mintStep2")}</p>
        <button
          type="button"
          className="primary-btn wide permanent"
          onClick={onMint}
          disabled={!canMint}
        >
          {mintBusy ? t(lang, "mintPending") : t(lang, "makePermanent")}
        </button>
        {!hasOwner && !busy ? (
          <p className="hint soft mint-wallet-hint">
            {swigReady
              ? t(lang, "mintNeedSwigFirst")
              : t(lang, "mintNeedWallet")}
          </p>
        ) : null}
      </div>
      {footer}
    </div>
  );
}
