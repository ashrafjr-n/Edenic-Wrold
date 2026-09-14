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
 * The "Continue" CTA to the first open-and-unfinished number, looping back
 * to the last one once all nine are done.
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

  return (
    <Button3D
      href={`${basePath}/${continueValue}`}
      tone={{ face: tone.face, edge: tone.edge }}
      className={`flex items-center justify-center gap-2 ${className}`}
    >
      {dict.trail.ctaContinue}
      <ArrowRight className="h-5 w-5" strokeWidth={2.75} />
    </Button3D>
  );
}
