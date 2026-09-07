import Link from "next/link";
import { site } from "@/lib/copy";

export default function ParentSupportPage() {
  return (
    <div className="shell section legal-prose">
      <div className="page-hero" style={{ paddingTop: 0 }}>
        <p className="eyebrow">SUPPORT</p>
        <h1>Parent Support</h1>
      </div>
      <p>
        Parents and guardians manage Founding Family purchases and future family
        accounts. For help with early access, refunds, or privacy requests, email{" "}
        <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>.
      </p>
      <p>
        Related pages: <Link href="/faq">FAQ</Link>,{" "}
        <Link href="/privacy">Privacy</Link>, <Link href="/refunds">Refunds</Link>.
      </p>
    </div>
  );
}
