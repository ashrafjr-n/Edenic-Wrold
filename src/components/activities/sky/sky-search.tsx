"use client";

import { useState } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import { place } from "@/components/learn/lesson/find-shapes";
import { worldCover } from "@/components/learn/lesson/lesson-world";
import type { SkySearch } from "@/data/sky-levels";
import { format } from "@/lib/format-dict";
import { useWide } from "@/lib/use-wide";
import type { SceneRect } from "@/types/course";
import cloud from "../../../../public/assets/play/sky/sky-cloud.png";

/** A hidden thing is small on a phone: what a finger may land on is this much
    bigger than the thing, about its middle. */
const REACH = 1.45;
/** Kept in step with `.sky-search-cloud`'s drift in `globals.css`. */
const DRIFT_MS = 700;

const grown = ([x, y, w, h]: SceneRect, k: number): SceneRect => [x - (w * (k - 1)) / 2, y - (h * (k - 1)) / 2, w * k, h * k];

interface SkySearchPlayProps {
  scene: SkySearch;
  /** "Find the hidden stars!" */
  ask: string;
  /** "Hidden thing {n}" — never what it is: finding it is the game. */
  thingAria: string;
  cloudAria: string;
  dir: "rtl" | "ltr";
  onSolved: () => void;
}

/**
 * A Sky Trail level's search (2026-11-12): the level's own view of the sky over
 * the whole screen, sharp — the hidden things are IN the rendered picture, and
 * the page lays a tap target over each (`items`, the render's own boxes, laid
 * as `CourseWorld` lays its stops). A found thing gets a gold ring and fills a
 * star in the count; where a cloud lies over something (`covers`), a tap sends
 * the cloud drifting off first. Nothing is ever told off: a tap on empty sky
 * does nothing. All found → `onSolved`.
 */
export function SkySearchPlay({ scene, ask, thingAria, cloudAria, dir, onSolved }: SkySearchPlayProps) {
  const wide = useWide();
  const frame = scene[wide ? "landscape" : "portrait"];
  const [found, setFound] = useState<number[]>([]);
  /* A cloud tapped: drifting, then gone. */
  const [lifted, setLifted] = useState<number[]>([]);

  const find = (i: number) => {
    if (found.includes(i)) return;
    const next = [...found, i];
    setFound(next);
    /* In the handler that found the last one, never an effect watching for it. */
    if (next.length === frame.items.length) onSolved();
  };

  return (
    <>
      {/* The count, in the site's white clay, under the back row. */}
      <div className="pointer-events-none relative z-10 mx-auto mt-3 flex w-full max-w-xl flex-col items-center px-4">
        <p dir={dir} className="card card-clay-white card-pill flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-5 py-2.5 text-center text-base font-bold text-[var(--color-ink)] sm:text-xl">
          <span>{ask}</span>
          <span className="flex items-center gap-1" aria-hidden>
            {frame.items.map((_, i) => (
              <Star key={i} className={`h-5 w-5 sm:h-6 sm:w-6 ${i < found.length ? "fill-current text-[var(--color-gold)]" : "text-[rgb(var(--shadow-hue)/0.3)]"}`} strokeWidth={2.25} />
            ))}
          </span>
        </p>
      </div>

      {/* Over the level's blurred ground and under its chrome (the back row, the dots). */}
      <div className="world-frame sky-search z-[1]">
        <div className="world-cover" style={worldCover(wide)}>
          <Image src={frame.picture} alt="" fill preload sizes="100vw" className="object-cover" />
          {frame.items.map((box, i) => {
            const covered = frame.covers.some((cover, c) => cover.item === i && !lifted.includes(c));
            return (
              <button
                key={i}
                type="button"
                disabled={covered || found.includes(i)}
                onClick={() => find(i)}
                aria-label={format(thingAria, { n: i + 1 })}
                className="sky-search-thing"
                data-found={found.includes(i) || undefined}
                style={place(grown(box, REACH))}
              />
            );
          })}
          {frame.covers.map((cover, c) => (
            <button
              key={c}
              type="button"
              disabled={lifted.includes(c)}
              onClick={() => setLifted([...lifted, c])}
              aria-label={cloudAria}
              className="sky-search-cloud"
              data-lifted={lifted.includes(c) || undefined}
              style={{ ...place(cover.box), animationDuration: `${DRIFT_MS}ms` }}
            >
              <Image src={cloud} alt="" fill sizes="40vw" className="object-contain" />
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
