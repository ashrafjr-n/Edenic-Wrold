"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Image, { type StaticImageData } from "next/image";
import { Celebration } from "@/components/ui/celebration";
import { CUP } from "@/data/market";
import { format } from "@/lib/format-dict";
import { lessonCue, playCue } from "@/lib/cue";
import { ClayWord } from "./clay-word";

/* The table, in % of its width (`cqi`): three places, each cup `CUP_W`
   wide with its left edge at `PLACE`; a cup goes up `LIFT` to show what is
   under it, so the table is tall enough for a lifted one. */
const CUP_W = 30;
const PLACE = [1.67, 35, 68.33];
const CUP_H = (CUP_W * CUP.height) / CUP.width;
const LIFT = CUP_H * 0.8;
const FLOOR = 3;
const TABLE_H = CUP_H + LIFT + FLOOR + 3;

/** Two places, swapped. */
const PAIRS = [[0, 1], [1, 2], [0, 2]] as const;

/** A cup going up or down — kept in step with its `transition`. */
const LIFT_MS = 420;
/** A breath before each round. */
const ROUND_GAP_MS = 350;
/** The food in view, before its cup comes down over it. */
const LOOK_MS = 1400;
/** Medium speed for 5–9-year-olds (direct request): `SWAPS` swaps of
    `SWAP_MS` each. A miss makes the next round a swap shorter and a little
    slower — never under three swaps, never slower than `SLOWEST_MS`. */
const SWAPS = 5;
const SWAP_MS = 640;
const SLOWEST_MS = 820;
/** Found, then the step is solved. */
const DONE_MS = 700;

/* The table's width, capped by the height a step has so it never pushes
   the page into a scroll (`--ratio` is its w/h). Phone and tablet: over
   the word; desktop: beside it. */
const TABLE_SIZE =
  "max-w-[min(100%,calc((100svh-26rem-min(2.5rem,4svh))*var(--ratio)))] sm:max-w-[min(32rem,calc((100svh-44rem)*var(--ratio)))] lg:max-w-[min(38rem,calc((var(--stage-h)-2rem)*var(--ratio)))]";

type Phase = "show" | "shuffle" | "guess" | "reveal" | "solved";

interface CupsGameProps {
  /** The food, in English, and its picture. */
  word: string;
  picture: StaticImageData;
  /** A cup's name for a screen reader, by where it stands ("Cup {n}") —
      never by what is under it. */
  cupAria: string;
  onSolved: () => void;
  onMiss: () => void;
}

/**
 * Nova's cups: the food goes under one of three cups (a different one,
 * at random, every round), they swap places, and the child taps the one
 * it is under. Found → the cup comes up on it, its word is said and it
 * jumps. Not there → that cup shakes, the right one lifts to show where it
 * went, and the round starts again (direct request: one miss and the
 * challenge restarts).
 *
 * The place is chosen on the client, in the round itself, never while
 * rendering. The swaps are WAAPI (each cup slides from its old place to its
 * new one — one passes in front, a little lower and bigger, the other
 * behind) over the place the state already holds, so a cup always rests
 * where the state says. The food is drawn only while a cup over it is up.
 */
export function CupsGame({ word, picture, cupAria, onSolved, onMiss }: CupsGameProps) {
  /* Where each cup stands (cup → place), which cup the food is under, which
     cups are up, and whether the food is drawn. */
  const [places, setPlaces] = useState([0, 1, 2]);
  const [under, setUnder] = useState(-1);
  const [up, setUp] = useState<number[]>([]);
  const [shown, setShown] = useState(false);
  const [phase, setPhase] = useState<Phase>("show");
  const [front, setFront] = useState(-1);
  const [wrong, setWrong] = useState(-1);
  const cups = useRef<(HTMLSpanElement | null)[]>([]);
  /* What the rounds read — taps outrun renders. */
  const at = useRef([0, 1, 2]);
  const turn = useRef(false);
  const misses = useRef(0);
  const timers = useRef<number[]>([]);

  const wait = (ms: number) =>
    new Promise<void>((resolve) => {
      timers.current.push(window.setTimeout(resolve, ms));
    });

  /* Two places swap their cups: the state holds the new places at once,
     and each cup slides there from the old one. */
  const swap = (ms: number) => {
    const [a, b] = PAIRS[Math.floor(Math.random() * PAIRS.length)];
    const ca = at.current.indexOf(a);
    const cb = at.current.indexOf(b);
    const next = [...at.current];
    next[ca] = b;
    next[cb] = a;
    at.current = next;
    setPlaces(next);
    const near = Math.random() < 0.5 ? ca : cb;
    setFront(near);
    /* Reduced motion: a plain slide — the slide IS the game. */
    const plain = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    for (const [cup, from, to] of [[ca, a, b], [cb, b, a]] as const) {
      const mid = `${(PLACE[from] + PLACE[to]) / 2}cqi ${cup === near ? 3 : -5}cqi`;
      cups.current[cup]?.animate(
        plain
          ? [{ translate: `${PLACE[from]}cqi 0` }, { translate: `${PLACE[to]}cqi 0` }]
          : [
              { translate: `${PLACE[from]}cqi 0`, scale: 1 },
              { translate: mid, scale: cup === near ? 1.07 : 0.9, offset: 0.5 },
              { translate: `${PLACE[to]}cqi 0`, scale: 1 },
            ],
        { duration: ms, easing: "ease-in-out" },
      );
    }
  };

  /* One round: the food under a cup chosen at random, shown, covered, the
     cups swapped, then it is the child's turn. */
  const round = async () => {
    setPhase("show");
    setWrong(-1);
    const cup = at.current.indexOf(Math.floor(Math.random() * 3));
    setUnder(cup);
    setShown(true);
    setUp([cup]);
    await wait(LIFT_MS + LOOK_MS);
    setUp([]);
    await wait(LIFT_MS);
    setShown(false);
    await wait(250);
    setPhase("shuffle");
    const ms = Math.min(SLOWEST_MS, SWAP_MS + 90 * misses.current);
    for (let i = Math.max(3, SWAPS - misses.current); i > 0; i--) {
      swap(ms);
      await wait(ms + 80);
    }
    setFront(-1);
    turn.current = true;
    setPhase("guess");
  };

  /* The first round starts once the step has swapped in. */
  const start = useEffectEvent(() => void round());
  useEffect(() => {
    /* One array for the step's life — every wait pushes into it. */
    const pending = timers.current;
    pending.push(window.setTimeout(start, ROUND_GAP_MS));
    return () => pending.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const guess = async (cup: number) => {
    if (!turn.current) return;
    turn.current = false;
    setPhase("reveal");
    setUp([cup]);
    if (cup === under) {
      setShown(true);
      await wait(LIFT_MS);
      setPhase("solved");
      void playCue(lessonCue.word(word));
      await wait(DONE_MS);
      onSolved();
      return;
    }
    /* Not there: it shakes, the right cup shows where the food went, and
       it all starts again — somewhere new. */
    setWrong(cup);
    onMiss();
    misses.current += 1;
    await wait(LIFT_MS + 500);
    setShown(true);
    setUp([cup, under]);
    await wait(LIFT_MS + 1200);
    setUp([]);
    await wait(LIFT_MS + ROUND_GAP_MS);
    setShown(false);
    await round();
  };

  const ratio = 100 / TABLE_H;
  return (
    <div className="card card-clay-white card-bare-lg flex w-full max-w-2xl flex-col items-center gap-3 px-3 py-4 sm:gap-5 sm:px-8 sm:py-6 lg:max-w-4xl lg:flex-row lg:justify-center lg:gap-12 lg:py-2 [@media(max-height:700px)]:gap-2 [@media(max-height:700px)]:py-3">
      <div
        className={`relative w-full [container-type:inline-size] ${TABLE_SIZE}`}
        style={{ aspectRatio: ratio, "--ratio": ratio } as CSSProperties}
      >
        {[0, 1, 2].map((cup) => {
          const lifted = up.includes(cup);
          return (
            <span
              key={cup}
              ref={(el) => {
                cups.current[cup] = el;
              }}
              className={`absolute left-0 block ${cup === front ? "z-[3]" : "z-[2]"}`}
              style={{ bottom: `${FLOOR}cqi`, width: `${CUP_W}cqi`, height: `${CUP_H}cqi`, translate: `${PLACE[places[cup]]}cqi 0` }}
            >
              {/* Its shadow on the table: it stays down when the cup goes up. */}
              <span
                aria-hidden
                className="absolute -bottom-[2.5cqi] left-[6%] h-[6cqi] w-[88%] rounded-[50%] bg-[radial-gradient(closest-side,rgb(var(--shadow-hue)/0.32),transparent)] transition-[opacity,scale] duration-[420ms]"
                style={lifted ? { opacity: 0.45, scale: "0.8" } : undefined}
              />
              {/* The food — drawn only while a cup over it is up. */}
              {cup === under && (
                <span className={`absolute bottom-0 left-[19%] block h-[64%] w-[62%] ${shown ? "" : "invisible"}`}>
                  <span className={`relative block h-full w-full ${phase === "solved" ? "anim-jump" : ""}`}>
                    <Image src={picture} alt="" fill loading="eager" sizes="(min-width: 1024px) 8rem, 20vw" draggable={false} className="pointer-events-none select-none object-contain object-bottom" />
                  </span>
                </span>
              )}
              <button
                type="button"
                disabled={phase !== "guess"}
                aria-label={format(cupAria, { n: places[cup] + 1 })}
                onClick={() => void guess(cup)}
                className="absolute inset-0 block rounded-[30%] transition-[translate] duration-[420ms] ease-[cubic-bezier(0.3,1.25,0.5,1)] enabled:cursor-pointer focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[var(--page-accent-color)]"
                style={{ translate: lifted ? `0 -${LIFT}cqi` : "0 0" }}
              >
                <span className={`relative block h-full w-full ${cup === wrong ? "anim-wiggle" : ""}`}>
                  <Image src={CUP} alt="" fill loading="eager" sizes="(min-width: 1024px) 12rem, 30vw" draggable={false} className="pointer-events-none select-none object-contain" />
                </span>
              </button>
            </span>
          );
        })}
        {phase === "solved" && <Celebration />}
      </div>

      {/* English in every locale: never mirrored. No speaker — the word card
          is where it is heard. */}
      <div dir="ltr" className={`flex items-center justify-center lg:shrink-0 ${phase === "solved" ? "anim-jump" : ""}`}>
        <ClayWord word={word} size="sm" />
      </div>
    </div>
  );
}
