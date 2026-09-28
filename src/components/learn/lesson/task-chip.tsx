"use client";

import { useEffect, useState } from "react";
import { Blocks, Ear, Eye, Hand, Pencil, Pointer, Search, Volume2, type LucideIcon } from "lucide-react";
import { playCue } from "@/lib/cue";
import { Button3D } from "@/components/ui/button-3d";
import type { Dictionary } from "@/lib/dictionaries/en";

export type TaskKind = keyof Dictionary["tasks"];

/** Each kind of step has its own icon and clay colour, so a child who cannot
    read yet still knows what kind of thing to do. Gold is the say-it colour,
    and "listen" is exactly that. */
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
  /** Pinki's full instruction — the chip's name for a screen reader. */
  label: string;
  /** The instruction's recording (`lessonCue.ask`), played on arrival and
      again on every press. */
  cue: string;
  dir: "rtl" | "ltr";
}

/**
 * What to do on this step, as one clay pill at the top of the stage: an icon
 * on a white disc, one verb, and the word it is about. The whole pill is the
 * speaker — pressing it says the full instruction again — so there is no
 * separate sound button and no text to read aloud to a pre-reader.
 */
export function TaskChip({ kind, verb, target, label, cue, dir }: TaskChipProps) {
  const [speaking, setSpeaking] = useState(false);
  const { icon: Icon, face, edge, text } = KINDS[kind];

  /* Said on arrival (once audio exists). A lesson is only reached by a tap,
     so the browser's autoplay rule is already met. */
  useEffect(() => {
    void playCue(cue);
  }, [cue]);

  const say = () => {
    if (speaking) return;
    setSpeaking(true);
    void playCue(cue).then(() => setSpeaking(false));
  };

  return (
    <span className="anim-drop-in relative inline-flex">
      {speaking && (
        <span
          className="say-pulse pointer-events-none absolute inset-0 rounded-full"
          style={{ backgroundColor: face }}
          aria-hidden
        />
      )}
      <Button3D
        tone={{ face, edge, text }}
        onClick={say}
        aria-label={label}
        className={`relative h-12 gap-2 pe-3 ps-1.5 text-base font-bold sm:h-14 sm:gap-2.5 sm:pe-4 sm:text-xl ${speaking ? "anim-jump" : ""}`}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white sm:h-11 sm:w-11" style={{ color: edge }}>
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.75} />
        </span>
        <span dir={dir}>{verb}</span>
        {target && (
          <span dir="ltr" className="rounded-full bg-white/30 px-2.5 py-0.5 sm:px-3">
            {target}
          </span>
        )}
        <Volume2 className="h-5 w-5 shrink-0 opacity-80" strokeWidth={2.75} />
      </Button3D>
    </span>
  );
}
