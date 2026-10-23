"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, MouseEvent } from "react";
import Image from "next/image";
import { Celebration } from "@/components/ui/celebration";
import { COLORS } from "@/data/colors";
import { format } from "@/lib/format-dict";
import { shuffle } from "@/lib/seeded";
import type { ColorId } from "@/types/course";
import { SocketTray, STAGE_CARD } from "./find-shapes";

/** How many balloons of the color there are to pop. */
const TO_POP = 4;
/** Two misses and the next balloon to pop starts to glow. */
const HINT_AFTER = 2;
/** Five lanes across the sky, so no two balloons rise on top of each other. */
const LANES = [11, 30, 50, 70, 89];
/** The pieces a popped balloon bursts into: where each flies, in % of its box. */
const SHARDS = [
  [-70, -40],
  [70, -45],
  [-85, 25],
  [85, 20],
  [-25, 75],
  [30, 70],
];

interface PopBalloonsProps {
  color: ColorId;
  /** One balloon of each of these rises among the ones to pop. */
  others: ColorId[];
  /** Deals the balloons into lanes and times. */
  seed: string;
  /** "{color} balloon", each balloon's screen-reader name. */
  balloonAria: string;
  onSolved: () => void;
  onMiss: () => void;
}

type Burst = { id: number; color: ColorId; x: number; y: number };

/**
 * Pop the balloons: balloons of many colors float up a patch of sky, slowly,
 * over and over; tap every balloon of the lesson's color and it bursts into
 * pieces and lands in a tray of sockets under the sky. Any other balloon
 * only wiggles; after two misses the next one to pop glows. The color is
 * all that tells them apart — nothing else could be asked this way.
 *
 * Each balloon rises on its own clock (`.balloon-rise`, distance in `cqh` of
 * the sky) from a seeded lane, length and start, so the server and the
 * client deal the same sky. Under reduced motion they hang still, spread out.
 */
export function PopBalloons({ color, others, seed, balloonAria, onSolved, onMiss }: PopBalloonsProps) {
  const balloons = useMemo(() => {
    const colors = shuffle([...Array.from({ length: TO_POP }, () => color), ...others], seed);
    return colors.map((c, i) => ({
      id: i,
      color: c,
      lane: LANES[i % LANES.length],
      /* Seconds per rise, and how far into it the balloon starts — each its
         own, so they never move in step. */
      rise: 10 + ((i * 7) % 5) * 0.8,
      start: (i * 3.7) % 10,
      rest: 8 + ((i * 29) % 62),
    }));
  }, [color, others, seed]);

  const [popped, setPopped] = useState<number[]>([]);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [shake, setShake] = useState<{ id: number; n: number } | null>(null);
  const [misses, setMisses] = useState(0);
  const sky = useRef<HTMLDivElement>(null);

  const solved = popped.length >= TO_POP;

  /* Reported once the last one is in — taps can land faster than renders,
     so the count is only trusted after the state has settled. */
  const reported = useRef(false);
  useEffect(() => {
    if (!solved || reported.current) return;
    reported.current = true;
    onSolved();
  }, [solved, onSolved]);
  const hinted = !solved && misses >= HINT_AFTER ? balloons.find((b) => b.color === color && !popped.includes(b.id))?.id : undefined;

  const tap = (balloon: (typeof balloons)[number], event: MouseEvent<HTMLButtonElement>) => {
    if (solved || popped.includes(balloon.id)) return;
    if (balloon.color !== color) {
      setShake((last) => ({ id: balloon.id, n: (last?.n ?? 0) + 1 }));
      setMisses((count) => count + 1);
      onMiss();
      return;
    }
    /* The burst stays where the balloon was when it popped — the balloon
       itself is mid-flight, so its spot is read off the screen. */
    const box = sky.current?.getBoundingClientRect();
    const hit = event.currentTarget.getBoundingClientRect();
    if (box) {
      setBursts((all) => all.some((b) => b.id === balloon.id) ? all : [
        ...all,
        {
          id: balloon.id,
          color: balloon.color,
          x: ((hit.left + hit.width / 2 - box.left) / box.width) * 100,
          y: ((hit.top + hit.height * 0.3 - box.top) / box.height) * 100,
        },
      ]);
    }
    setPopped((all) => (all.includes(balloon.id) || all.length >= TO_POP ? all : [...all, balloon.id]));
  };

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className={STAGE_CARD}>
        <div
          ref={sky}
          className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.35rem] [container-type:size] lg:shadow-[0_20px_44px_-18px_rgb(var(--shadow-hue)/0.34)]"
          style={{ backgroundColor: "color-mix(in srgb, var(--brand) 16%, var(--surface))" }}
        >
          {balloons.map((balloon) => {
            if (popped.includes(balloon.id)) return null;
            const shaking = shake?.id === balloon.id;
            return (
              <button
                key={balloon.id}
                type="button"
                aria-label={format(balloonAria, { color: balloon.color })}
                onClick={(event) => tap(balloon, event)}
                className="balloon-rise absolute top-0 w-[19cqw] focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]"
                style={
                  {
                    left: `${balloon.lane}%`,
                    animationDuration: `${balloon.rise}s`,
                    animationDelay: `-${balloon.start}s`,
                    "--rest": `${balloon.rest}cqh`,
                  } as CSSProperties
                }
              >
                <span className="balloon-sway block" style={{ animationDelay: `-${balloon.id * 0.6}s` }}>
                  <span
                    key={shaking ? shake.n : "still"}
                    className={`relative block ${shaking ? "anim-wiggle" : ""} ${hinted === balloon.id ? "guide-target rounded-full" : ""}`}
                  >
                    <Image
                      src={COLORS[balloon.color].balloon}
                      alt=""
                      sizes="(min-width: 1024px) 7rem, 20vw"
                      draggable={false}
                      className="pointer-events-none h-auto w-full select-none"
                    />
                  </span>
                </span>
              </button>
            );
          })}

          {/* A popped balloon: a ring and its pieces flying out, where it was. */}
          {bursts.map((burst) => (
            <span
              key={`burst-${burst.id}`}
              aria-hidden
              className="pointer-events-none absolute h-[16cqw] w-[16cqw]"
              style={{ left: `${burst.x}%`, top: `${burst.y}%`, translate: "-50% -50%" }}
            >
              <span className="pop-ring absolute inset-0 rounded-full border-4" style={{ borderColor: COLORS[burst.color].face }} />
              {SHARDS.map(([dx, dy], i) => (
                <span
                  key={i}
                  className="pop-shard absolute left-1/2 top-1/2 h-[22%] w-[22%] rounded-full"
                  style={{ backgroundColor: COLORS[burst.color].face, "--shard-x": `${dx}%`, "--shard-y": `${dy}%` } as CSSProperties}
                />
              ))}
            </span>
          ))}

          {solved && <Celebration />}
        </div>
      </div>
      <SocketTray count={TO_POP} filled={popped.map(() => COLORS[color].balloon)} />
    </div>
  );
}
