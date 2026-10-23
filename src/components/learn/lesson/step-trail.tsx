import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { Chalkboard } from "@/components/learn/classroom/chalkboard";
import { TASK_ICONS, type TaskKind } from "./task-chip";

interface StepTrailProps {
  /** Every step of the lesson, in order, by kind. */
  kinds: readonly TaskKind[];
  /** The step on screen — past the end once the lesson is done. */
  at: number;
  /** What stands in the current step's place: its round task button. */
  current: ReactNode;
}

/**
 * The desktop's lesson steps, at the back row's far right, written in
 * chalk on a slim strip of the friend's board: a small disc per step,
 * joined by a line. Done steps are ticked in the friend's chalk, the
 * current one is its round task button (the how-to), the ones to come
 * show their icon, faint.
 */
export function StepTrail({ kinds, at, current }: StepTrailProps) {
  return (
    <Chalkboard size="strip">
      <ol className="chalk-trail">
        {kinds.map((kind, i) => {
          const Icon = TASK_ICONS[kind];
          return (
            <li key={i} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden className={`chalk-trail-line ${i <= at ? "chalk-trail-line--done" : ""}`} />}
              {i === at ? (
                current
              ) : (
                <span aria-hidden className={`chalk-trail-dot ${i < at ? "chalk-trail-dot--done" : ""}`}>
                  {i < at ? <Check className="h-5 w-5" strokeWidth={3.5} /> : <Icon className="h-[1.1rem] w-[1.1rem]" strokeWidth={2.5} />}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </Chalkboard>
  );
}
