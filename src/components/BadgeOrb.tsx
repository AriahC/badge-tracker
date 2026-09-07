"use client";

import { badgeImageSrc } from "@/lib/assets";

export type BadgeOrbState = "not-started" | "in-progress" | "earned";

type BadgeOrbProps = {
  iconSlug: string;
  color: string;
  name: string;
  progress?: number;
  state?: BadgeOrbState;
  /** Fill the parent circle (Home clumps). */
  fill?: boolean;
  size?: number;
  showProgressRing?: boolean;
  /** Home: always colorful. Detail: pass false to grey→color with progress. */
  colorful?: boolean;
};

/** Renders your provided badge PNGs from /public/assets/badges. */
export function BadgeOrb({
  iconSlug,
  color,
  name,
  progress = 0,
  state = "not-started",
  fill = false,
  size = 72,
  showProgressRing = false,
  colorful = true,
}: BadgeOrbProps) {
  const src = badgeImageSrc(iconSlug);
  const ratio = state === "earned" ? 1 : Math.min(1, Math.max(0, progress));

  return (
    <span
      className={`badge-orb-wrap ${state === "earned" ? "is-earned" : ""}`}
      style={{
        width: fill ? "100%" : size,
        height: fill ? "100%" : size,
        ["--badge-color" as string]: color,
        ["--progress" as string]: String(colorful ? 1 : ratio),
      }}
    >
      {showProgressRing && state !== "earned" && (
        <span
          className="badge-progress-ring"
          style={{
            background: `conic-gradient(${color} ${ratio * 360}deg, rgba(220, 207, 184, 0.55) 0deg)`,
            mask: "radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 4px))",
            WebkitMask:
              "radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 4px))",
          }}
          aria-hidden="true"
        />
      )}
      <span className="badge-orb-face">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          className="badge-orb-img"
          draggable={false}
          style={
            colorful
              ? undefined
              : {
                  filter: `grayscale(${1 - ratio}) saturate(${0.35 + ratio * 0.65})`,
                  opacity: 0.6 + ratio * 0.4,
                }
          }
        />
      </span>
      <span className="sr-only">{name}</span>
    </span>
  );
}
