import { site } from "@/lib/copy";

export default function RefundsPage() {
  return (
    <div className="shell section legal-prose">
      <div className="page-hero" style={{ paddingTop: 0 }}>
        <p className="eyebrow">LEGAL</p>
        <h1>Refunds</h1>
      </div>
      <p>
        If Veya cannot offer your family early access, the $1 will be refunded.
        Before launch, a parent may also request a refund by contacting{" "}
        <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>.
      </p>
      <p>
        Solana contributions are on-chain. Refunds, when approved, are arranged
        manually by contacting{" "}
        <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>.
      </p>
    </div>
  );
}
