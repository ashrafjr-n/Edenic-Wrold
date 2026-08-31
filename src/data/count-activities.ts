import type { CountActivityConfig } from "@/types/count-activity";

const DEFAULT_COUNT_ACTIVITY: CountActivityConfig = {
  kind: "give",
  icon: "/assets/icons/apple.png",
  itemLabel: "apple",
};

/**
 * Per-number override for the `count` stage.
 *
 * 1 and 3 use the default (apples) — a target that small is exactly what the
 * give/drag tray was built for. 2 gives flowers instead, purely for variety.
 * From 4 up, giving breaks down (only 3 items in the tray), so each of those
 * numbers gets a different mini-activity, rotating through the three kinds
 * so no two neighbours repeat: complete → path → reveal → path → reveal →
 * complete.
 */
const countActivityByValue: Record<number, CountActivityConfig> = {
  2: {
    kind: "give",
    icon: "/assets/learn-with-pinki/other/blue-flower.png",
    itemLabel: "flower",
  },
  4: { kind: "complete" },
  5: { kind: "path", numbers: [3, 4, 5, 6, 7] },
  6: { kind: "reveal" },
  7: { kind: "path", numbers: [5, 6, 7, 8, 9] },
  8: { kind: "reveal" },
  9: { kind: "complete" },
};

export function countActivityFor(value: number): CountActivityConfig {
  return countActivityByValue[value] ?? DEFAULT_COUNT_ACTIVITY;
}
