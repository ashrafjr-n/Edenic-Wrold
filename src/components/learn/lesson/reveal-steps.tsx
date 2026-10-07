"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { Celebration } from "@/components/ui/celebration";
import { lessonCue, playCue } from "@/lib/cue";
import type { RevealScene } from "@/types/course";
import { ClayWord } from "./clay-word";
import { SHARDS } from "./pop-balloons";

/** A step spreading over the picture — kept in step with `.season-reveal`. */
const REVEAL_MS = 900;
/** The last step is in, then the season is done. */
const DONE_MS = 500;

/* The picture's width, capped by the height a step has, so it never pushes
   the page into a scroll: `--ratio` is its w/h. Phone and tablet: over the
   word; desktop: beside it (the word card's layout), the stage's full
   height. */
const SCENE_SIZE =
  "max-w-[min(100%,calc((100svh-26rem-min(2.5rem,4svh))*var(--ratio)))] sm:max-w-[min(30rem,calc((100svh-44rem)*var(--ratio)))] lg:max-w-[min(36rem,calc((var(--stage-h)-2rem)*var(--ratio)))]";

interface RevealStepsProps {
  /** What comes, in English: the season, the food. */
  word: string;
  /** Or one word per step (the months filling the year): each shows under
      the picture, and is said, as its step comes in. */
  words?: readonly string[];
  scene: RevealScene;
  /** Each spot's name for a screen reader ("Tap to bring more spring"). */
  spotLabels: readonly string[];
  onSolved: () => void;
}

/**
 * The magic button: the picture before it comes — the season's island
 * bare, the food's seed in the soil, Nova's year wheel with its next months
 * empty. One spot glows; tap it and the next part spreads over the picture
 * from there (the grass, the sprout, the month's slice…), then the next
 * spot glows. All in → it is all there, its word is said and it jumps.
 * Nothing can go wrong — the thing is the lesson, so nothing is chosen.
 *
 * Every step is one whole frame (`SEASON_SCENES`), laid over the last and
 * uncovered by a circle growing from the spot (`.season-reveal`); once it
 * has spread the one under it goes (two would double the soft edges). All
 * frames load up front, so none arrives after its spread has played.
 */
export function RevealSteps({ word, words, scene, spotLabels, onSolved }: RevealStepsProps) {
  const { frames, spots } = scene;
  /* How many steps are in, and how many have spread — the next spot only
     shows once the last one has. */
  const [brought, setBrought] = useState(0);
  const [settled, setSettled] = useState(0);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const spreading = settled < brought;
  const solved = settled >= spots.length;
  const [x, y] = spots[Math.max(0, brought - 1)];
  const from = { "--x": `${x}%`, "--y": `${y}%` } as CSSProperties;

  const bring = () => {
    if (spreading || brought >= spots.length) return;
    const next = brought + 1;
    setBrought(next);
    timer.current = window.setTimeout(() => {
      setSettled(next);
      if (words) void playCue(lessonCue.word(words[next - 1]));
      if (next < spots.length) return;
      if (!words) void playCue(lessonCue.word(word));
      timer.current = window.setTimeout(onSolved, DONE_MS);
    }, REVEAL_MS);
  };

  return (
    <div className="card card-clay-white card-bare-lg flex w-full max-w-2xl flex-col items-center gap-3 px-3 py-4 sm:gap-5 sm:px-8 sm:py-6 lg:max-w-4xl lg:flex-row lg:justify-center lg:gap-12 lg:py-2 [@media(max-height:700px)]:gap-2 [@media(max-height:700px)]:py-3">
      <div
        className={`relative w-full [container-type:inline-size] ${SCENE_SIZE}`}
        style={{ aspectRatio: frames[0].width / frames[0].height, "--ratio": frames[0].width / frames[0].height } as CSSProperties}
      >
        {/* Its shadow on the card — the render has none. */}
        <span aria-hidden className="absolute inset-x-[8%] -bottom-[3%] h-[14%] rounded-[50%] bg-[radial-gradient(closest-side,rgb(var(--shadow-hue)/0.3),transparent)]" />
        {frames.map((frame, k) => (
          <Image
            key={k}
            src={frame}
            alt=""
            fill
            loading="eager"
            sizes="(min-width: 1024px) 40rem, (min-width: 640px) 30rem, 92vw"
            draggable={false}
            className={`pointer-events-none select-none object-contain ${
              k === brought || (spreading && k === brought - 1) ? "" : "invisible"
            } ${spreading && k === brought ? "season-reveal" : ""}`}
            style={spreading && k === brought ? from : undefined}
          />
        ))}

        {/* Where it was tapped: a ring and sparks going out. */}
        {spreading && (
          <span key={`burst-${brought}`} aria-hidden className="pointer-events-none absolute z-[3] h-[16cqw] w-[16cqw]" style={{ left: `${x}%`, top: `${y}%`, translate: "-50% -50%" }}>
            <span className="pop-ring absolute inset-0 rounded-full border-4 border-[var(--page-accent-color)]" />
            {SHARDS.map(([dx, dy], i) => (
              <span
                key={i}
                className="pop-shard absolute left-1/2 top-1/2 h-[22%] w-[22%] rounded-full bg-[var(--page-accent-color)]"
                style={{ "--shard-x": `${dx}%`, "--shard-y": `${dy}%` } as CSSProperties}
              />
            ))}
          </span>
        )}

        {/* The one spot to tap now. */}
        {!spreading && brought < spots.length && (
          <button
            key={brought}
            type="button"
            aria-label={spotLabels[brought]}
            onClick={bring}
            className="anim-pop-in absolute z-[2] h-[15cqw] w-[15cqw] -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[var(--page-accent-color)]"
            style={{ left: `${spots[brought][0]}%`, top: `${spots[brought][1]}%` }}
          >
            <span className="guide-target block h-full w-full rounded-full">
              <span
                className="season-spot clay flex h-full w-full items-center justify-center rounded-full bg-white text-[var(--page-accent-color)]"
                style={{ "--clay-edge": "var(--page-accent-edge)" } as CSSProperties}
              >
                <Sparkles className="h-1/2 w-1/2" strokeWidth={2.5} />
              </span>
            </span>
          </button>
        )}

        {solved && <Celebration />}
      </div>

      {/* English in every locale: never mirrored. No speaker here — the word
          card before it is where the word is heard (direct request). */}
      <div dir="ltr" className={`flex items-center justify-center lg:shrink-0 ${solved ? "anim-jump" : ""}`}>
        {words ? (
          /* The month just come in; before the first, its place is kept. */
          <span key={settled} className={settled ? "anim-pop-in" : "invisible"}>
            <ClayWord word={words[Math.max(0, settled - 1)]} size="sm" />
          </span>
        ) : (
          <ClayWord word={word} size="sm" />
        )}
      </div>
    </div>
  );
}
