import { site } from "@/lib/copy";

export default function PrivacyPage() {
  return (
    <div className="shell section legal-prose">
      <div className="page-hero" style={{ paddingTop: 0 }}>
        <p className="eyebrow">LEGAL</p>
        <h1>Privacy Policy</h1>
      </div>
      <p>
        This is a draft placeholder for counsel review. It describes the intended
        direction for Veya&apos;s public Founding Family site.
      </p>
      <h2>What we collect on this site</h2>
      <p>
        We collect adult purchaser contact details needed to record the Founding
        Family contribution and send transactional updates. Payments are made in
        SOL on Solana to Veya&apos;s treasury wallet; Veya does not collect or store
        card details.
      </p>
      <h2>Children</h2>
      <p>
        We do not ask for a child&apos;s name, birthday, school, troop number, or
        photograph during Founding Family checkout.
      </p>
      <h2>Contact</h2>
      <p>
        Privacy questions:{" "}
        <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>
      </p>
    </div>
  );
}
