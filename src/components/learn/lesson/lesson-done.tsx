import type { CSSProperties } from "react";
import { Trophy, Unlock } from "lucide-react";
import { Celebration } from "@/components/ui/celebration";

interface LessonDoneProps {
  title: string;
  /** "Triangle is open!" — absent after a course's last lesson. */
  unlocked?: string;
  dir: "rtl" | "ltr";
}

/**
 * The end of a lesson, as a card: a clay trophy, "Lesson complete!", and what
 * it opened. Nothing is scored here — the star lands on the lesson's row.
 * Pinki's line and the Again/Next buttons are the player's, in the same
 * places as on every step.
 */
export function LessonDone({ title, unlocked, dir }: LessonDoneProps) {
  return (
    <div className="card card-clay-white anim-pop-in relative flex w-full max-w-sm flex-col items-center gap-4 px-6 py-6 text-center sm:max-w-md sm:px-10 sm:py-8">
      <Celebration />

      <span
        className="clay flex h-24 w-24 items-center justify-center rounded-full text-white"
        style={
          {
            backgroundColor: "var(--page-accent-color)",
            "--clay-edge": "var(--page-accent-edge)",
          } as CSSProperties
        }
      >
        <Trophy className="h-12 w-12" strokeWidth={2} />
      </span>

      <p dir={dir} className="text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">
        {title}
      </p>

      {unlocked && (
        <div
          className="clay anim-pop-in flex items-center gap-2 rounded-full px-5 py-2.5"
          style={
            {
              backgroundColor: "var(--color-go)",
              "--clay-edge": "var(--color-go-dark)",
              animationDelay: "0.6s",
            } as CSSProperties
          }
        >
          <Unlock className="h-5 w-5 text-white" strokeWidth={2.75} />
          <span dir={dir} className="text-base font-bold text-white sm:text-lg">
            {unlocked}
          </span>
        </div>
      )}
    </div>
  );
}
