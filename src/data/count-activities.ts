import type { CountActivityConfig } from "@/types/count-activity";

const DEFAULT_COUNT_ACTIVITY: CountActivityConfig = {
  kind: "give",
  icon: "/assets/icons/apple.png",
  itemLabel: { en: "apple", ar: "تفاحة", ku: "سێڤ" },
};

/**
 * Per-number override for the `count` stage.
 *
 * 1, 2 and 3 all use the default (apples) — a target that small is exactly
 * what the give/drag tray was built for. 2 handed over blue flowers for a
 * while, purely for variety; that was reverted on direct request, and
 * `other/blue-flower.png` is left in `public/` unused rather than deleted.
 * From 4 up, giving breaks down (only 3 items in the tray), so each of those
 * numbers gets a different mini-activity, rotating through the three kinds
 * so no two neighbours repeat: complete → path → colour → path → colour →
 * complete.
 */
const countActivityByValue: Record<number, CountActivityConfig> = {
  4: { kind: "complete" },
  5: { kind: "path", numbers: [3, 4, 5, 6, 7] },
  6: { kind: "color" },
  /* **Deliberately NOT centred, unlike every other `path` number** — with
     the target in the middle of a 5-number run it always lands on the same
     LEFT-hand stop the fixed zigzag (`NumberPath`'s `SLOTS`) happens to put
     there, which put 5 and 7 on the identical spot. Shifting the run so 7 is
     fourth rather than third moves it to the zigzag's next stop instead — a
     right-hand one — with no change to the shared geometry, which is still
     every other path number's. `large` is the other half of the same direct
     request: a bigger board just for this one. */
  7: { kind: "path", numbers: [4, 5, 6, 7, 8], large: true },
  8: { kind: "color" },
  9: { kind: "complete" },
};

export function countActivityFor(value: number): CountActivityConfig {
  return countActivityByValue[value] ?? DEFAULT_COUNT_ACTIVITY;
}
