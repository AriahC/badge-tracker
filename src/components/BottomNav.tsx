"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { uiAssetSrc } from "@/lib/assets";

type BottomNavProps = {
  homeLabel: string;
  notebookLabel: string;
  journalLabel: string;
};

function NavImg({
  name,
  active,
}: {
  name: "nav-home" | "nav-notebook" | "nav-journal";
  active: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={`nav-asset ${active ? "nav-asset-active" : ""}`}
      src={uiAssetSrc(name)}
      alt=""
      width={28}
      height={28}
      draggable={false}
    />
  );
}

function BottomNavInner({
  homeLabel,
  notebookLabel,
  journalLabel,
}: BottomNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const galleryView = searchParams.get("view");

  const onHome =
    pathname.startsWith("/home") || pathname.startsWith("/badge");
  const onJournal =
    pathname.startsWith("/journal") ||
    (pathname.startsWith("/gallery") && galleryView === "journal");
  const onNotebook =
    pathname.startsWith("/notebook") ||
    (pathname.startsWith("/gallery") && galleryView !== "journal");

  return (
    <nav className="bottom-nav" aria-label="Main">
      <Link href="/home" className={`nav-item ${onHome ? "nav-active" : ""}`}>
        <NavImg name="nav-home" active={onHome} />
        {homeLabel}
      </Link>
      <Link
        href="/notebook"
        className={`nav-item ${onNotebook ? "nav-active" : ""}`}
      >
        <NavImg name="nav-notebook" active={onNotebook} />
        {notebookLabel}
      </Link>
      <Link
        href="/journal"
        className={`nav-item ${onJournal ? "nav-active" : ""}`}
      >
        <NavImg name="nav-journal" active={onJournal} />
        {journalLabel}
      </Link>
    </nav>
  );
}

export function BottomNav(props: BottomNavProps) {
  return (
    <Suspense
      fallback={
        <nav className="bottom-nav" aria-label="Main">
          <span className="nav-item">{props.homeLabel}</span>
          <span className="nav-item">{props.notebookLabel}</span>
          <span className="nav-item">{props.journalLabel}</span>
        </nav>
      }
    >
      <BottomNavInner {...props} />
    </Suspense>
  );
}
