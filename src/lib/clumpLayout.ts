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
 */
export function layoutClump(badgeIds: string[]): ClumpPosition[] {
  const seed = hashString(badgeIds.slice().sort().join("|"));
  const rand = mulberry32(seed);
  const count = badgeIds.length;

  // Clump stays in the middle of the field with gentle scatter.
  const positions: ClumpPosition[] = [];

  for (let i = 0; i < count; i++) {
    const id = badgeIds[i];
    const angle = (i / Math.max(count, 1)) * Math.PI * 2 + rand() * 0.7;
    const radius = 10 + rand() * (count <= 2 ? 14 : 22);
    const cx = 50 + Math.cos(angle) * radius + (rand() - 0.5) * 8;
    const cy = 48 + Math.sin(angle) * radius * 0.85 + (rand() - 0.5) * 8;
    const size = 5.1 + rand() * 0.55;
    const rotate = (rand() - 0.5) * 10;

    positions.push({
      id,
      x: Math.min(82, Math.max(18, cx)),
      y: Math.min(72, Math.max(28, cy)),
      size,
      rotate,
    });
  }

  // Tiny collision nudge so icons don't fully stack.
  for (let pass = 0; pass < 4; pass++) {
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const a = positions[i];
        const b = positions[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy) || 0.01;
        const minDist = 26;
        if (dist < minDist) {
          const push = ((minDist - dist) / 2) * 0.65;
          const ux = dx / dist;
          const uy = dy / dist;
          a.x = Math.min(84, Math.max(16, a.x + ux * push));
          a.y = Math.min(74, Math.max(26, a.y + uy * push));
          b.x = Math.min(84, Math.max(16, b.x - ux * push));
          b.y = Math.min(74, Math.max(26, b.y - uy * push));
        }
      }
    }
  }

  return positions;
}
