"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { MemoryBoard } from "@/components/activities/memory/memory-board";
import { PuzzlePlay } from "@/components/activities/puzzle/puzzle-play";
import { SkySearchPlay } from "@/components/activities/sky/sky-search";
import { SpellWord } from "@/components/learn/lesson/spell-word";
import { WordCard } from "@/components/learn/lesson/word-card";
import { WorldDone } from "@/components/learn/lesson/world-done";
import { worldCover } from "@/components/learn/lesson/lesson-world";
import { BackRow, characterAccent, pageAccent } from "@/components/ui/back-button";
import { FriendSays } from "@/components/ui/friend-says";
import { LevelBadge } from "@/components/ui/level-badge";
import { NextButton } from "@/components/ui/morph-button";
import { characters } from "@/data/characters";
import { CLASSROOMS } from "@/data/classroom";
import { SKY_KEY, findSkyLevel, worldOf, type SkyHost, type SkyLevel } from "@/data/sky-levels";
import { askChest } from "@/lib/chest-run";
import { lessonCue } from "@/lib/cue";
import { dirFor, format } from "@/lib/format-dict";
import { isUpright } from "@/lib/puzzle-pieces";
import { useWide } from "@/lib/use-wide";
import { itemKey, useProgress } from "@/store/progress";
import type { Dictionary } from "@/lib/dictionaries/en";
import balloon from "../../../../public/assets/play/sky/balloon.png";
import skyLandscape from "../../../../public/assets/play/sky/night/level-landscape.jpg";
import skyPortrait from "../../../../public/assets/play/sky/night/level-portrait.jpg";
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
 * One level of the Sky Trail (2026-11-12): its steps, one after another
 * (`SkyStep`) — the word (the lessons' own `WordCard`, then `SpellWord`), a
 * search in the level's view of the sky (`SkySearchPlay`), and a closing game
 * that already exists: a hosted game (`SkyHost`) keeps its own board and
 * chrome, goes back to the sky, wears this level's number and records nothing
 * of its own. A solved step cheers and the next arrives by itself (only the
 * word card, with nothing to solve, has a Next); the last finishes the level
 * (`play.sky.<n>`), and the done card (the lessons' own `WorldDone`) leads
 * straight to the next level — a world's last one back to the sky, where the
 * camera walks on to the friend's house.
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

  const last = step === level.steps.length - 1;
  const solved = () => {
    /* Recorded in the handler that finished it, never in an effect. */
    if (last) complete(itemKey(SKY_KEY.owner, SKY_KEY.course, level.value), DONE);
    timer.current = window.setTimeout(() => (last ? setPhase("done") : setStep(step + 1)), CHEER_MS);
  };

  const host: SkyHost = { level: level.value, backHref: "/play", backLabel: words.back, onSolved: solved, help: level.friend === "pinki" };
  const now = level.steps[step];
  /* An upright puzzle has to fit one phone screen with its heap: the padding its own page gives it. */
  const upright = now.kind === "puzzle" && isUpright(now.picture.image);
  /* A hosted game brings its own chrome row; the level's own steps stand under the back row. */
  const hosted = now.kind === "memory" || now.kind === "puzzle";
  /* On within its world; its last level leads to the friend's house at the world's end. */
  const world = worldOf(level.value);
  const nextLevel = world?.levels.includes(level.value + 1) ? findSkyLevel(level.value + 1) : undefined;
  const doorFriend = characters.find((c) => c.id === world?.door);
  const badge = (
    <LevelBadge value={level.value} word={dict.activities.levelWord} label={format(dict.activities.levelLabel, { value: level.value })} dir={dir} />
  );

  return (
    <main
      className={`relative flex flex-1 flex-col overflow-x-clip ${
        phase !== "play" || !hosted ? "" : upright ? "pb-2 pt-3 sm:pb-8 sm:pt-5" : "pb-16 pt-5 sm:pb-20"
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
        /* Which challenge this is: on the chrome's own line, between the
           back button and the level's badge. */
        <div className={`pointer-events-none absolute inset-x-0 z-20 flex h-12 items-center justify-center sm:h-14 ${upright ? "top-3 sm:top-5" : "top-5"}`}>
          <ol
            className="card card-clay-white card-pill flex items-center gap-2 px-3.5 py-2.5"
            aria-label={format(words.challengeOf, { n: step + 1, total: level.steps.length })}
          >
            {level.steps.map((_, i) => (
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
              /* A world's last level: back in the sky the camera walks on to the friend's
                 house — its door opens if their stars are in hand. */
              <NextButton label={format(words.toTheDoor, { name: doorFriend?.name ?? "" })} tone={GO_TONE} href="/play" onPress={() => askChest(`${SKY_KEY.owner}.${SKY_KEY.course}`)} dir={dir} />
            )}
          </div>
        </>
      ) : now.kind === "memory" ? (
        <MemoryBoard key={step} level={now.level} host={host} dict={dict} />
      ) : now.kind === "puzzle" ? (
        <PuzzlePlay key={step} stage={level.value} picture={now.picture} grid={now.grid} upright={upright} host={host} dict={dict} />
      ) : (
        <>
          <BackRow href="/play" label={words.back}>
            {badge}
          </BackRow>
          {now.kind === "search" ? (
            <SkySearchPlay key={step} scene={now.scene} ask={words[now.ask]} thingAria={words.searchThingAria} cloudAria={words.searchCloudAria} dir={dir} onSolved={solved} />
          ) : (
            /* The word, as a lesson gives it: on white clay over the sky. `--stage-h`
               is what the lessons' word card sizes its picture by on a desktop. */
            <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-5 px-4 pb-8 sm:gap-7 sm:px-8" style={{ "--stage-h": "30rem" } as CSSProperties}>
              <div className="card card-clay-white anim-pop-in flex w-full max-w-xl flex-col items-center px-3 py-4 sm:px-6 sm:py-6 lg:w-auto lg:max-w-none">
                {now.kind === "word" ? (
                  <WordCard word={now.word} picture={now.picture} cue={lessonCue.word(now.word)} label={format(dict.lessonPlayer.hearWord, { word: now.word })} />
                ) : (
                  <SpellWord
                    key={step}
                    word={now.word}
                    seed={`sky.${level.value}.${step}`}
                    letterAria={dict.lessonPlayer.letterAria}
                    hint
                    onSolved={solved}
                    onMiss={() => undefined}
                    onStarted={() => undefined}
                  />
                )}
              </div>
              {now.kind === "word" && <NextButton key={step} label={dict.lessonPlayer.next} tone={GO_TONE} onPress={() => setStep(step + 1)} dir={dir} />}
            </div>
          )}
        </>
      )}
    </main>
  );
}
