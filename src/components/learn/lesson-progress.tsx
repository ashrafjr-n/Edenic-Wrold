"use client";

import { itemKey, useProgress } from "@/store/progress";

interface LessonProgressProps {
  characterId: string;
  lessonId: string;
  /** Every item this lesson is made of, in the store's own key shape —
      `numberItems.map((item) => item.value)` for Numbers. Empty for a lesson
      with no items yet (Letters, Colors), which reads as untouched. */
  items: readonly (number | string)[];
  totalItems: number;
}

/**
 * The lesson hub card's progress bar and "{done} / {total}" chip, pulled out
 * of `LessonCard` as its own tiny Client Component — the same move
 * `ContinueButton` already made for the numbers picker, and for the same
 * reason: `LessonCard` is a Server Component (art, name, description, the
 * locked/unlock chrome, none of which needs the store), and the progress
 * store only exists client-side.
 *
 * Replaced the old hardcoded `CURRENT_ITEMS = 0` placeholder, which is why
 * every lesson card used to read "0 / 9" regardless of what a child had
 * actually finished.
 */
export function LessonProgress({
  characterId,
  lessonId,
  items,
  totalItems,
}: LessonProgressProps) {
  const progress = useProgress((state) => state.items);
  const hydrated = useProgress((state) => state.hydrated);

  /* Nothing-finished-yet until hydration flips, same rule every progress
     reader on the site follows — the server and the first client render
     have to agree. */
  const done = hydrated
    ? items.filter(
        (item) => (progress[itemKey(characterId, lessonId, item)]?.stars ?? 0) > 0,
      ).length
    : 0;
  const progressPercent = totalItems > 0 ? Math.round((done / totalItems) * 100) : 0;

  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-locked)] sm:h-2.5">
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${progressPercent}%`, backgroundColor: "var(--lesson-accent)" }}
          aria-hidden
        />
      </div>
      <span className="counter-chip counter-chip--quiet">
        {done} / {totalItems}
      </span>
    </div>
  );
}
