"use client";

import { useEffect, useState, type CSSProperties, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button3D } from "@/components/ui/button-3d";
import { Cloud } from "@/components/ui/cloud";
import { useUpNext, type UpNextCourse } from "@/components/learn/up-next";
import { pinkiHouse, type HouseBox } from "@/data/pinki-house";
import { format } from "@/lib/format-dict";
import { itemKey, useProgress } from "@/store/progress";
import pinkiSpeak from "../../../public/assets/learn-with-pinki/pinki/pinki-speak.png";

/* Which rewards the child has already SEEN in the house — one earned since
   the last visit fades in with a sparkle, once. */
const SEEN_KEY = "edenic-house-seen";

function readSeen(): string[] {
  try {
    const seen: unknown = JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]");
    return Array.isArray(seen) ? seen.filter((key): key is string => typeof key === "string") : [];
  } catch {
    return [];
  }
}

/** A box on the house picture as absolute-position styles. */
const place = ([left, top, width, height]: HouseBox): CSSProperties => ({
  left: `${left}%`,
  top: `${top}%`,
  width: `${width}%`,
  height: `${height}%`,
});

/** The house's width in CSS px per 1% of it, at its widest (desktop) —
    what a reward's `sizes` is worked out from. */
const PX_PER_PCT = 8;

interface PinkiHouseProps {
  characterId: string;
  /** Pinki's courses, in the order of the house's rooms' data. */
  courses: readonly UpNextCourse[];
  labels: {
    hello: string;
    welcome: string;
    /** "Start {name}" — a room's and a lesson's announced name. */
    startLesson: string;
    start: string;
    continue: string;
    pinki: string;
  };
  dir: "rtl" | "ltr";
}

/**
 * Pinki's hub as her house (2026-10-14): a clay dollhouse with a room per
 * course and, in each room, a reward per lesson — the earned ones in place,
 * the rest as white ghosts marking their spots, the next one glowing and
 * playable. Tapping a room dives into it (the course page); Pinki stands in
 * her yard and jumps when tapped. One tree for every width: her greeting
 * and the next lesson's button above and below the house on a phone and
 * tablet, beside it on a desktop.
 */
export function PinkiHouse({ characterId, courses, labels, dir }: PinkiHouseProps) {
  const router = useRouter();
  const items = useProgress((state) => state.items);
  const hydrated = useProgress((state) => state.hydrated);
  const next = useUpNext(characterId, courses);
  const [fresh, setFresh] = useState<readonly string[]>([]);
  const [diving, setDiving] = useState<HouseBox | null>(null);
  const [jumps, setJumps] = useState(0);

  const rooms = pinkiHouse.rooms.flatMap((room) => {
    const course = courses.find((c) => c.id === room.course);
    if (!course) return [];
    const done = room.rewards.map(
      (_, i) => hydrated && (items[itemKey(characterId, course.id, i + 1)]?.stars ?? 0) > 0,
    );
    return [{ ...room, course, done, nextIndex: done.indexOf(false) }];
  });
  const earned = rooms.flatMap((room) =>
    room.done.flatMap((d, i) => (d ? [itemKey(characterId, room.course.id, i + 1)] : [])),
  );
  const earnedKey = earned.join(",");

  /* Once progress is known: what was earned since the last visit sparkles
     in, and the house remembers it. */
  useEffect(() => {
    if (!hydrated) return;
    const keys = earnedKey ? earnedKey.split(",") : [];
    const timer = setTimeout(() => {
      const seen = readSeen();
      setFresh(keys.filter((key) => !seen.includes(key)));
      try {
        localStorage.setItem(SEEN_KEY, JSON.stringify(keys));
      } catch {
        /* Storage off: nothing sparkles. Nothing is lost. */
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [hydrated, earnedKey]);

  /* A room dives in before the course page opens — unless the child asked
     for less motion, or wants it in a new tab. */
  const dive = (box: HouseBox, href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    event.preventDefault();
    setDiving(box);
    setTimeout(() => router.push(href), 420);
  };

  const stageStyle: CSSProperties = diving
    ? { transformOrigin: `${diving[0] + diving[2] / 2}% ${diving[1] + diving[3] / 2}%` }
    : {};

  const cta = next && (
    <Button3D
      href={`/learn/${characterId}/${next.course.id}/${next.index + 1}`}
      tone={{ ...next.course.tone, text: next.course.tone.ink }}
      className="house-cta anim-fade-up gap-3 py-2.5 ps-2.5 pe-6 text-lg"
    >
      <span className="house-cta-thing relative h-11 w-11 shrink-0">
        {next.course.covers[next.index]?.[0] && (
          <Image src={next.course.covers[next.index][0]} alt="" fill sizes="44px" className="object-contain" />
        )}
      </span>
      <span dir={dir} className="min-w-0 truncate">
        {next.started ? labels.continue : labels.start} · {next.course.titles[next.index]}
      </span>
      <ArrowRight className="h-5 w-5 shrink-0" strokeWidth={2.75} />
    </Button3D>
  );

  return (
    <div className="house-hub mx-auto grid w-full max-w-7xl flex-1 gap-x-10 gap-y-4 px-4 pt-1 sm:px-8 lg:gap-y-6 lg:pt-0 xl:px-12">
      <div className="[grid-area:bubble] lg:self-end">
        <div
          dir={dir}
          className="hub-bubble house-bubble card card-clay-white speech-clay anim-pop-in relative px-5 py-3.5 sm:px-7 sm:py-5 lg:px-8 lg:py-6"
          style={{ animationDelay: "0.2s" }}
        >
          <h1 className="text-xl font-bold leading-tight text-[var(--color-ink)] sm:text-3xl xl:text-4xl">{labels.hello}</h1>
          <p className="mt-1 text-sm text-[var(--color-ink-soft)] sm:text-lg xl:text-xl">{labels.welcome}</p>
        </div>
      </div>

      <div className="flex justify-center [grid-area:cta] lg:justify-start lg:self-start">{cta}</div>

      <div className={`relative [grid-area:stage] max-sm:-mx-3 lg:self-center ${diving ? "overflow-clip" : ""}`}>
        <div
          className={`house-stage relative mx-auto ${diving ? "house-stage--dive" : ""}`}
          style={stageStyle}
        >
          {/* Clouds drift behind the roof. */}
          <span className="house-cloud house-cloud--a" aria-hidden>
            <Cloud variant={2} style={{ "--cloud-w": "100%" } as CSSProperties} />
          </span>
          <span className="house-cloud house-cloud--b" aria-hidden>
            <Cloud variant={3} style={{ "--cloud-w": "100%" } as CSSProperties} />
          </span>

          <Image
            src={pinkiHouse.picture}
            alt=""
            fill
            preload
            sizes="(min-width: 1024px) 760px, 100vw"
            className="house-picture anim-pop-in"
          />

          {/* Smoke from the chimney. */}
          <span className="house-smoke" aria-hidden>
            <span />
            <span />
            <span />
          </span>

          {rooms.map((room) => {
            const href = `/learn/${characterId}/${room.course.id}`;
            const count = room.done.filter(Boolean).length;
            return (
              <div key={room.course.id} className="contents">
                <Link
                  href={href}
                  onClick={dive(room.box, href)}
                  aria-label={format(labels.startLesson, { name: room.course.name })}
                  className="house-room"
                  style={place(room.box)}
                />
                {room.rewards.map((reward, i) => {
                  const key = itemKey(characterId, room.course.id, i + 1);
                  if (room.done[i]) {
                    return (
                      <span
                        key={key}
                        className={`house-reward ${fresh.includes(key) ? "house-reward--fresh" : ""}`}
                        style={{ ...place(reward.box), animationDelay: `${0.5 + fresh.indexOf(key) * 0.25}s` }}
                      >
                        <Image src={reward.picture} alt="" fill sizes={`${Math.ceil(reward.box[2] * PX_PER_PCT)}px`} />
                      </span>
                    );
                  }
                  const ghost = (
                    <Image src={reward.ghost} alt="" fill sizes={`${Math.ceil(reward.ghostBox[2] * PX_PER_PCT)}px`} />
                  );
                  return i === room.nextIndex ? (
                    <Link
                      key={key}
                      href={`${href}/${i + 1}`}
                      aria-label={format(labels.startLesson, { name: room.course.titles[i] })}
                      className="house-ghost house-ghost--next"
                      style={place(reward.ghostBox)}
                    >
                      {ghost}
                    </Link>
                  ) : (
                    <span key={key} className="house-ghost" style={place(reward.ghostBox)} aria-hidden>
                      {ghost}
                    </span>
                  );
                })}
                <span
                  className="house-sign card card-pill card-clay-white"
                  style={{ left: `${room.box[0] + room.box[2] / 2}%`, top: `${room.box[1]}%` }}
                  aria-hidden
                >
                  <span dir={dir} className="truncate">{room.course.name}</span>
                  <span className="house-sign-count" style={{ color: room.course.tone.edge }}>
                    {count}/{room.rewards.length}
                  </span>
                </span>
              </div>
            );
          })}

          {/* Pinki in her yard: she jumps when tapped. */}
          <button
            type="button"
            className="house-pinki"
            aria-label={labels.pinki}
            onClick={() => setJumps((n) => n + 1)}
          >
            <span key={jumps} className={`block ${jumps ? "anim-jump" : ""}`}>
              <Image
                src={pinkiSpeak}
                alt=""
                sizes="(min-width: 1024px) 260px, 34vw"
                preload
                className="anim-breathe h-auto w-full"
              />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
