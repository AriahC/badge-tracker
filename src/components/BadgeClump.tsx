"use client";

import Link from "next/link";
import { BadgeOrb } from "@/components/BadgeOrb";
import {
  CATEGORY_EMOJI,
  categoryColor,
  categoryImageSrc,
} from "@/lib/assets";
import { badgeProgressRatio, isBadgeEarned } from "@/lib/progress";
import type { Badge, ProgressState } from "@/lib/types";

type BadgeClumpProps = {
  category: string;
  badges: Badge[];
  progress: ProgressState;
};

/** Small stable tilt so orbs still feel playful without overlapping. */
function tiltForId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i) * (i + 1)) % 11;
  return h - 5;
}

export function BadgeClump({ category, badges, progress }: BadgeClumpProps) {
  const color = categoryColor(category);
  const catImg = categoryImageSrc(category);
  const ordered = [...badges].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
  );

  return (
    <section className="clump" style={{ ["--clump-accent" as string]: color }}>
      <h2 className="clump-label">
        {catImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="clump-label-art"
            src={catImg}
            alt=""
            width={120}
            height={72}
          />
        ) : null}
        <span aria-hidden="true">{CATEGORY_EMOJI[category] ?? "🏅"}</span>
        {category}
      </h2>
      <div className="clump-field" aria-label={`${category} badges`}>
        {ordered.map((badge) => {
          const ratio = badgeProgressRatio(badge, progress);
          const earned = isBadgeEarned(badge.id, progress);
          const state = earned
            ? "earned"
            : ratio > 0
              ? "in-progress"
              : "not-started";

          return (
            <Link
              key={badge.id}
              href={`/badge/${badge.id}`}
              className={`badge-orb ${earned ? "badge-earned" : ""}`}
              style={{
                ["--badge-color" as string]: color,
                ["--badge-tilt" as string]: `${tiltForId(badge.id)}deg`,
              }}
              aria-label={`${badge.name}, ${Math.round(ratio * 100)}% complete`}
            >
              <BadgeOrb
                iconSlug={badge.iconSlug}
                color={color}
                name={badge.name}
                progress={ratio}
                state={state}
                fill
                colorful
              />
              <span className="badge-orb-name">{badge.name}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
