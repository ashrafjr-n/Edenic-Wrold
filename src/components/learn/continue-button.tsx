"use client";

import { ArrowRight } from "lucide-react";
import { itemKey, useProgress } from "@/store/progress";
import { Button3D } from "@/components/ui/button-3d";
import { lessonsByCharacter } from "@/data/lessons";
import type { CharacterId } from "@/types/character";
import type { Dictionary } from "@/lib/dictionaries/en";

interface ContinueButtonProps {
  /** How many lessons the course has; lessons are numbered 1…count. */
  count: number;
  characterId: CharacterId;
  lessonId: string;
  basePath: string;
  tone: { face: string; edge: string };
  dict: Dictionary;
  className?: string;
}

/**
 * The CTA to the first open-and-unfinished lesson, looping back to the last
 * one once all of them are done.
 *
 * **The label carries three states, not just "Continue"**: before the first
 * lesson has ever been finished (nothing to continue yet) it reads "Start";
 * once every lesson is done it reads "Next Lesson" and goes to the next open
 * course in the character's list (or replays the last lesson if there is
 * none); anywhere in between it is the ordinary "Continue".
 *
 * Its own tiny Client Component: the course page places it in a fixed
 * bottom bar on phone and tablet and under the banner on a desktop — two
 * unrelated parents in different JSX trees.
 */
export function ContinueButton({
  count,
  characterId,
  lessonId,
  basePath,
  tone,
  dict,
  className = "",
}: ContinueButtonProps) {
  const progress = useProgress((state) => state.items);
  const hydrated = useProgress((state) => state.hydrated);

  const starsFor = (n: number) =>
    hydrated ? (progress[itemKey(characterId, lessonId, n)]?.stars ?? 0) : 0;

  /* Lessons open one path in order, so the first unfinished lesson is also
     the first open-and-unfinished one. */
  const nextValue = Array.from({ length: count }, (_, i) => i + 1).find(
    (n) => starsFor(n) === 0,
  );

  const continueValue = nextValue ?? count;

  /* Nothing is open past lesson 1 until lesson 1 itself is done, so this is
     exactly the first-ever-play state. */
  const label =
    starsFor(1) === 0
      ? dict.lessonPicker.ctaStart
      : nextValue === undefined
        ? dict.lessonPicker.ctaNextLesson
        : dict.trail.ctaContinue;

  /* Once every lesson is done, "Next Lesson" really goes to the next lesson
     — the first open one after this in the character's list. */
  const lessons = lessonsByCharacter[characterId];
  const nextLesson = lessons
    .slice(lessons.findIndex((lesson) => lesson.id === lessonId) + 1)
    .find((lesson) => !lesson.locked);
  const href =
    nextValue === undefined && nextLesson
      ? `/learn/${characterId}/${nextLesson.id}`
      : `${basePath}/${continueValue}`;

  return (
    <Button3D
      href={href}
      tone={{ face: tone.face, edge: tone.edge }}
      className={`flex items-center justify-center gap-2 ${className}`}
    >
      {label}
      <ArrowRight className="h-5 w-5" strokeWidth={2.75} />
    </Button3D>
  );
}
