import type { CSSProperties } from "react";
import { TaskChip, type TaskKind } from "./task-chip";
import type { TaskDemoDef } from "./task-demo";

interface TaskHeadingProps {
  kind: TaskKind;
  /** The one-word verb, in the child's language ("Draw"). */
  verb: string;
  /** The English word the step is about ("circle"), if any. */
  target?: string;
  /** The full instruction ("Draw a circle!"). */
  label: string;
  /** How the step is played — the round button opens it. */
  demo?: TaskDemoDef;
  closeLabel: string;
  /** The course's colour: the button, and the taught word. */
  tone: { face: string; edge: string };
  dir: "rtl" | "ltr";
}

/**
 * What to do on this step, as the desktop's heading (in the back row's
 * middle): the round task button — the same one a phone has, opening the
 * how-to popup — beside the verb and the English word, with the full
 * instruction under them.
 */
export function TaskHeading({ kind, verb, target, label, demo, closeLabel, tone, dir }: TaskHeadingProps) {
  return (
    <div className="anim-fade-up flex min-w-0 items-center gap-4">
      <TaskChip
        kind={kind}
        verb={verb}
        target={target}
        label={label}
        demo={demo}
        closeLabel={closeLabel}
        tone={tone}
        dir={dir}
      />
      <div className="min-w-0">
        <h2 className="flex items-baseline gap-2 text-2xl font-bold leading-tight text-[var(--color-ink)]">
          <span dir={dir}>{verb}</span>
          {target && (
            <span dir="ltr" style={{ color: tone.edge } as CSSProperties}>
              {target}
            </span>
          )}
        </h2>
        <p dir={dir} className="truncate text-base text-[var(--color-ink-soft)]">
          {label}
        </p>
      </div>
    </div>
  );
}
