"use client";

import { useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Blocks, Ear, Eye, Hand, Pencil, Pointer, Search, X, type LucideIcon } from "lucide-react";
import { Button3D } from "@/components/ui/button-3d";
import type { Dictionary } from "@/lib/dictionaries/en";
import { TaskDemo, type TaskDemoDef } from "./task-demo";

export type TaskKind = keyof Dictionary["tasks"];

/** Each kind of step has its own icon and clay colour, so a child who cannot
    read yet still knows what kind of thing to do. */
const KINDS: Record<TaskKind, { icon: LucideIcon; face: string; edge: string; text: string }> = {
  listen: { icon: Ear, face: "var(--color-gold)", edge: "var(--color-gold-dark)", text: "var(--color-ink-fixed)" },
  watch: { icon: Eye, face: "var(--brand)", edge: "var(--brand-dark)", text: "#fff" },
  draw: { icon: Pencil, face: "var(--color-subject-shapes)", edge: "var(--color-subject-shapes-dark)", text: "#fff" },
  build: { icon: Blocks, face: "var(--color-nova)", edge: "var(--color-nova-dark)", text: "#fff" },
  find: { icon: Search, face: "var(--color-go)", edge: "var(--color-go-dark)", text: "#fff" },
  pick: { icon: Pointer, face: "var(--brand)", edge: "var(--brand-dark)", text: "#fff" },
  count: { icon: Hand, face: "var(--accent)", edge: "var(--accent-dark)", text: "#fff" },
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
      (Pick, Count) get the round badge alone. */
  demo?: TaskDemoDef;
  closeLabel: string;
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
export function TaskChip({ kind, verb, target, label, demo, closeLabel, dir }: TaskChipProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const { icon: Icon, face, edge, text } = KINDS[kind];

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
                tone={{ face: "var(--brand)", edge: "var(--brand-dark)", text: "#fff" }}
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
