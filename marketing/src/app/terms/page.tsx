import { site } from "@/lib/copy";

export default function TermsPage() {
  return (
    <div className="shell section legal-prose">
      <div className="page-hero" style={{ paddingTop: 0 }}>
        <p className="eyebrow">LEGAL</p>
        <h1>Early Access Terms</h1>
      </div>
      <p>
        Draft terms for the $1 Founding Family early-access pass. Final wording
        should be reviewed by a responsible adult and counsel before charging.
      </p>
      <h2>The offer</h2>
      <p>
        The Founding Family pass is a one-time $1 early-access purchase. It is not
        a subscription and does not purchase Girl Scout membership, official
        badges, or guaranteed launch timing.
      </p>
      <h2>Development status</h2>
      <p>{site.developmentStatus}</p>
      <h2>Contact</h2>
      <p>
        <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>
      </p>
    </div>
  );
}
