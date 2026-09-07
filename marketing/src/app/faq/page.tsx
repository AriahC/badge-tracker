import Link from "next/link";
import { faqItems } from "@/lib/copy";

export default function FaqPage() {
  return (
    <div className="shell section">
      <div className="page-hero" style={{ paddingTop: 0 }}>
        <p className="eyebrow">FAQ</p>
        <h1>Questions families ask</h1>
        <p className="lede" style={{ marginTop: "0.85rem" }}>
          Clear answers about Veya, the $1 Founding Family offer, and how we relate
          to programs families already love.
        </p>
      </div>

      <div className="faq-list">
        {faqItems.map((item) => (
          <details key={item.q} className="faq-item">
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>

      <p style={{ marginTop: "2rem" }}>
        <Link href="/founding-family" className="btn btn-primary">
          Become a Founding Family — $1 →
        </Link>
      </p>
    </div>
  );
}
