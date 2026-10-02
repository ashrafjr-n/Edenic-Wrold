"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Celebration } from "@/components/ui/celebration";
import { COLORS } from "@/data/colors";
import { format } from "@/lib/format-dict";
import type { ColorId, PaintRound } from "@/types/course";
import { ClayWord, PLAIN_TONE } from "./clay-word";

/** Two misses in a round and the right pot starts to glow. */
const HINT_AFTER = 2;
/** How long a freshly painted thing is admired before the next one comes. */
const ROUND_MS = 1400;

interface PaintColorsProps {
  rounds: PaintRound[];
  /** The pots on offer, in order: the lesson's colors and ones already met. */
  pots: ColorId[];
  /** "{color} paint", each pot's screen-reader name. */
  potAria: string;
  onSolved: () => void;
  onMiss: () => void;
}

/**
 * Paint it: the color WORD in clay letters, a thing in plain grey clay, and a
 * row of paint pots. Tap the pot the word names and the paint spreads over
 * the thing (the painted render uncovered by a growing circle). The word, not
 * the thing, picks the pot — this is reading, not guessing. A wrong pot only
 * wiggles; after two misses the right one glows. One round per color; a
 * painted thing then waits in the card's corner while the next one comes.
 */
export function PaintColors({ rounds, pots, potAria, onSolved, onMiss }: PaintColorsProps) {
  const [at, setAt] = useState(0);
  const [painted, setPainted] = useState(false);
  const [misses, setMisses] = useState(0);
  const [shake, setShake] = useState<{ color: ColorId; n: number } | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const round = rounds[at];
  const last = at === rounds.length - 1;
  const hinted = !painted && misses >= HINT_AFTER ? round.color : undefined;

  const tap = (color: ColorId) => {
    if (painted) return;
    if (color !== round.color) {
      setShake((prev) => ({ color, n: (prev?.n ?? 0) + 1 }));
      setMisses((count) => count + 1);
      onMiss();
      return;
    }
    setPainted(true);
    if (last) {
      onSolved();
      return;
    }
    timer.current = window.setTimeout(() => {
      setAt((value) => value + 1);
      setPainted(false);
      setMisses(0);
      setShake(null);
    }, ROUND_MS);
  };

  return (
    /* Phone: a column — the word, the thing, the pots. Desktop: the thing
       big on the left, the word over the pots on the right. */
    <div className="flex w-full max-w-md flex-col items-center gap-4 [--pot:min(5.5rem,11svh)] sm:gap-6 lg:grid lg:[--pot:min(7rem,14svh)] lg:max-w-4xl lg:grid-cols-[auto_auto] lg:grid-rows-2 lg:items-center lg:justify-center lg:gap-x-14 lg:gap-y-6 [@media(max-height:700px)]:gap-3">
      <span key={`word-${at}`} className="lg:col-start-2 lg:row-start-1 lg:self-end lg:justify-self-center [@media(max-height:700px)]:[&>span]:text-6xl">
        <ClayWord word={round.color} size="md" tone={PLAIN_TONE} />
      </span>

      <div className="card card-clay-white card-bare-lg relative flex aspect-square w-[min(15rem,30svh)] items-center justify-center lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:w-[min(22rem,calc(var(--stage-h)-3rem))] [@media(max-height:700px)]:w-[24svh]">
        <div key={at} className="anim-pop-in relative h-[84%] w-[84%]">
          <Image
            src={round.blank}
            alt={round.word}
            fill
            loading="eager"
            sizes="(min-width: 1024px) 22rem, 15rem"
            className="select-none object-contain"
          />
          {/* Loaded up front, hidden until the paint goes on — fetched only
              on the tap, it arrived after the spread had already played. */}
          <Image
            src={round.painted}
            alt=""
            fill
            loading="eager"
            sizes="(min-width: 1024px) 22rem, 15rem"
            className={`select-none object-contain ${painted ? "paint-reveal" : "invisible"}`}
          />
        </div>
        {/* The next rounds' pictures, fetched now so each arrives ready. */}
        <span hidden>
          {rounds.slice(at + 1).flatMap((next) => [
            <Image key={`${next.word}-blank`} src={next.blank} alt="" width={240} height={240} loading="eager" sizes="(min-width: 1024px) 22rem, 15rem" />,
            <Image key={`${next.word}-painted`} src={next.painted} alt="" width={240} height={240} loading="eager" sizes="(min-width: 1024px) 22rem, 15rem" />,
          ])}
        </span>
        {/* What is already painted, waiting in the corner. */}
        {at > 0 && (
          <span className="absolute start-2 top-2 flex gap-1">
            {rounds.slice(0, at).map((done) => (
              <span key={done.word} className="anim-pop-in relative block h-[min(3rem,6svh)] w-[min(3rem,6svh)] lg:h-16 lg:w-16">
                <Image src={done.painted} alt={done.word} fill sizes="4rem" className="object-contain" />
              </span>
            ))}
          </span>
        )}
        {painted && <Celebration />}
      </div>

      {/* As many columns as pots, each at most a tile wide — four still fit
          a phone's width. */}
      <ul
        className="grid w-full justify-center gap-3 sm:gap-4 lg:col-start-2 lg:row-start-2 lg:w-auto lg:self-start"
        style={{ gridTemplateColumns: `repeat(${pots.length}, minmax(0, var(--pot)))` }}
      >
        {pots.map((color) => {
          const isShaking = shake?.color === color;
          const isRight = painted && color === round.color;
          return (
            <li key={color} className={`relative ${hinted === color ? "guide-target" : ""}`}>
              <button
                key={isShaking ? `${color}.${shake.n}` : isRight ? `${color}.right.${at}` : color}
                type="button"
                aria-label={format(potAria, { color })}
                onClick={() => tap(color)}
                disabled={painted}
                className={`card card-clay-white flex aspect-square w-full items-center justify-center p-[10%] transition-transform duration-200 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[var(--page-accent-color)] active:scale-95 ${
                  isShaking ? "anim-wiggle" : ""
                } ${isRight ? "anim-jump" : ""} ${
                  painted ? "" : "hover:outline-4 hover:outline-offset-4 hover:outline-[color-mix(in_srgb,var(--page-accent-color)_45%,transparent)]"
                }`}
              >
                <span className="relative block h-full w-full">
                  <Image src={COLORS[color].pot} alt="" fill sizes="(min-width: 1024px) 7rem, 5.5rem" className="pointer-events-none select-none object-contain" />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
