"use client";

import { useMemo, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { Celebration } from "@/components/ui/celebration";
import { MARKET_BAG } from "@/data/market";
import { format } from "@/lib/format-dict";
import { lessonCue } from "@/lib/cue";
import { shuffle } from "@/lib/seeded";
import type { Face } from "@/types/course";
import { ClayWord } from "./clay-word";
import { CueButton } from "./cue-button";
import { FaceView } from "./face";

/** Two misses and the right choice starts to glow. */
const HINT_AFTER = 2;

type Phase = "closed" | "peek" | "out";

/* Where the thing stands, as its own height: hidden in the bag, peeking
   over its top as a shadow, then out and above it. */
const RISE: Record<Phase, string> = { closed: "45%", peek: "-8%", out: "-58%" };

interface RevealBagProps {
  word: string;
  picture: StaticImageData;
  /** The other thing it could be. */
  decoy: Face;
  /** Deals which side the right choice is on. */
  seed: string;
  /** "Open the bag" — the bag's name for a screen reader. */
  bagAria: string;
  /** "Hear {word}" — the speaker's name. */
  hearLabel: string;
  onSolved: () => void;
  onMiss: () => void;
}

/**
 * What's in the bag? Nova's market bag, gently breathing — tap it and
 * something rises over its top, but only as a SHADOW. Two pictures come up
 * under the bag: which one is it? The right one and the thing jumps out in
 * its own colours, with its word in clay letters and its speaker (listen
 * first, then everything else). A wrong pick only wiggles; after two, the
 * right one glows.
 */
export function RevealBag({ word, picture, decoy, seed, bagAria, hearLabel, onSolved, onMiss }: RevealBagProps) {
  const [phase, setPhase] = useState<Phase>("closed");
  const [wrong, setWrong] = useState<number | null>(null);
  const [misses, setMisses] = useState(0);
  const choices = useMemo<Face[]>(() => [{ kind: "picture", src: picture, word }, decoy], [picture, word, decoy]);
  const order = useMemo(() => shuffle([0, 1], seed), [seed]);

  const choose = (index: number) => {
    if (phase !== "peek") return;
    if (index === 0) {
      setPhase("out");
      onSolved();
      return;
    }
    setWrong(index);
    setMisses((count) => count + 1);
    onMiss();
  };

  return (
    <div className="flex w-full flex-col items-center gap-5 sm:gap-7 lg:gap-6 [@media(max-height:700px)]:gap-3">
      <div className="card card-clay-white card-bare-lg relative aspect-square w-[min(17rem,31svh)] overflow-hidden sm:w-[min(20rem,30svh)] lg:w-[min(24rem,calc(var(--stage-h)-11rem))]">
        {/* The thing, BEHIND the bag: only what rises over its top shows. */}
        <span
          className="absolute left-1/2 top-[30%] h-[44%] w-[44%] transition-[translate,filter,opacity] duration-700 ease-[cubic-bezier(0.34,1.4,0.5,1)]"
          style={{
            translate: `-50% ${RISE[phase]}`,
            filter: phase === "out" ? "none" : "brightness(0) opacity(0.8)",
            opacity: phase === "closed" ? 0 : 1,
          }}
        >
          <Image src={picture} alt="" fill preload sizes="(min-width: 1024px) 11rem, 8rem" className="select-none object-contain" />
        </span>
        <button
          type="button"
          aria-label={bagAria}
          onClick={() => setPhase("peek")}
          disabled={phase !== "closed"}
          className={`absolute inset-x-[12%] bottom-[3%] top-[30%] z-10 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[var(--page-accent-color)] ${
            phase === "closed" ? "anim-breathe cursor-pointer" : ""
          }`}
        >
          <Image src={MARKET_BAG} alt="" fill preload sizes="(min-width: 1024px) 18rem, 12rem" className="pointer-events-none select-none object-contain object-bottom" />
        </button>
        {phase === "out" && <Celebration />}
      </div>

      {/* One slot under the bag, the same height whatever is in it, so
          nothing jumps: empty, then the two choices, then the word. */}
      <div className="flex h-[min(7rem,14svh)] items-center justify-center lg:h-[min(8.5rem,16svh)]">
        {phase === "peek" && (
          <ul className="grid h-full grid-cols-2 gap-4 sm:gap-5">
            {order.map((index) => (
              <li key={index} className={`anim-pop-in relative aspect-square h-full ${misses >= HINT_AFTER && index === 0 ? "guide-target" : ""}`}>
                <button
                  type="button"
                  onClick={() => choose(index)}
                  onAnimationEnd={() => setWrong(null)}
                  className={`card card-clay-white flex h-full w-full items-center justify-center transition-transform duration-200 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[var(--page-accent-color)] active:scale-95 hover:outline-4 hover:outline-offset-4 hover:outline-[color-mix(in_srgb,var(--page-accent-color)_45%,transparent)] ${
                    wrong === index ? "anim-wiggle" : ""
                  }`}
                >
                  <FaceView face={choices[index]} size="tile" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {phase === "out" && (
          <div className="flex items-center gap-4 sm:gap-6">
            <CueButton cue={lessonCue.word(word)} label={format(hearLabel, { word })} size="lg" invite />
            <ClayWord word={word} size="sm" />
          </div>
        )}
      </div>
    </div>
  );
}
