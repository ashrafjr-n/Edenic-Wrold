"use client";

import type { CSSProperties } from "react";
import type { ItemKey } from "@/lib/progress-keys";
import { useProgress } from "@/store/progress";

interface ActivityCountBadgeProps {
  /** Every store key this activity is made of, in order. How many of them
      carry stars IS the count — the badge never takes a number it was told,
      so it can't drift from what the activity's own grid shows. */
  keys: ItemKey[];
  /** Reads out as "8 of 15 puzzles finished". */
  noun: string;
  /** The card's own hero colour, used for the count itself. */
  tint: string;
}

type BadgeVars = CSSProperties & { "--character-accent"?: string };

/**
 * "8 / 15" in the top-right corner of an Activities card.
 *
 * The Activities page used to be a title and a picture per activity and
 * nothing else — nothing on it said whether a child had played any of them.
 * This is the one element that gives the choosing page the same sense of
 * progress the activity's own level grid has.
 *
 * It is the `.counter-chip--quiet` the lesson hub already uses (white fill,
 * coloured count) rather than a new chip: on top of a photograph and a
 * colour wash, white is the only fill that stays readable whatever the
 * picture underneath is doing.
 *
 * **A Client Component, deliberately the ONLY one on these cards.** The cards
 * themselves stay Server Components and simply place this in their corner —
 * the store is what needs the browser, not the picture or the button.
 *
 * Renders `0 / n` until the store has read localStorage, which is exactly
 * what the server rendered; anything else is a hydration mismatch.
 */
export function ActivityCountBadge({
  keys,
  noun,
  tint,
}: ActivityCountBadgeProps) {
  const progress = useProgress((state) => state.items);
  const hydrated = useProgress((state) => state.hydrated);

  const done = hydrated
    ? keys.filter((key) => (progress[key]?.stars ?? 0) > 0).length
    : 0;

  return (
    <span
      className="counter-chip counter-chip--quiet absolute right-3 top-3 z-10 shadow-[0_8px_18px_-8px_rgb(var(--shadow-hue)/60%)] sm:right-4 sm:top-4"
      style={{ "--character-accent": tint } as BadgeVars}
      aria-label={`${done} of ${keys.length} ${noun} finished`}
    >
      {done} / {keys.length}
    </span>
  );
}
