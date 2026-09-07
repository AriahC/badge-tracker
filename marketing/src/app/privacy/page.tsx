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
        When payment is enabled, we will collect adult purchaser contact details
        needed to process the $1 early-access purchase and send transactional
        updates. Payment card details are handled by the payment provider and are
        not stored by Veya.
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
