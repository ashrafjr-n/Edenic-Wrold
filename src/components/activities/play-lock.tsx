"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Lock, LockOpen, Play } from "lucide-react";
import { GameCard } from "@/components/activities/game-card";
import { Button3D } from "@/components/ui/button-3d";
import { FriendSays } from "@/components/ui/friend-says";
import { CLASSROOMS } from "@/data/classroom";
import type { PlayCard } from "@/data/play-games";
import { playSfx } from "@/lib/cue";
import { format } from "@/lib/format-dict";
import type { Dictionary } from "@/lib/dictionaries/en";
import { playOpenKey, STARS_PER_GAME, usePlayStars, useProgress, type PlayGame } from "@/store/progress";
import chestStar from "../../../public/assets/learn/chest-star.png";
import emptyStar from "../../../public/assets/learn/star-empty.png";

type FlyVars = CSSProperties & Record<"--from-x" | "--from-y" | "--mid-x" | "--mid-y" | "--to-x" | "--to-y", string>;

/** The stars' flight (`.play-star-fly`, 0.8 s) and the second star's lag. */
const FLY_MS = 800;
const STAGGER_MS = 150;
/** The padlock springs open once both stars are in… */
const OPEN_MS = FLY_MS + STAGGER_MS + 150;
/** …and the frost has lifted (`.play-lock--opening`: 0.35 s held open, then 0.5 s). */
const DONE_MS = OPEN_MS + 850;
/** The flying star's box (`.play-star-fly`, 2.6rem). */
const STAR_PX = 41.6;

type Phase = "idle" | "flying" | "open";

interface PlayLockProps {
  game: PlayGame;
  card: PlayCard;
  title: string;
  alt: string;
  words: Dictionary["activities"];
  dir: "rtl" | "ltr";
  className?: string;
  style?: CSSProperties;
}

/**
 * A Play game card (`GameCard`) behind its star lock (`edenic-plan.md`
 * "Stars → Play's games"): a game opens for two of the chest stars a child
 * earns in Learn, and stays open. Shut, its picture is frosted under a white
 * clay padlock with two empty star sockets — the price — and "Two stars open
 * it". With two stars to spend, the foot wears a blue "Open it!": the stars
 * fly from the bank (`PlayStars`) into the sockets, which fill gold one by
 * one, the padlock springs open (`chest`), the frost lifts and the card
 * becomes its link. Without, the whole card is a button that brings Nova
 * (`FriendSays`) to say how to earn one. Shut until the store has read
 * localStorage.
 */
export function PlayLock({ game, card, title, alt, words, dir, className = "", style }: PlayLockProps) {
  const { opened, left } = usePlayStars();
  const complete = useProgress((state) => state.complete);
  const [phase, setPhase] = useState<Phase>("idle");
  const [filled, setFilled] = useState(0);
  const [flights, setFlights] = useState<FlyVars[]>([]);
  const [asking, setAsking] = useState(false);
  const sockets = useRef<(HTMLSpanElement | null)[]>([]);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const isOpen = opened.includes(game) && phase === "idle";
  const canOpen = left >= STARS_PER_GAME || phase !== "idle";

  const open = () => {
    if (phase !== "idle" || left < STARS_PER_GAME) return;
    /* From the bank's star to each socket, on a soft arc — never above the
       bank, where the header would hide it. */
    const bank = document.querySelector("[data-star-bank] img")?.getBoundingClientRect();
    if (bank) {
      const from = { x: bank.left + bank.width / 2 - STAR_PX / 2, y: bank.top + bank.height / 2 - STAR_PX / 2 };
      setFlights(
        sockets.current.flatMap((socket) => {
          const to = socket?.getBoundingClientRect();
          if (!to) return [];
          const end = { x: to.left + to.width / 2 - STAR_PX / 2, y: to.top + to.height / 2 - STAR_PX / 2 };
          const mid = { x: (from.x + end.x) / 2 + (end.x - from.x) * 0.25, y: Math.max(from.y, (from.y + end.y) / 2 - 70) };
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
      window.setTimeout(() => {
        setFilled(1);
        playSfx("star");
      }, FLY_MS),
      window.setTimeout(() => {
        setFilled(2);
        setFlights([]);
        playSfx("star", 2);
      }, FLY_MS + STAGGER_MS),
      window.setTimeout(() => {
        setPhase("open");
        playSfx("chest");
      }, OPEN_MS),
      window.setTimeout(() => {
        setPhase("idle");
        setFilled(0);
      }, DONE_MS),
    );
  };

  const label = format(words.lockedAria, { name: title });

  const cover = isOpen ? undefined : (
    <span className={`play-lock ${phase === "open" ? "play-lock--opening" : ""}`}>
      <span aria-hidden className={`play-padlock ${phase === "open" ? "play-padlock--open" : ""}`}>
        {phase === "open" ? (
          <LockOpen key="open" className="anim-pop-in h-8 w-8 sm:h-9 sm:w-9" strokeWidth={2.5} />
        ) : (
          <Lock className="h-8 w-8 sm:h-9 sm:w-9" strokeWidth={2.5} />
        )}
      </span>
      <span dir={dir} className="play-lock-sign">
        <span aria-hidden dir="ltr" className="flex items-center gap-0.5">
          {[0, 1].map((i) => (
            <span key={i} ref={(el) => { sockets.current[i] = el; }} className="play-socket">
              {filled > i ? (
                <Image src={chestStar} alt="" sizes="32px" className="play-socket-star anim-pop-in" />
              ) : (
                <Image src={emptyStar} alt="" sizes="32px" className="play-socket-star" />
              )}
            </span>
          ))}
        </span>
        {words.opensWith}
      </span>
    </span>
  );

  let action;
  if (isOpen) {
    action = (
      <span aria-hidden className="game-card-go">
        <Play className="ms-0.5 h-6 w-6 fill-current" strokeWidth={2.5} />
      </span>
    );
  } else if (canOpen) {
    /* Hidden, not removed, once pressed: nothing may move while the stars fly. */
    action = (
      <span className={phase === "idle" ? "" : "invisible"}>
        <Button3D
          tone={{ face: "var(--brand)", edge: "var(--brand-dark)" }}
          onClick={open}
          aria-label={format(words.openAria, { name: title })}
          className="anim-pop-in whitespace-nowrap px-5 py-2.5 text-base lg:px-6 lg:text-lg"
        >
          <LockOpen className="h-5 w-5" strokeWidth={2.25} />
          <span dir={dir}>{words.openWithStars}</span>
        </Button3D>
      </span>
    );
  } else {
    action = (
      <span aria-hidden className="game-card-go game-card-go--shut">
        <Lock className="h-5 w-5" strokeWidth={2.5} />
      </span>
    );
  }

  return (
    <>
      <GameCard
        card={card}
        title={title}
        alt={alt}
        dir={dir}
        cover={cover}
        action={action}
        href={isOpen ? card.href : undefined}
        onClick={isOpen || canOpen ? undefined : () => setAsking(true)}
        label={isOpen ? title : label}
        className={className}
        style={style}
      />

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
          transform on it, which would make it Nova's frame instead of the
          screen. */}
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
    </>
  );
}
