import type { CSSProperties, ReactNode } from "react";
import { Check } from "lucide-react";
import { TASK_ICONS, type TaskKind } from "./task-chip";

interface StepTrailProps {
  /** Every step of the lesson, in order, by kind. */
  kinds: readonly TaskKind[];
  /** The step on screen — past the end once the lesson is done. */
  at: number;
  /** What stands in the current step's place: its round task button. */
  current: ReactNode;
  /** The course's colour. */
  tone: { face: string; edge: string };
}

/**
 * The desktop's lesson steps, in the middle of the back row: a small disc
 * per step, joined by a line. Done steps are ticked in the course colour,
 * the current one is its round task button (the how-to), the ones to come
 * show their icon, faded.
 */
export function StepTrail({ kinds, at, current, tone }: StepTrailProps) {
  const clay = { backgroundColor: tone.face, "--clay-edge": tone.edge } as CSSProperties;
  return (
    <ol className="flex items-center gap-2">
      {kinds.map((kind, i) => {
        const Icon = TASK_ICONS[kind];
        return (
          <li key={i} className="flex items-center gap-2">
            {i > 0 && (
              <span
                aria-hidden
                className="h-1 w-6 rounded-full transition-colors duration-300 xl:w-8"
                style={{ backgroundColor: i <= at ? tone.face : "rgb(var(--shadow-hue) / 18%)" }}
              />
            )}
            {i === at ? (
              current
            ) : i < at ? (
              <span aria-hidden className="clay flex h-10 w-10 items-center justify-center rounded-full text-white" style={clay}>
                <Check className="h-5 w-5" strokeWidth={3.5} />
              </span>
            ) : (
              <span
                aria-hidden
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface)] text-[var(--color-ink-soft)] opacity-70"
              >
                <Icon className="h-5 w-5" strokeWidth={2.5} />
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
