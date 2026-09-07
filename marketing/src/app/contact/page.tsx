import { site } from "@/lib/copy";

export default function ContactPage() {
  return (
    <div className="shell section legal-prose">
      <div className="page-hero" style={{ paddingTop: 0 }}>
        <p className="eyebrow">SUPPORT</p>
        <h1>Contact</h1>
      </div>
      <p>
        Reach the adult-managed Veya inbox at{" "}
        <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>.
      </p>
      <p>
        Please do not include children&apos;s full legal names, precise locations,
        or other sensitive details unless necessary for support.
      </p>
    </div>
  );
}
