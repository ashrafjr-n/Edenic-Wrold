"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import { ArrowRight, RotateCcw, Star, Timer } from "lucide-react";
import type { MemoryLevel } from "@/types/memory";
import { memoryFaces } from "@/data/memory-levels";
import { deckFor, secondsLeft } from "@/lib/memory-deck";
import { memoryKey, useProgress } from "@/store/progress";
import { Button3D } from "@/components/ui/button-3d";
import { BackButton } from "@/components/ui/back-button";
import { LevelBadge } from "@/components/ui/level-badge";
import { Celebration } from "@/components/ui/celebration";

interface MemoryBoardProps {
  level: MemoryLevel;
  /** The next level, or back to the list when this was the last one. */
  nextHref: string;
}

/** How long a wrong pair stays up before turning back over. Long enough to
    actually be READ and remembered — that pause is the whole game — short
    enough that a child isn't left waiting on it. */
const WRONG_MS = 900;

/** The board never grows past this per column, so a three-pair level doesn't
    end up with playing cards the size of a hand on a desktop. */
const MAX_CARD = "8.5rem";

/** Levels are not scored — for now. Stars were built here and taken out
    again on request, with a better idea for scoring still to come; the store
    only needs a non-zero value to read a level as finished, so every
    completion records the same one, exactly as a puzzle does. */
const DONE = 3;

type ClockVars = CSSProperties & { "--clock-left"?: string };

/**
 * One level of Memory Match: the header the spec asks for (level, clock) and
 * the grid of cards under it.
 *
 * **The clock never ends the game.** It counts down from the level's
 * comfortable time and stops at zero, where it goes quiet and simply stops
 * being worth a star — there is no "time's up", and the board stays playable
 * for as long as a child needs. It also doesn't start until the first card is
 * turned, so looking at the board costs nothing.
 *
 * A wrong pair is never told off: the two cards wiggle and turn back, the
 * same call every other activity on the site makes. A found pair stays face
 * up with a gold rim.
 *
 * It owns the back button as well as the board, for the same reason
 * `PuzzlePlay` does — the header shows live state (the clock), so the whole
 * row has to be inside the client component that has it.
 */
export function MemoryBoard({ level, nextHref }: MemoryBoardProps) {
  const complete = useProgress((state) => state.complete);

  /* Bumped by "Again", and the only thing that re-deals the board. It starts
     at 0, which is what the server rendered and what the first client render
     agrees on — so the deal is SSR-safe and still different on a replay. */
  const [round, setRound] = useState(0);
  const deck = useMemo(() => deckFor(level, round), [level, round]);

  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  /* The two cards currently being turned back over. They wiggle, and nothing
     can be tapped while they are up. */
  const [wrong, setWrong] = useState<number[] | null>(null);
  const [finished, setFinished] = useState(false);

  const wrongTimer = useRef<number | null>(null);

  const done = finished;
  const remaining = secondsLeft(level, elapsed);

  /* The clock. A real subscription to something outside React (an interval),
     which is what `useEffect` is actually for — it starts on the first flip,
     stops the moment the level is done, and cleans up either way. */
  useEffect(() => {
    if (!running || done) return;

    const id = window.setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [running, done]);

  useEffect(() => {
    return () => {
      if (wrongTimer.current !== null) window.clearTimeout(wrongTimer.current);
    };
  }, []);

  const isOpen = (index: number) =>
    flipped.includes(index) || matched.includes(deck[index].faceId);

  const flip = (index: number) => {
    /* Nothing is tappable while a wrong pair is on its way back, and a card
       that is already up cannot be tapped again — turning the same card twice
       must never count as a pair. */
    if (wrong || done || flipped.length === 2 || isOpen(index)) return;

    if (!running) setRunning(true);

    const next = [...flipped, index];
    setFlipped(next);
    if (next.length < 2) return;

    const [a, b] = next;
    if (deck[a].faceId === deck[b].faceId) {
      const nextMatched = [...matched, deck[a].faceId];
      setMatched(nextMatched);
      setFlipped([]);

      if (nextMatched.length === level.pairs) {
        /* Recorded in the handler that finished it, never in an effect
           watching for it — the same call the puzzle makes. */
        setFinished(true);
        complete(memoryKey(level.value), DONE);
      }
      return;
    }

    setWrong(next);
    wrongTimer.current = window.setTimeout(() => {
      setFlipped([]);
      setWrong(null);
    }, WRONG_MS);
  };

  const again = () => {
    if (wrongTimer.current !== null) window.clearTimeout(wrongTimer.current);
    setRound((r) => r + 1);
    setFlipped([]);
    setMatched([]);
    setElapsed(0);
    setRunning(false);
    setWrong(null);
    setFinished(false);
  };

  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-8">
        <div
          className="anim-drop-in relative flex items-center justify-center"
          style={{ animationDelay: "0.1s" }}
        >
          {/* The wrapper carries the positioning, not the button: `.btn3d`
              sets `position: relative` and is UNLAYERED, so a Tailwind
              `absolute` utility on the button itself silently loses. */}
          <span className="absolute left-0 top-0">
            <BackButton href="/activities/memory-match" label="Back to the levels" />
          </span>

          {/* Which level this is, facing the back button across the row —
              the two ends of the chrome row, same size and same colour. It
              replaced a centred "LEVEL 01" caption above the clock, which
              was a heading-sized piece of chrome for a single digit. */}
          <span className="absolute right-0 top-0">
            <LevelBadge value={level.value} label={`Level ${level.value}`} />
          </span>

          {/* The clock is the only thing in the middle now, and it sits
              BELOW the line the two corner chips are on rather than level
              with them — it is the one thing on this screen that changes on
              its own, so it gets the centre of the page to itself. The ring
              is the time left, drawn as a share of the level's own target, so
              a child who cannot yet read the number still sees it going
              round. At zero it empties and the whole dial goes quiet rather
              than red: the clock stops mattering there, it does not start
              threatening. */}
          <div
            className={`memory-clock mt-4 sm:mt-6 ${remaining === 0 ? "is-spent" : ""}`}
            style={
              {
                "--clock-left": `${(remaining / level.seconds) * 100}%`,
              } as ClockVars
            }
            /* Announced only when it runs out — a per-second live region
               would talk over the whole game. */
            aria-live="off"
            role="timer"
            aria-label={`${remaining} seconds left`}
          >
            <span className="memory-clock-face">
              <Timer
                className="h-4 w-4 opacity-70 sm:h-5 sm:w-5"
                strokeWidth={2.75}
                aria-hidden
              />
              <span className="memory-clock-value">{remaining}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full flex-1 flex-col items-center justify-center px-4 py-6 sm:px-8 sm:py-8">
        <div
          className="grid w-full gap-2.5 sm:gap-4"
          style={
            {
              gridTemplateColumns: `repeat(${level.cols}, minmax(0, 1fr))`,
              maxWidth: `calc(${level.cols} * ${MAX_CARD})`,
            } as CSSProperties
          }
        >
          {deck.map((card, index) => {
            const face = memoryFaces[card.faceId];
            const open = isOpen(index);
            const isMatched = matched.includes(card.faceId);
            const isWrong = wrong?.includes(index) ?? false;

            return (
              <button
                key={card.key}
                type="button"
                onClick={() => flip(index)}
                disabled={done || isMatched}
                aria-label={open ? face.label : `Card ${index + 1}, face down`}
                className={`memory-card anim-rise-in ${open ? "is-open" : ""} ${
                  isMatched ? "is-matched" : ""
                } ${isWrong ? "anim-wiggle" : ""}`}
                style={{ animationDelay: `${0.05 + index * 0.04}s` }}
              >
                {/* The flip is a transform on this inner element, which is why
                    the wiggle can live on the button without the two fighting
                    over the same property. */}
                <span className="memory-card-inner">
                  <span className="memory-face memory-face--back">
                    <Star
                      className="h-1/3 w-1/3 fill-current"
                      strokeWidth={2}
                      aria-hidden
                    />
                  </span>

                  <span className="memory-face memory-face--front">
                    <Image
                      src={face.src}
                      alt=""
                      width={140}
                      height={140}
                      className="h-full w-full object-contain"
                    />
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {done && (
          <div className="anim-pop-in relative mt-7 flex flex-col items-center gap-5 sm:mt-9 sm:gap-6">
            <Celebration />

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Button3D
                variant="calm"
                tone={{ face: "var(--surface)", text: "var(--color-ink)" }}
                onClick={again}
                className="btn3d--clay-white px-6 py-3 text-base sm:px-7 sm:text-lg"
              >
                <RotateCcw className="h-5 w-5" strokeWidth={2.75} />
                Again
              </Button3D>

              <Button3D
                tone={{
                  face: "var(--color-gold)",
                  edge: "var(--color-gold-dark)",
                  text: "var(--color-ink)",
                }}
                href={nextHref}
                className="px-6 py-3 text-base sm:px-7 sm:text-lg"
              >
                Next
                <ArrowRight className="h-5 w-5" strokeWidth={2.75} />
              </Button3D>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
