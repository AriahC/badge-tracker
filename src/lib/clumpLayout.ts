/** Deterministic layout so badge clumps don't jump between renders. */

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type ClumpPosition = {
  id: string;
  x: number; // percent 0–100
  y: number; // percent 0–100
  size: number; // rem
  rotate: number; // degrees
};

/**
 * Place badges in a loose cluster (not a grid, not page-wide scatter).
 * Seeded by badge ids so positions stay stable.
 * Larger sets use a multi-ring layout so official GS packs still fit.
 */
export function layoutClump(badgeIds: string[]): ClumpPosition[] {
  const seed = hashString(badgeIds.slice().sort().join("|"));
  const rand = mulberry32(seed);
  const count = badgeIds.length;
  const positions: ClumpPosition[] = [];

  // More badges → more rings and slightly smaller orbs
  const rings = count <= 4 ? 1 : count <= 10 ? 2 : count <= 18 ? 3 : 4;
  const sizeBase = count > 16 ? 4.35 : count > 10 ? 4.7 : 5.1;
  const minDist = count > 16 ? 16 : count > 10 ? 20 : 26;

  for (let i = 0; i < count; i++) {
    const id = badgeIds[i];
    const ring = i % rings;
    const indexInRing = Math.floor(i / rings);
    const inRingApprox = Math.ceil(count / rings);
    const angle =
      (indexInRing / Math.max(inRingApprox, 1)) * Math.PI * 2 +
      ring * 0.35 +
      rand() * 0.45;
    const radius =
      6 +
      ring * (count > 16 ? 14 : 18) +
      rand() * (count <= 2 ? 12 : 10);
    const cx = 50 + Math.cos(angle) * radius + (rand() - 0.5) * 6;
    const cy = 50 + Math.sin(angle) * radius * 0.92 + (rand() - 0.5) * 6;
    const size = sizeBase + rand() * 0.45;
    const rotate = (rand() - 0.5) * 10;

    positions.push({
      id,
      x: Math.min(88, Math.max(12, cx)),
      y: Math.min(88, Math.max(12, cy)),
      size,
      rotate,
    });
  }

  for (let pass = 0; pass < 6; pass++) {
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const a = positions[i];
        const b = positions[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy) || 0.01;
        if (dist < minDist) {
          const push = ((minDist - dist) / 2) * 0.7;
          const ux = dx / dist;
          const uy = dy / dist;
          a.x = Math.min(90, Math.max(10, a.x + ux * push));
          a.y = Math.min(90, Math.max(10, a.y + uy * push));
          b.x = Math.min(90, Math.max(10, b.x - ux * push));
          b.y = Math.min(90, Math.max(10, b.y - uy * push));
        }
      }
    }
  }

  return positions;
}

/** Suggested clump field height so large official packs don't clip. */
export function clumpFieldMinHeightRem(count: number): number {
  if (count <= 4) return 17;
  if (count <= 10) return 20;
  if (count <= 18) return 26;
  return Math.min(42, 18 + count * 0.85);
}
