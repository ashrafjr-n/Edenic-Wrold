"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import Image, { type StaticImageData } from "next/image";
import { PawPrint } from "lucide-react";
import { Celebration } from "@/components/ui/celebration";
import { format } from "@/lib/format-dict";
import { lessonCue, playCue } from "@/lib/cue";
import { shuffle } from "@/lib/seeded";
import type { Tracks } from "@/types/course";
import { TrackSheet } from "./track-sheet";

/** The footprints walk again, then the step is solved. */
const DONE_MS = 1600;
/** A wrong sheet: the line rests on it this long, then lets go. */
const MISS_MS = 520;
/** A finger let go this close (px) to a sheet still means that sheet. */
const REACH = 14;

/* The height a step has, `--room`, shared out between the animal, the
   line's run and the sheets (each 100×130) — so the step never pushes the
   page into a scroll. Phone: under the header and over the tab bar;
   tablet: under the task panels too; desktop: the board's own height. */
const ROOM =
  "[--room:calc(100svh-21rem-min(2.5rem,4svh))] sm:[--room:calc(100svh-38rem)] lg:[--room:calc(var(--stage-h)-1.5rem)]";

type Point = readonly [number, number];

interface MatchTracksProps {
  /** The animal, in English. */
  word: string;
  picture: StaticImageData;
  own: Tracks;
  others: readonly Tracks[];
  seed: string;
  /** A sheet's name for a screen reader, by where it hangs ("Footprints
      {n}") — never by whose they are. */
  sheetAria: string;
  /** The course's colour: the handle the line is drawn from. */
  tone: { face: string; edge: string; ink: string };
  onSolved: () => void;
  onMiss: () => void;
}

/**
 * Match the footprints (Bloo's Animals, direct request 2026-10-26): the
 * lesson's animal above three paper sheets of footprints — its own and two
 * far unlike them. Draw a chalk line from the animal (its handle) down to
 * its footprints, or tap the sheet. The right sheet: the line stays, its
 * footprints are walked again one by one and the others fade. A wrong
 * one: it shakes its head, the line lets go and the sheet stays greyed
 * (never see-through — the board's green would show through the paper).
 */
export function MatchTracks({ word, picture, own, others, seed, sheetAria, tone, onSolved, onMiss }: MatchTracksProps) {
  const sheets = useMemo(() => shuffle([own, ...others], seed), [own, others, seed]);
  const right = sheets.indexOf(own);
  /* The line, in % of the step: from the handle to the finger (or a sheet). */
  const [line, setLine] = useState<{ from: Point; to: Point; drawn: boolean } | null>(null);
  const [held, setHeld] = useState(false);
  const [aim, setAim] = useState<number | null>(null);
  const [missed, setMissed] = useState<number[]>([]);
  const [shaking, setShaking] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [touched, setTouched] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const handle = useRef<HTMLSpanElement>(null);
  const sheetRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const timers = useRef<number[]>([]);
  const busy = useRef(false);

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);
  const after = (ms: number, run: () => void) => {
    timers.current.push(window.setTimeout(run, ms));
  };

  /* A point on the page, as % of the step. */
  const toBox = (x: number, y: number): Point => {
    const b = box.current?.getBoundingClientRect();
    if (!b) return [50, 50];
    return [((x - b.left) / b.width) * 100, ((y - b.top) / b.height) * 100];
  };
  const handleAt = (): Point => {
    const h = handle.current?.getBoundingClientRect();
    return h ? toBox(h.left + h.width / 2, h.top + h.height / 2) : [50, 30];
  };
  /* Where a line lands on a sheet: the middle of its top edge, between its
     magnets. */
  const sheetTop = (i: number): Point => {
    const s = sheetRefs.current[i]?.getBoundingClientRect();
    return s ? toBox(s.left + s.width / 2, s.top + 2) : [50, 70];
  };
  const sheetUnder = (x: number, y: number) =>
    sheetRefs.current.findIndex((sheet, i) => {
      if (!sheet || missed.includes(i)) return false;
      const s = sheet.getBoundingClientRect();
      return x > s.left - REACH && x < s.right + REACH && y > s.top - REACH && y < s.bottom + REACH;
    });

  const connect = (i: number, from: Point, drawn: boolean) => {
    if (busy.current || done || missed.includes(i)) return;
    busy.current = true;
    setTouched(true);
    setAim(null);
    setLine({ from, to: sheetTop(i), drawn });
    if (i === right) {
      setDone(true);
      navigator.vibrate?.([10, 40, 14]);
      after(350, () => void playCue(lessonCue.word(word)));
      after(DONE_MS, onSolved);
      return;
    }
    setShaking(i);
    navigator.vibrate?.(30);
    onMiss();
    after(MISS_MS, () => {
      setLine(null);
      setShaking(null);
      setMissed((list) => [...list, i]);
      busy.current = false;
    });
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (busy.current || done) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setHeld(true);
    setTouched(true);
    setLine({ from: handleAt(), to: toBox(event.clientX, event.clientY), drawn: false });
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (!held) return;
    const over = sheetUnder(event.clientX, event.clientY);
    setAim(over < 0 ? null : over);
    setLine((was) => was && { ...was, to: toBox(event.clientX, event.clientY) });
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (!held) return;
    setHeld(false);
    const over = sheetUnder(event.clientX, event.clientY);
    if (over >= 0 && line) connect(over, line.from, false);
    else {
      setAim(null);
      setLine(null);
    }
  };

  return (
    <div ref={box} className={`card card-clay-white card-bare-lg relative flex w-full max-w-2xl flex-col items-center px-2 py-3 sm:px-6 lg:max-w-3xl ${ROOM}`}>
      {/* The animal — drawn from: a line starts on it or on its handle. */}
      <span
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={`relative flex touch-none select-none flex-col items-center ${done ? "" : held ? "cursor-grabbing" : "cursor-grab"}`}
      >
        <span className={`relative block aspect-square h-[min(11rem,calc(var(--room)*0.36))] ${done ? "anim-jump" : ""}`}>
          <Image src={picture} alt={word} fill preload sizes="(min-width: 1024px) 10rem, 34vw" draggable={false} className="pointer-events-none select-none object-contain" />
        </span>
        <span
          ref={handle}
          data-tracks-handle
          aria-hidden
          className="clay relative -mt-2 flex h-11 w-11 items-center justify-center rounded-full sm:h-12 sm:w-12"
          style={{ backgroundColor: tone.face, color: tone.ink, "--clay-edge": tone.edge } as CSSProperties}
        >
          {!touched && <span className="guide-target pointer-events-none absolute inset-0 rounded-full" />}
          <PawPrint className={`h-6 w-6 ${touched ? "" : "tracks-nudge"}`} strokeWidth={2.5} />
        </span>
      </span>

      {/* The line's run, down to the sheets. */}
      <span aria-hidden className="block h-[min(4.5rem,calc(var(--room)*0.14))] shrink-0" />

      <div
        className="grid justify-center gap-3 [--sheet-w:min(calc((100%-1.5rem)/3),calc(min(14rem,var(--room)*0.44)/1.3))] [grid-template-columns:repeat(3,var(--sheet-w))] sm:gap-5 sm:[--sheet-w:min(calc((100%-2.5rem)/3),calc(min(14rem,var(--room)*0.44)/1.3))]"
        style={{ width: "100%" }}
      >
        {sheets.map((tracks, i) => {
          const off = missed.includes(i) || (done && i !== right);
          return (
            <button
              key={i}
              ref={(el) => {
                sheetRefs.current[i] = el;
              }}
              type="button"
              aria-label={format(sheetAria, { n: i + 1 })}
              disabled={off || done}
              onClick={() => connect(i, handleAt(), true)}
              className={`card card-clay-white pic-card tracks-sheet block p-1 transition-[scale,filter] duration-300 sm:p-1.5 ${
                aim === i ? "scale-[1.04]" : ""
              } ${off ? "brightness-[0.72] saturate-0" : ""} ${done && i === right ? "tracks-sheet--found" : ""} ${shaking === i ? "anim-wiggle" : ""}`}
            >
              <TrackSheet tracks={tracks} walk={done && i === right} className="block h-auto w-full" />
            </button>
          );
        })}
      </div>

      {line && (
        <svg aria-hidden className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-visible">
          <line
            x1={`${line.from[0]}%`}
            y1={`${line.from[1]}%`}
            x2={`${line.to[0]}%`}
            y2={`${line.to[1]}%`}
            pathLength={1}
            className={`tracks-line ${line.drawn ? "tracks-line--draw" : ""} ${shaking !== null ? "tracks-line--let-go" : ""}`}
          />
          <circle cx={`${line.to[0]}%`} cy={`${line.to[1]}%`} r={held ? 7 : 5} className="tracks-line-end" />
        </svg>
      )}
      {done && <Celebration />}
    </div>
  );
}
