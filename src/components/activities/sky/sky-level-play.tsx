"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { CupsGame } from "@/components/activities/cups/cups-game";
import { MemoryBoard } from "@/components/activities/memory/memory-board";
import { PuzzlePlay } from "@/components/activities/puzzle/puzzle-play";
import { WorldDone } from "@/components/learn/lesson/world-done";
import { worldCover } from "@/components/learn/lesson/lesson-world";
import { BackRow, characterAccent, pageAccent } from "@/components/ui/back-button";
import { FriendSays } from "@/components/ui/friend-says";
import { LevelBadge } from "@/components/ui/level-badge";
import { NextButton } from "@/components/ui/morph-button";
import { characters } from "@/data/characters";
import { CLASSROOMS } from "@/data/classroom";
import { CUPS_LEVELS } from "@/data/cups-levels";
import { findMemoryLevel } from "@/data/memory-levels";
import { findPuzzleStage } from "@/data/puzzles";
import { SKY_KEY, SKY_LEVELS, findSkyLevel, type SkyHost, type SkyLevel } from "@/data/sky-levels";
import { askChest } from "@/lib/chest-run";
import { dirFor, format } from "@/lib/format-dict";
import { isUpright } from "@/lib/puzzle-pieces";
import { useWide } from "@/lib/use-wide";
import { itemKey, useProgress } from "@/store/progress";
import type { Dictionary } from "@/lib/dictionaries/en";
import balloon from "../../../../public/assets/play/sky/balloon.png";
import skyLandscape from "../../../../public/assets/play/sky/level-landscape.jpg";
import skyPortrait from "../../../../public/assets/play/sky/level-portrait.jpg";
import pinkiHello from "../../../../public/assets/friends/pinki.png";

/** A level is finished or not, like a puzzle. */
const DONE = 3;
/** A solved challenge's cheer, then the next one comes by itself — no Next. */
const CHEER_MS = 1500;
/* Green is every "Next" on the site. */
const GO_TONE = { face: "var(--color-go)", edge: "var(--color-go-dark)", text: "#fff" };
/** The friend's picture when they join (the waving one — Pinki's for now). */
const HELLO = { pinki: pinkiHello } as const;

type Phase = "hello" | "play" | "done";

interface SkyLevelPlayProps {
  level: SkyLevel;
  dict: Dictionary;
}

/**
 * One level of the Sky Trail (2026-11-12): three short challenges, one after
 * another, out of the games that exist — a hosted game (`SkyHost`) keeps its
 * own board and chrome, goes back to the sky, wears this level's number and
 * records nothing of its own. A solved challenge cheers and the next arrives
 * by itself; the third finishes the level (`play.sky.<n>`), and the done card
 * (the lessons' own `WorldDone`) leads straight to the next level — the last
 * one back to the sky, where the camera walks on and the big star lights.
 *
 * The level happens in the sky: its world out of focus behind the games, as a
 * lesson's world is behind its steps. A friend who joins on this level says
 * so first (`FriendSays`), every time the level is opened.
 */
export function SkyLevelPlay({ level, dict }: SkyLevelPlayProps) {
  const words = dict.sky;
  const dir = dirFor(dict.locale);
  const wide = useWide();
  const complete = useProgress((state) => state.complete);
  const friend = level.friend ? characters.find((c) => c.id === level.friend) : undefined;
  const joins = Boolean(level.friend) && findSkyLevel(level.value - 1)?.friend !== level.friend;
  const [phase, setPhase] = useState<Phase>(joins ? "hello" : "play");
  const [step, setStep] = useState(0);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const last = step === level.challenges.length - 1;
  const solved = () => {
    /* Recorded in the handler that finished it, never in an effect. */
    if (last) complete(itemKey(SKY_KEY.owner, SKY_KEY.course, level.value), DONE);
    timer.current = window.setTimeout(() => (last ? setPhase("done") : setStep(step + 1)), CHEER_MS);
  };

  const host: SkyHost = { level: level.value, backHref: "/play", backLabel: words.back, onSolved: solved, help: level.friend === "pinki" };
  const challenge = level.challenges[step];
  const memory = challenge.game === "memory" ? findMemoryLevel(challenge.level) : undefined;
  const puzzle = challenge.game === "puzzle" ? findPuzzleStage(challenge.stage) : undefined;
  const cups = challenge.game === "cups" ? CUPS_LEVELS.find((l) => l.value === challenge.level) : undefined;
  /* An upright puzzle has to fit one phone screen with its heap: the padding its own page gives it. */
  const upright = Boolean(puzzle?.picture && isUpright(puzzle.picture.image));
  const nextLevel = SKY_LEVELS.find((l) => l.value === level.value + 1);
  const badge = (
    <LevelBadge value={level.value} word={dict.activities.levelWord} label={format(dict.activities.levelLabel, { value: level.value })} dir={dir} />
  );

  return (
    <main
      className={`relative flex flex-1 flex-col overflow-x-clip ${
        phase !== "play" || cups ? "" : puzzle && upright ? "pb-2 pt-3 sm:pb-8 sm:pt-5" : "pb-16 pt-5 sm:pb-20"
      }`}
      /* The sky's blue; a friend's own colour once they fly along. */
      style={friend ? characterAccent(friend) : pageAccent("var(--brand)", "var(--brand-dark)", "#fff")}
    >
      <h1 className="sr-only">{format(words.levelTitle, { n: level.value })}</h1>

      {/* The sky, out of focus, behind everything. */}
      <div className="world-frame -z-[5]" aria-hidden>
        <div className="world-cover" style={worldCover(wide)}>
          <Image src={wide ? skyLandscape : skyPortrait} alt="" fill preload sizes="100vw" className="object-cover" />
        </div>
      </div>

      {phase === "play" && (
        /* Which of the three this is: on the chrome's own line, between the
           back button and the level's badge. */
        <div className={`pointer-events-none absolute inset-x-0 z-20 flex h-12 items-center justify-center sm:h-14 ${puzzle && upright ? "top-3 sm:top-5" : "top-5"}`}>
          <ol
            className="card card-clay-white card-pill flex items-center gap-2 px-3.5 py-2.5"
            aria-label={format(words.challengeOf, { n: step + 1, total: level.challenges.length })}
          >
            {level.challenges.map((_, i) => (
              <li
                key={i}
                className={`h-3 rounded-full transition-all duration-300 ${
                  i < step ? "w-3 bg-[var(--color-go)]" : i === step ? "w-7 bg-[var(--page-accent-color)]" : "w-3 bg-[rgb(var(--shadow-hue)/0.2)]"
                }`}
              />
            ))}
          </ol>
        </div>
      )}

      {phase === "hello" && friend && level.friend && (
        <>
          <BackRow href="/play" label={words.back}>
            {badge}
          </BackRow>
        <FriendSays
          picture={HELLO[level.friend as keyof typeof HELLO] ?? CLASSROOMS[level.friend].cheer}
          ink={friend.accent}
          lines={[words.pinkiHello, words.pinkiPower]}
          skipLabel={words.skip}
          dir={dir}
          onDone={() => setPhase("play")}
        />
        </>
      )}

      {phase === "hello" ? null : phase === "done" ? (
        <>
          <BackRow href="/play" label={words.back}>
            {badge}
          </BackRow>
          {/* One block in the middle: `.world-done` centres itself with auto
              margins, which would push the way on to the bottom of the page. */}
          <div className="mx-auto my-auto flex w-full max-w-5xl flex-col items-center gap-5 px-4 pb-8 sm:gap-7 sm:px-8">
            <WorldDone
              title={words.levelDone}
              line={format(nextLevel ? words.levelDoneLine : words.allDoneLine, { n: level.value })}
              cheer={level.friend ? CLASSROOMS[level.friend].cheer : balloon}
              dir={dir}
            />
            {nextLevel ? (
              <NextButton label={words.nextLevel} tone={GO_TONE} href={`/play/sky/${nextLevel.value}`} dir={dir} />
            ) : (
              /* The last level: back in the sky the camera walks on to the big star, and it lights. */
              <NextButton label={words.toTheStar} tone={GO_TONE} href="/play" onPress={() => askChest(`${SKY_KEY.owner}.${SKY_KEY.course}`)} dir={dir} />
            )}
          </div>
        </>
      ) : memory ? (
        <MemoryBoard key={step} level={memory} host={host} dict={dict} />
      ) : puzzle?.picture && puzzle.grid ? (
        <PuzzlePlay key={step} stage={puzzle.value} picture={puzzle.picture} grid={puzzle.grid} upright={upright} host={host} dict={dict} />
      ) : cups ? (
        <>
          <BackRow href="/play" label={words.back}>
            {badge}
          </BackRow>
          <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-4 px-4 pb-6 sm:gap-6 sm:px-8 lg:pb-10">
            <p dir={dir} className="card card-clay-white card-pill px-6 py-2.5 text-center text-lg font-bold text-[var(--color-ink)] sm:text-2xl">
              {format(dict.activities.cupsAsk, { thing: cups.word })}
            </p>
            <CupsGame key={step} word={cups.word} picture={cups.picture} swaps={cups.swaps} swapMs={cups.swapMs} cupAria={dict.activities.cupAria} onSolved={solved} />
          </div>
        </>
      ) : null}
    </main>
  );
}
