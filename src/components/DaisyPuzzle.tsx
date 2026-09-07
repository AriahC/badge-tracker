"use client";

import { useMemo, useState } from "react";

type Flower = {
  id: number;
  kind: "daisy" | "tulip" | "rose";
  x: number;
  y: number;
};

type DaisyPuzzleProps = {
  onPass: () => void;
  hint: string;
  wrong: string;
  done: string;
  passed: boolean;
};

const FLOWERS: Flower[] = [
  { id: 1, kind: "daisy", x: 12, y: 18 },
  { id: 2, kind: "tulip", x: 48, y: 10 },
  { id: 3, kind: "rose", x: 78, y: 22 },
  { id: 4, kind: "daisy", x: 28, y: 55 },
  { id: 5, kind: "tulip", x: 62, y: 48 },
  { id: 6, kind: "daisy", x: 82, y: 62 },
  { id: 7, kind: "rose", x: 18, y: 78 },
];

const DAISY_IDS = FLOWERS.filter((f) => f.kind === "daisy").map((f) => f.id);

export function DaisyPuzzle({
  onPass,
  hint,
  wrong,
  done,
  passed,
}: DaisyPuzzleProps) {
  const [selected, setSelected] = useState<number[]>([]);
  const [message, setMessage] = useState(hint);

  const icons = useMemo(
    () => ({
      daisy: "🌼",
      tulip: "🌷",
      rose: "🌹",
    }),
    [],
  );

  function toggle(id: number) {
    if (passed) return;
    const next = selected.includes(id)
      ? selected.filter((s) => s !== id)
      : [...selected, id];
    setSelected(next);

    const daisySet = new Set(DAISY_IDS);
    const pickedDaisies = next.filter((n) => daisySet.has(n));
    const pickedOthers = next.filter((n) => !daisySet.has(n));

    if (pickedOthers.length > 0) {
      setMessage(wrong);
      return;
    }

    if (pickedDaisies.length === DAISY_IDS.length) {
      setMessage(done);
      onPass();
      return;
    }

    setMessage(hint);
  }

  return (
    <div className="puzzle">
      <p className="puzzle-hint">{message}</p>
      <div className="puzzle-field" role="group" aria-label={hint}>
        {FLOWERS.map((flower) => {
          const isOn = selected.includes(flower.id);
          return (
            <button
              key={flower.id}
              type="button"
              className={`flower ${isOn ? "flower-on" : ""} ${passed && flower.kind === "daisy" ? "flower-done" : ""}`}
              style={{ left: `${flower.x}%`, top: `${flower.y}%` }}
              onClick={() => toggle(flower.id)}
              aria-pressed={isOn}
              aria-label={flower.kind}
              disabled={passed}
            >
              {icons[flower.kind]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
