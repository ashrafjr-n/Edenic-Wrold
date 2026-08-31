import type { CountActivityConfig } from "@/types/count-activity";

const DEFAULT_COUNT_ACTIVITY: CountActivityConfig = {
  icon: "/assets/icons/apple.png",
  itemLabel: "apple",
};

/** Per-number override for the `count` stage. Numbers 1 and 3 use the
    default (apples); the rest are decided one at a time as the journey for
    each number gets designed. */
const countActivityByValue: Record<number, CountActivityConfig> = {
  2: { icon: "/assets/icons/yellow-star.png", itemLabel: "star" },
};

export function countActivityFor(value: number): CountActivityConfig {
  return countActivityByValue[value] ?? DEFAULT_COUNT_ACTIVITY;
}
