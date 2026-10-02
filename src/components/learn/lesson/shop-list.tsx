"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import { Celebration } from "@/components/ui/celebration";
import { CONTAINERS } from "@/data/market";
import { format } from "@/lib/format-dict";
import { lessonCue } from "@/lib/cue";
import { shuffle } from "@/lib/seeded";
import type { Container, Face } from "@/types/course";
import { CueButton } from "./cue-button";
import { FaceView } from "./face";

/** Two misses and the next thing to take starts to glow. */
const HINT_AFTER = 2;
/** How long a thing takes to fly into the container. */
const FLY_MS = 480;

const GO = { backgroundColor: "var(--color-go)", "--clay-edge": "var(--color-go-dark)" } as CSSProperties;

/** A thing's English word. */
const wordOf = (face: Face) => (face.kind === "picture" ? face.word : face.kind === "shape" ? face.shape : face.text);

interface ShopListProps {
  /** The English words on the note. */
  list: string[];
  /** Everything on the stall, each named by its word. */
  stall: Face[];
  into: Container;
  /** Take them in the list's order (a recipe). */
  ordered: boolean;
  /** Deals the stall. */
  seed: string;
  /** "Tap the {word}" — each thing's name for a screen reader. */
  itemAria: string;
  /** "Hear {word}" — each word's speaker. */
  hearLabel: string;
  onSolved: () => void;
  onMiss: () => void;
}

/**
 * Get what is on the list: Nova's note (the English words, each with its
 * speaker — read it, or hear it), the basket (or the salad bowl, or the soup
 * pot) and the stall. Tap a thing on the list and it flies into the
 * container and its line is ticked off; a thing NOT on the list only
 * wiggles, and after two misses the next one to take glows. A recipe
 * (`ordered`) has to be followed line by line — its next line is lit.
 * Everything in → the container jumps.
 */
export function ShopList({ list, stall, into, ordered, seed, itemAria, hearLabel, onSolved, onMiss }: ShopListProps) {
  const order = useMemo(() => shuffle(stall.map((_, i) => i), seed), [stall, seed]);
  const [got, setGot] = useState<string[]>([]);
  const [shake, setShake] = useState<{ index: number; n: number } | null>(null);
  const [misses, setMisses] = useState(0);
  const [flying, setFlying] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const thingRefs = useRef(new Map<number, HTMLSpanElement>());
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const done = got.length === list.length;
  const wanted = (word: string) => list.includes(word) && !got.includes(word) && (!ordered || word === list[got.length]);
  const hinted = !done && misses >= HINT_AFTER ? stall.findIndex((face) => wanted(wordOf(face))) : -1;

  const take = (index: number) => {
    if (done || flying !== null) return;
    const word = wordOf(stall[index]);
    if (!wanted(word)) {
      setShake((last) => ({ index, n: (last?.n ?? 0) + 1 }));
      setMisses((count) => count + 1);
      onMiss();
      return;
    }
    const thing = thingRefs.current.get(index);
    const box = containerRef.current;
    if (thing && box) {
      const from = thing.getBoundingClientRect();
      const to = box.getBoundingClientRect();
      thing.animate(
        [
          { translate: "0px 0px", scale: "1" },
          { translate: `${to.left + to.width / 2 - (from.left + from.width / 2)}px ${to.top + to.height * 0.35 - (from.top + from.height / 2)}px`, scale: "0.45" },
        ],
        { duration: FLY_MS, easing: "cubic-bezier(0.5, 0, 0.75, 0.4)", fill: "forwards" },
      );
    }
    setFlying(index);
    timer.current = window.setTimeout(() => {
      setFlying(null);
      setMisses(0);
      const next = [...got, word];
      setGot(next);
      if (next.length === list.length) onSolved();
    }, FLY_MS);
  };

  /* What is in the container, piled over its mouth. */
  const inside = got.map((word) => stall.find((face) => wordOf(face) === word)).filter((face): face is Face => face !== undefined);

  return (
    /* Phone and tablet: the note beside the container, the stall in a row
       under them. Desktop: note over container on the left, the stall in a
       2x2 on the right — side by side, so it fits the stage's height. */
    <div className="flex w-full max-w-md flex-col items-center gap-4 sm:max-w-xl sm:gap-6 lg:grid lg:max-w-4xl lg:grid-cols-2 lg:items-center lg:gap-10 [@media(max-height:700px)]:gap-3">
      <div className="grid w-full grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] items-center gap-3 sm:gap-6 lg:grid-cols-1 lg:justify-items-center lg:gap-4">
        {/* The note. English — it reads left to right in every language. */}
        <ol dir="ltr" className="card card-clay-white -rotate-1 flex flex-col gap-1.5 p-3 sm:gap-2 sm:p-4 lg:w-full lg:max-w-sm lg:p-4">
          {list.map((word, i) => {
            const isGot = got.includes(word);
            const isNext = ordered && !done && i === got.length;
            return (
              <li
                key={word}
                className={`flex items-center gap-2 rounded-2xl px-1.5 py-1 sm:gap-3 sm:px-2 ${isNext ? "bg-[color-mix(in_srgb,var(--page-accent-color)_22%,transparent)]" : ""}`}
              >
                <CueButton cue={lessonCue.word(word)} label={format(hearLabel, { word })} size="sm" />
                <span className={`min-w-0 flex-1 truncate text-xl font-bold text-[var(--color-ink)] sm:text-2xl ${isGot ? "opacity-45 line-through decoration-[3px]" : ""}`}>
                  {word}
                </span>
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full sm:h-8 sm:w-8 ${isGot ? "clay anim-pop-in text-white" : "letter-slot"}`}
                  style={isGot ? GO : undefined}
                >
                  {isGot && <Check className="h-4 w-4" strokeWidth={3.5} />}
                </span>
              </li>
            );
          })}
        </ol>

        {/* The container, what is already in it piled on top. */}
        <div
          ref={containerRef}
          key={done ? "done" : "filling"}
          className={`relative aspect-square w-full lg:w-[min(14rem,calc(var(--stage-h)*0.38))] ${done ? "anim-jump" : ""}`}
        >
          <Image src={CONTAINERS[into]} alt="" fill preload sizes="(min-width: 1024px) 18rem, 10rem" className="select-none object-contain" />
          <div className="absolute inset-x-[16%] top-[14%] flex h-[38%] items-end justify-center">
            {inside.map((face, i) => (
              <span key={wordOf(face)} className="anim-pop-in relative -mx-[4%] block h-full w-[42%]" style={{ zIndex: i, rotate: `${(i % 2 ? 1 : -1) * 8}deg` }}>
                {face.kind === "picture" && <Image src={face.src} alt="" fill sizes="5rem" className="object-contain" />}
              </span>
            ))}
          </div>
          {done && <Celebration />}
        </div>
      </div>

      {/* The stall: a tile per thing, an empty slot once taken. */}
      <ul
        className="grid w-full grid-cols-[repeat(var(--stall),minmax(0,1fr))] gap-3 sm:gap-4 lg:w-[min(24rem,var(--stage-h))] lg:grid-cols-2 lg:justify-self-center"
        style={{ "--stall": stall.length } as CSSProperties}
      >
        {order.map((index) => {
          const word = wordOf(stall[index]);
          const taken = got.includes(word);
          const isShaking = shake?.index === index;
          return (
            <li key={index} className={`relative ${hinted === index ? "guide-target" : ""}`}>
              {taken ? (
                <span className="letter-slot block aspect-square w-full" />
              ) : (
                <button
                  key={isShaking ? `${index}.${shake.n}` : index}
                  type="button"
                  aria-label={format(itemAria, { word })}
                  onClick={() => take(index)}
                  className={`card card-clay-white flex aspect-square w-full items-center justify-center transition-transform duration-200 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[var(--page-accent-color)] active:scale-95 ${
                    isShaking ? "anim-wiggle" : ""
                  } ${done ? "" : "hover:outline-4 hover:outline-offset-4 hover:outline-[color-mix(in_srgb,var(--page-accent-color)_45%,transparent)]"}`}
                >
                  <span
                    ref={(el) => {
                      if (el) thingRefs.current.set(index, el);
                      else thingRefs.current.delete(index);
                    }}
                    className={`relative flex h-full w-full items-center justify-center ${flying === index ? "z-20" : ""}`}
                  >
                    <FaceView face={stall[index]} size="tile" />
                  </span>
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
