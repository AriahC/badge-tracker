import type { GirlScoutLevel } from "./types";

/** Map school grade to Girl Scout level. Grade 0 = Kindergarten. */
export function gradeToLevel(grade: number): GirlScoutLevel {
  if (grade <= 1) return "Daisy";
  if (grade <= 3) return "Brownie";
  if (grade <= 5) return "Junior";
  if (grade <= 8) return "Cadette";
  if (grade <= 10) return "Senior";
  return "Ambassador";
}

export const GRADE_OPTIONS: { value: number; labelKey: string }[] = [
  { value: 0, labelKey: "gradeK" },
  { value: 1, labelKey: "grade1" },
  { value: 2, labelKey: "grade2" },
  { value: 3, labelKey: "grade3" },
  { value: 4, labelKey: "grade4" },
  { value: 5, labelKey: "grade5" },
  { value: 6, labelKey: "grade6" },
  { value: 7, labelKey: "grade7" },
  { value: 8, labelKey: "grade8" },
  { value: 9, labelKey: "grade9" },
  { value: 10, labelKey: "grade10" },
  { value: 11, labelKey: "grade11" },
  { value: 12, labelKey: "grade12" },
];
