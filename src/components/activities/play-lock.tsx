"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Lock, LockOpen } from "lucide-react";
import { Button3D } from "@/components/ui/button-3d";
import { FriendSays } from "@/components/ui/friend-says";
import { CLASSROOMS } from "@/data/classroom";
import { playSfx } from "@/lib/cue";
import { format } from "@/lib/format-dict";
import type { Dictionary } from "@/lib/dictionaries/en";
import { playOpenKey, STARS_PER_GAME, usePlayStars, useProgress, type PlayGame } from "@/store/progress";
import chestStar from "../../../public/assets/learn/chest-star.png";

type FlyVars = CSSProperties & Record<"--from-x" | "--from-y" | "--mid-x" | "--mid-y" | "--to-x" | "--to-y", string>;

/** The stars' flight (`.play-star-fly`, 0.8 s) and the second star's lag. */
const FLY_MS = 800;
const STAGGER_MS = 150;
/** The padlock springs open once both stars are in… */
const OPEN_MS = FLY_MS + STAGGER_MS;
/** …and the scrim has lifted (`.play-lock--opening`: 1.05 s + 0.5 s). */
const DONE_MS = 1550;
/** The flying star's box (`.play-star-fly`, 2.6rem). */
const STAR_PX = 41.6;

type Phase = "idle" | "flying" | "open";

interface PlayLockProps {
  game: PlayGame;
  /** The game's name, for the lock's screen-reader label. */
  name: string;
  words: Dictionary["activities"];
  dir: "rtl" | "ltr";
  className?: string;
  style?: CSSProperties;
  /** The game's card, drawn under the lock. */
  children: ReactNode;
}

/**
 * A Play game card behind its star lock (`edenic-plan.md` "Stars → Play's
 * games"): a game opens for two of the chest stars a child earns in Learn,
 * and stays open. Shut, the card wears a scrim and a white clay sign — a
 * padlock, the two stars it costs, "Two stars open it". With two stars to
 * spend, a blue "Open it!" spends them: the stars fly from the bank
 * (`PlayStars`) into the sign, the padlock springs open (`chest`), the scrim
 * lifts. Without, a tap brings Nova (`FriendSays`) to say how to earn one,
 * with a way to Learn. Shut until the store has read localStorage.
 */
export function PlayLock({ game, name, words, dir, className = "", style, children }: PlayLockProps) {
  const { opened, left } = usePlayStars();
  const complete = useProgress((state) => state.complete);
  const [phase, setPhase] = useState<Phase>("idle");
  const [flights, setFlights] = useState<FlyVars[]>([]);
  const [asking, setAsking] = useState(false);
  const target = useRef<HTMLSpanElement>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const isOpen = opened.includes(game);
  const showLock = !isOpen || phase !== "idle";

  const open = () => {
    if (phase !== "idle" || left < STARS_PER_GAME) return;
    /* From the bank's star to the sign's stars, arcing up between them. */
    const bank = document.querySelector("[data-star-bank] img")?.getBoundingClientRect();
    const to = target.current?.getBoundingClientRect();
    if (bank && to) {
      const from = { x: bank.left + bank.width / 2 - STAR_PX / 2, y: bank.top + bank.height / 2 - STAR_PX / 2 };
      setFlights(
        [-0.5, 0.5].map((side) => {
          const end = { x: to.left + to.width / 2 + side * 34 - STAR_PX / 2, y: to.top + to.height / 2 - STAR_PX / 2 };
          const mid = { x: (from.x + end.x) / 2, y: Math.min(from.y, end.y) - 90 };
          return {
            "--from-x": `${from.x}px`, "--from-y": `${from.y}px`,
            "--mid-x": `${mid.x}px`, "--mid-y": `${mid.y}px`,
            "--to-x": `${end.x}px`, "--to-y": `${end.y}px`,
          };
        }),
      );
    }
    /* Spent at once: the bank counts down as its stars leave. */
    complete(playOpenKey(game), 1);
    setPhase("flying");
    playSfx("whoosh");
    timers.current.push(
      window.setTimeout(() => playSfx("star"), FLY_MS),
      window.setTimeout(() => playSfx("star", 2), FLY_MS + STAGGER_MS),
      window.setTimeout(() => {
        setPhase("open");
        playSfx("chest");
      }, OPEN_MS),
      window.setTimeout(() => {
        setPhase("idle");
        setFlights([]);
      }, DONE_MS),
    );
  };

  const sign = (
    <span dir={dir} className="discover-soon">
      <span aria-hidden className="discover-soon-icon">
        {phase === "open" ? (
          <LockOpen key="open" className="anim-pop-in h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
        ) : (
          <Lock className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
        )}
      </span>
      <span ref={target} aria-hidden dir="ltr" className="flex items-center">
        <Image src={chestStar} alt="" sizes="32px" className="play-lock-star" />
        <Image src={chestStar} alt="" sizes="32px" className="play-lock-star -ms-1.5" />
      </span>
      {words.opensWith}
    </span>
  );

  const label = format(words.lockedAria, { name });

  return (
    <div className={`relative ${className}`} style={style}>
      {children}

      {showLock &&
        (left >= STARS_PER_GAME || phase !== "idle" ? (
          <div role="group" aria-label={label} className={`play-lock ${phase === "open" ? "play-lock--opening" : ""}`}>
            {sign}
            {phase === "idle" && (
              <Button3D
                tone={{ face: "var(--brand)", edge: "var(--brand-dark)" }}
                onClick={open}
                aria-label={format(words.openAria, { name })}
                className="anim-pop-in px-6 py-3 text-base sm:px-8 sm:text-lg"
              >
                <LockOpen className="h-5 w-5" strokeWidth={2.25} />
                <span dir={dir}>{words.openWithStars}</span>
              </Button3D>
            )}
          </div>
        ) : (
          <button type="button" aria-label={label} onClick={() => setAsking(true)} className="play-lock">
            {sign}
          </button>
        ))}

      {flights.length > 0 &&
        createPortal(
          flights.map((vars, i) => (
            <Image
              key={i}
              src={chestStar}
              alt=""
              sizes="42px"
              className="play-star-fly object-contain"
              style={{ ...vars, animationDelay: `${i * STAGGER_MS}ms` }}
            />
          )),
          document.body,
        )}

      {/* A portal too: the card's entrance (`anim-rise-in`) leaves a
          transform on this wrapper, which would make it Nova's frame
          instead of the screen. */}
      {asking &&
        createPortal(
          <FriendSays
            picture={CLASSROOMS.nova.cheer}
            ink="var(--color-nova)"
            lines={[words.needStars1, words.needStars2]}
            skipLabel={words.okay}
            action={{ href: "/learn", label: words.goLearn }}
            dir={dir}
            onDone={() => setAsking(false)}
          />,
          document.body,
        )}
    </div>
  );
}
