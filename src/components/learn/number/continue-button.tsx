"use client";

import { ArrowRight } from "lucide-react";
import type { NumberItem } from "@/types/number-item";
import { itemKey, useProgress } from "@/store/progress";
import { Button3D } from "@/components/ui/button-3d";
import type { Dictionary } from "@/lib/dictionaries/en";

interface ContinueButtonProps {
  items: NumberItem[];
  characterId: string;
  lessonId: string;
  basePath: string;
  tone: { face: string; edge: string };
  dict: Dictionary;
  className?: string;
}

/**
 * The CTA to the first open-and-unfinished number, looping back to the last
 * one once all nine are done.
 *
 * **The label carries three states, not just "Continue"**: before the first
 * number has ever been finished (nothing to continue yet) it reads "Start";
 * once every number has stars it reads "Next Lesson" (there is nowhere to
 * send that click yet — Letters/Colors are still statically locked in
 * `data/lessons.ts` — so it keeps pointing at `continueValue`, the same
 * replay-number-9 link "Continue" already used); anywhere in between it is
 * the ordinary "Continue".
 *
 * Its own tiny Client Component, deliberately NOT part of `NumberList` —
 * the desktop layout places it inline in a sticky sidebar while phone and
 * tablet place it in a fixed bottom bar, two unrelated parents in two
 * different JSX trees (see the numbers-lesson conventions in CLAUDE.md for
 * why the page forks like that). Duplicating the ~8 lines of progress
 * lookup here is cheaper and safer than threading `continueValue` down
 * through both trees from one shared source.
 */
export function ContinueButton({
  items,
  characterId,
  lessonId,
  basePath,
  tone,
  dict,
  className = "",
}: ContinueButtonProps) {
  const progress = useProgress((state) => state.items);
  const hydrated = useProgress((state) => state.hydrated);

  const starsFor = (value: number) =>
    hydrated
      ? (progress[itemKey(characterId, lessonId, value)]?.stars ?? 0)
      : 0;

  const nextValue = items.find((item, index) => {
    const previous = items[index - 1];
    const locked = previous ? starsFor(previous.value) === 0 : false;
    return !locked && starsFor(item.value) === 0;
  })?.value;

  const continueValue = nextValue ?? items[items.length - 1].value;

  /* Nothing is open past number 1 until number 1 itself has stars — the
     same condition the unlock check above already uses — so this is exactly
     "the only open number is number 1", the first-ever-play state. */
  const label =
    starsFor(items[0].value) === 0
      ? dict.lessonPicker.ctaStart
      : nextValue === undefined
        ? dict.lessonPicker.ctaNextLesson
        : dict.trail.ctaContinue;

  return (
    <Button3D
      href={`${basePath}/${continueValue}`}
      tone={{ face: tone.face, edge: tone.edge }}
      className={`flex items-center justify-center gap-2 ${className}`}
    >
      {label}
      <ArrowRight className="h-5 w-5" strokeWidth={2.75} />
    </Button3D>
  );
}
