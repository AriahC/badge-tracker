"use client";

import Link from "next/link";
import { BadgeOrb } from "@/components/BadgeOrb";
import {
  CATEGORY_EMOJI,
  categoryColor,
  categoryImageSrc,
} from "@/lib/assets";
import { layoutClump } from "@/lib/clumpLayout";
import { badgeProgressRatio, isBadgeEarned } from "@/lib/progress";
import type { Badge, ProgressState } from "@/lib/types";

type BadgeClumpProps = {
  category: string;
  badges: Badge[];
  progress: ProgressState;
};

export function BadgeClump({ category, badges, progress }: BadgeClumpProps) {
  const color = categoryColor(category);
  const positions = layoutClump(badges.map((b) => b.id));
  const byId = new Map(badges.map((b) => [b.id, b]));
  const catImg = categoryImageSrc(category);

  return (
    <section className="clump" style={{ ["--clump-accent" as string]: color }}>
      <h2 className="clump-label">
        {catImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="clump-label-art"
            src={catImg}
            alt={category}
            width={120}
            height={72}
          />
        ) : (
          <>
            <span aria-hidden="true">{CATEGORY_EMOJI[category] ?? "🏅"}</span>
            {category}
          </>
        )}
      </h2>
      <div className="clump-field" aria-label={`${category} badges`}>
        {positions.map((pos) => {
          const badge = byId.get(pos.id);
          if (!badge) return null;
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
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                width: `${pos.size}rem`,
                ["--badge-color" as string]: color,
                ["--badge-tilt" as string]: `${pos.rotate}deg`,
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
