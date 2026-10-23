"use client";

import { useState } from "react";
import Image from "next/image";
import { BackRow } from "@/components/ui/back-button";
import { LevelBadge } from "@/components/ui/level-badge";
import { Loader } from "@/components/ui/loader";
import { AgainButton, NextButton } from "@/components/ui/morph-button";
import { Celebration } from "@/components/ui/celebration";
import { CUPS_LEVELS } from "@/data/cups-levels";
import { CupsGame } from "./cups-game";
import { cupsKey, useProgress } from "@/store/progress";
import { format, dirFor } from "@/lib/format-dict";
import type { Dictionary } from "@/lib/dictionaries/en";
import novaPointing from "../../../../public/assets/learn/nova/classroom/nova-with-a-stick.png";
import novaCheer from "../../../../public/assets/friends/nova.png";

/** Every level's "found it" records the same value: a level is finished
    or not, like a puzzle. */
const DONE = 3;

/* Green is every "Next" on the site (direct request). */
const GO_TONE = { face: "var(--color-go)", edge: "var(--color-go-dark)", text: "#fff" };

type Phase = "play" | "found" | "all";

interface CupsPlayProps {
  dict: Dictionary;
}

/**
 * Nova's Cups (2026-10-23, direct request: the Vegetables lessons' cups as
 * a game of its own on /play): five levels, the course's five vegetables,
 * each a swap more and a little faster. A level starts where the child
 * left off — the first one not yet found — and a found vegetable records
 * its level, like a puzzle. Found → Next (the next level); after the
 * fifth, Nova celebrates and Play again starts over from the first.
 *
 * Nova stands beside the table on a tablet and a desktop, her stick
 * pointing at the cups.
 */
export function CupsPlay({ dict }: CupsPlayProps) {
  const lines = dict.activities;
  const dir = dirFor(dict.locale);
  const hydrated = useProgress((state) => state.hydrated);
  const items = useProgress((state) => state.items);
  const complete = useProgress((state) => state.complete);
  /* Where the child left off, read once the store has loaded — null until
     the child moves on themselves. */
  const firstOpen = Math.max(0, CUPS_LEVELS.findIndex((level) => !items[cupsKey(level.value)]));
  const [chosen, setChosen] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>("play");
  const [round, setRound] = useState(0);
  const at = chosen ?? firstOpen;
  const level = CUPS_LEVELS[at];

  const found = () => {
    /* Pinned first: recording it moves "where the child left off" on,
       which would otherwise skip a level when Next adds one to it. */
    setChosen(at);
    complete(cupsKey(level.value), DONE);
    setPhase(at === CUPS_LEVELS.length - 1 ? "all" : "found");
  };
  const next = () => {
    setChosen(at + 1);
    setPhase("play");
    setRound((r) => r + 1);
  };
  const again = () => {
    setChosen(0);
    setPhase("play");
    setRound((r) => r + 1);
  };

  return (
    <>
      <BackRow href="/play" label={lines.backToActivities}>
        <LevelBadge
          value={level.value}
          word={lines.levelWord}
          label={format(lines.levelLabel, { value: level.value })}
          dir={dir}
        />
      </BackRow>
      <h1 className="sr-only">{lines.cupsCtaButton}</h1>

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-4 px-4 pb-6 sm:gap-6 sm:px-8 lg:pb-10">
        {!hydrated ? (
          <Loader label={dict.ui.loading} />
        ) : phase === "all" ? (
          /* All five found: Nova cheers, and the game starts over. */
          <div className="card card-clay-white anim-pop-in relative flex w-full max-w-md flex-col items-center gap-4 px-6 py-8 text-center sm:py-10">
            <Image src={novaCheer} alt="" sizes="12rem" preload className="anim-pop-in h-[min(12rem,24svh)] w-auto" />
            <p dir={dir} className="text-3xl font-bold text-[var(--color-ink)] sm:text-4xl">
              {lines.cupsWin}
            </p>
            <AgainButton label={lines.again} onPress={again} dir={dir} />
            <Celebration />
          </div>
        ) : (
          <>
            {/* The five levels, the ones found filled in Nova's colour. */}
            <ol className="flex items-center gap-2" aria-hidden>
              {CUPS_LEVELS.map((l, i) => (
                <li
                  key={l.value}
                  className={`h-2.5 w-2.5 rounded-full sm:h-3 sm:w-3 ${
                    i < at || (i === at && phase !== "play") ? "bg-[var(--color-nova)]" : i === at ? "bg-[var(--color-nova)]/45" : "bg-[rgb(var(--shadow-hue)/0.18)]"
                  }`}
                />
              ))}
            </ol>
            <p dir={dir} className="text-center text-lg font-bold text-[var(--color-ink)] sm:text-2xl">
              {format(lines.cupsAsk, { thing: level.word })}
            </p>
            <div className="relative flex w-full items-end justify-center gap-4">
              <CupsGame
                key={`${level.value}.${round}`}
                word={level.word}
                picture={level.picture}
                swaps={level.swaps}
                swapMs={level.swapMs}
                cupAria={lines.cupAria}
                onSolved={found}
              />
              {/* Nova, her stick raised to the table (tablet and desktop). */}
              <Image
                src={novaPointing}
                alt=""
                sizes="12rem"
                preload
                className="anim-pop-in -ms-6 hidden h-auto w-[min(11rem,22svh)] shrink-0 sm:block lg:w-[min(13rem,26svh)]"
              />
            </div>
            <div className="flex h-16 items-center justify-center sm:h-20">
              {phase === "found" && <NextButton label={lines.next} tone={GO_TONE} onPress={next} dir={dir} />}
            </div>
          </>
        )}
      </div>
    </>
  );
}
