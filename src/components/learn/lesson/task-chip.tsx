"use client";

import { useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Balloon, Blocks, Ear, Eye, Hand, Paintbrush, Pencil, Pointer, Search, Shapes, X, type LucideIcon } from "lucide-react";
import { Button3D } from "@/components/ui/button-3d";
import type { Dictionary } from "@/lib/dictionaries/en";
import { TaskDemo, type TaskDemoDef } from "./task-demo";

export type TaskKind = keyof Dictionary["tasks"];

/** Each kind of step has its own icon, so a child who cannot read yet
    still knows what kind of thing to do. The colour is the course's (one
    hero colour per course, direct request), not the kind's. */
export const TASK_ICONS: Record<TaskKind, LucideIcon> = {
  listen: Ear,
  watch: Eye,
  draw: Pencil,
  build: Blocks,
  find: Search,
  pick: Pointer,
  count: Hand,
  sort: Shapes,
  paint: Paintbrush,
  pop: Balloon,
};

interface TaskChipProps {
  kind: TaskKind;
  /** The one-word verb, in the child's language ("Draw"). */
  verb: string;
  /** The English word the step is about ("circle"), if any. */
  target?: string;
  /** The full instruction — the button's name for a screen reader. */
  label: string;
  /** How the step is played, shown in a popup on press. Steps without one
      (a Pick of pictures, Count) get the round badge alone. */
  demo?: TaskDemoDef;
  closeLabel: string;
  /** The course's colour. */
  tone: { face: string; edge: string };
  dir: "rtl" | "ltr";
}

/**
 * What to do on this step: one round clay button in the back row, its icon
 * and colour naming the kind of step. It makes no sound (direct request) —
 * pressing it opens a popup in the middle of the screen that SHOWS how the
 * step is played, only its first move (`TaskDemo`), with a close button.
 *
 * The popup is a native `<dialog>` opened with `showModal()`: focus moves
 * into it and comes back, Escape and the backdrop close it, and it sits in
 * the top layer above the sticky row it is declared in. Its content only
 * mounts while it is open, so the demo starts from the top every time.
 */
export function TaskChip({ kind, verb, target, label, demo, closeLabel, tone, dir }: TaskChipProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const Icon = TASK_ICONS[kind];
  const { face, edge } = tone;
  const text = "#fff";

  if (!demo) {
    return (
      <span
        role="img"
        aria-label={label}
        className="clay anim-drop-in flex h-14 w-14 items-center justify-center rounded-full"
        style={{ backgroundColor: face, color: text, "--clay-edge": edge } as CSSProperties}
      >
        <Icon className="h-7 w-7" strokeWidth={2.75} />
      </span>
    );
  }

  const show = () => {
    setOpen(true);
    dialog.current?.showModal();
  };

  return (
    <>
      <span className="anim-drop-in inline-flex">
        <Button3D tone={{ face, edge, text }} onClick={show} aria-label={label} aria-haspopup="dialog" className="h-14 w-14 shrink-0">
          <Icon className="h-7 w-7" strokeWidth={2.75} />
        </Button3D>
      </span>

      <dialog
        ref={dialog}
        aria-label={label}
        onClose={() => setOpen(false)}
        /* A press on the backdrop is a press on the dialog element itself. */
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
        className="m-auto w-[min(21rem,calc(100%-2.5rem))] overflow-visible bg-transparent p-0 backdrop:bg-[rgb(var(--shadow-hue)/45%)]"
      >
        {open && (
          <div className="card card-clay-white anim-pop-in relative flex flex-col items-center gap-3 px-4 pb-5 pt-4">
            <div className="flex w-full items-center gap-2.5 pe-12">
              <span
                className="clay flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: face, color: text, "--clay-edge": edge } as CSSProperties}
              >
                <Icon className="h-5 w-5" strokeWidth={2.75} />
              </span>
              <p className="flex items-center gap-2 text-xl font-bold text-[var(--color-ink)]">
                <span dir={dir}>{verb}</span>
                {target && <span dir="ltr">{target}</span>}
              </p>
            </div>
            <span className="absolute end-3 top-3">
              <Button3D
                tone={{ face: "var(--page-accent-color)", edge: "var(--page-accent-edge)", text: "var(--page-accent-ink)" }}
                onClick={() => dialog.current?.close()}
                aria-label={closeLabel}
                className="h-11 w-11"
              >
                <X className="h-5 w-5" strokeWidth={3} />
              </Button3D>
            </span>
            <div className="aspect-square w-full">
              <TaskDemo demo={demo} />
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}

interface TaskPanelProps {
  kind: TaskKind;
  verb: string;
  target?: string;
  /** The full instruction, in the child's language. */
  label: string;
  demo?: TaskDemoDef;
  tone: { face: string; edge: string };
  dir: "rtl" | "ltr";
  className?: string;
}

/**
 * The task button's popup, docked (tablet and desktop): the same header —
 * the step's icon, its verb and the English word — and the same looping
 * how-to demo, always in view beside the step instead of behind a tap.
 * A step without a demo shows its instruction instead. Tablet only: a
 * desktop has the task as the current stop of its `StepTrail`.
 */
export function TaskPanel({ kind, verb, target, label, demo, tone, dir, className = "" }: TaskPanelProps) {
  const Icon = TASK_ICONS[kind];
  return (
    <div className={`card card-clay-white items-center gap-4 p-4 lg:flex-col lg:items-stretch lg:gap-3 lg:p-5 ${className}`}>
      <div className="min-w-0 flex-1 lg:flex-none">
      <div className="flex items-center gap-2.5">
        <span
          className="clay flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: tone.face, "--clay-edge": tone.edge } as CSSProperties}
        >
          <Icon className="h-5 w-5" strokeWidth={2.75} />
        </span>
        <h2 className="flex min-w-0 items-center gap-2 text-xl font-bold text-[var(--color-ink)]">
          <span dir={dir}>{verb}</span>
          {target && <span dir="ltr">{target}</span>}
        </h2>
      </div>
      <p dir={dir} className="mt-2 text-base text-[var(--color-ink-soft)]">
        {label}
      </p>
      </div>
      {demo && (
        <div className="aspect-square w-32 shrink-0 lg:w-full">
          <TaskDemo demo={demo} />
        </div>
      )}
    </div>
  );
}
