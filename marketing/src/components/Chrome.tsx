"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SproutMark } from "@/components/Icons";
import { announcement, navLinks } from "@/lib/copy";

export function AnnouncementBar() {
  return (
    <div className="announce">
      <Link href="/#founding-family">{announcement}</Link>
    </div>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link href="/" className="logo" aria-label="Veya home">
          <SproutMark className="logo-mark" />
          Veya
        </Link>

        <nav className="nav-desktop" aria-label="Primary">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
          <Link href="/founding-family" className="btn btn-primary">
            Get Early Access — $1
          </Link>
        </nav>

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {open ? (
              <path
                d="M6 6l12 12M18 6 6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </div>

      <div id="mobile-nav" className={`shell mobile-nav${open ? " open" : ""}`}>
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
            {link.label}
          </Link>
        ))}
        <Link
          href="/founding-family"
          className="btn btn-primary"
          style={{ width: "100%", marginTop: "0.85rem" }}
          onClick={() => setOpen(false)}
        >
          Get Early Access — $1
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <Link href="/" className="logo">
          <SproutMark className="logo-mark" />
          Veya
        </Link>
        <nav className="footer-links" aria-label="Footer">
          <Link href="/#why-veya">Why Veya</Link>
          <Link href="/#how-it-works">How It Works</Link>
          <Link href="/#our-story">Our Story</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/refunds">Refunds</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/parent-support">Parent Support</Link>
        </nav>
      </div>
      <div className="shell" style={{ marginTop: "1.75rem" }}>
        <p className="footer-note">
          Veya is an independent progress companion for Girl Scout families. It
          is not affiliated with or endorsed by Girl Scouts of the USA. Girl
          Scouts and related marks are the property of Girl Scouts of the USA.
        </p>
        <p className="footer-note" style={{ marginTop: "0.75rem" }}>
          Keep exploring.
        </p>
      </div>
    </footer>
  );
}

export function StickyMobileCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0.15 },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`sticky-cta${visible ? " visible" : ""}`}>
      <Link href="/founding-family" className="btn btn-primary">
        Early Access — $1
      </Link>
    </div>
  );
}
