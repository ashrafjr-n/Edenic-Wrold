"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import { format } from "@/lib/format-dict";
import { Celebration } from "@/components/ui/celebration";
import type { Scene, SceneItem, SceneRect, ShapeId } from "@/types/course";

/** Two misses on this board and the next thing to find starts to glow. */
const HINT_AFTER = 2;

interface FindShapesProps {
  scene: Scene;
  shape: ShapeId;
  /** "Tap the {word}", naming each thing for a screen reader. */
  itemAria: string;
  onSolved: () => void;
  onMiss: () => void;
}

export const place = ([left, top, width, height]: SceneRect): CSSProperties => ({
  left: `${left}%`,
  top: `${top}%`,
  width: `${width}%`,
  height: `${height}%`,
});

/**
 * Find every thing in the scene that is `shape` — the lesson's last step,
 * where the shape leaves the page and turns up in the child's world.
 *
 * The scene is one render: an empty picnic with each thing laid over it at the
 * spot it was rendered in, so it reads as one picture but every thing can move
 * on its own. A right tap jumps, gets a ring and flies a copy into the tray of
 * sockets (one per thing to find); a wrong one only wiggles. After two misses
 * the next thing to find glows. All found → the whole set jumps together.
 */
export function FindShapes({ scene, shape, itemAria, onSolved, onMiss }: FindShapesProps) {
  const targets = scene.items.filter((item) => item.shape === shape);
  const [found, setFound] = useState<string[]>([]);
  const [shake, setShake] = useState<{ id: string; n: number } | null>(null);
  const [misses, setMisses] = useState(0);

  const solved = found.length === targets.length;
  const hinted = misses >= HINT_AFTER ? targets.find((item) => !found.includes(item.id))?.id : undefined;

  const tap = (item: SceneItem) => {
    if (solved || found.includes(item.id)) return;
    if (item.shape === shape) {
      const next = [...found, item.id];
      setFound(next);
      if (next.length === targets.length) onSolved();
      return;
    }
    setShake((last) => ({ id: item.id, n: (last?.n ?? 0) + 1 }));
    setMisses((count) => count + 1);
    onMiss();
  };

  return (
    <div className="card card-clay-white relative w-full max-w-[min(100%,calc((100svh-23.5rem-min(2.5rem,4svh))*0.8))] p-2 sm:max-w-md sm:p-3 lg:max-w-[min(32rem,calc((100svh-20rem)*0.8))]">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.35rem]">
        <Image
          src={scene.background}
          alt=""
          fill
          preload
          sizes="(min-width: 1024px) 32rem, (min-width: 640px) 28rem, 92vw"
          className="select-none object-cover"
        />

        {scene.items.map((item) => {
          const isFound = found.includes(item.id);
          const isShaking = shake?.id === item.id;
          return (
            <span
              key={isShaking ? `${item.id}.${shake.n}` : item.id}
              className={`pointer-events-none absolute ${isFound ? "anim-jump" : ""} ${isShaking ? "anim-wiggle" : ""} ${
                solved && isFound ? "find-cheer" : ""
              }`}
              style={{
                ...place(item.box),
                ...(solved && isFound ? { animationDelay: `${found.indexOf(item.id) * 0.12}s` } : {}),
              }}
            >
              <Image src={item.src} alt="" fill sizes="30vw" className="select-none object-contain" />
            </span>
          );
        })}

        {/* The ring and tick on a found thing, and the glow on the hinted
            one, sit over the thing itself (its hit box), not its shadow. */}
        {scene.items.map((item) => {
          const isFound = found.includes(item.id);
          if (!isFound && item.id !== hinted) return null;
          return (
            <span key={`mark-${item.id}`} className="pointer-events-none absolute" style={place(item.hit)}>
              {isFound ? (
                <>
                  <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className="absolute left-[-8%] top-[-8%] h-[116%] w-[116%] overflow-visible"
                    aria-hidden
                  >
                    <ellipse className="find-ring find-ring--under" cx="50" cy="50" rx="48" ry="48" pathLength={100} />
                    <ellipse className="find-ring" cx="50" cy="50" rx="48" ry="48" pathLength={100} />
                  </svg>
                  <span
                    className="clay anim-pop-in absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full text-white lg:h-8 lg:w-8"
                    style={{ backgroundColor: "var(--color-go)", "--clay-edge": "var(--color-go-dark)" } as CSSProperties}
                  >
                    <Check className="h-4 w-4 lg:h-5 lg:w-5" strokeWidth={3.5} />
                  </span>
                </>
              ) : (
                <span className="guide-target block h-full w-full" />
              )}
            </span>
          );
        })}

        {scene.items.map((item) => (
          <button
            key={`tap-${item.id}`}
            type="button"
            aria-label={format(itemAria, { word: item.word })}
            aria-pressed={found.includes(item.id)}
            onClick={() => tap(item)}
            /* The radius is the hit shape too: a round thing is only tappable
               on its round part, so a corner of its box never steals a tap. */
            className={`absolute focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] ${
              item.shape === "circle" ? "rounded-full" : "rounded-[18%]"
            } ${solved || found.includes(item.id) ? "" : "hover:bg-white/20"}`}
            style={place(item.hit)}
          />
        ))}

        {/* The tray: one socket per thing to find, filled in the order they
            were found — floating over the grass at the bottom. */}
        <div
          className="clay pointer-events-none absolute bottom-[2.5%] left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-[var(--surface)] p-1.5 sm:gap-2 sm:p-2 lg:gap-2.5 lg:p-2.5"
          style={{ "--clay-edge": "var(--color-locked-dark)" } as CSSProperties}
        >
          {targets.map((target, i) => {
            const id = found[i];
            const item = id ? scene.items.find((candidate) => candidate.id === id) : undefined;
            return (
              /* `.letter-slot` sets its own radius, unlayered — the round
                 one has to come inline. */
              <span key={target.id} className="letter-slot h-9 w-9 sm:h-11 sm:w-11 lg:h-12 lg:w-12" style={{ borderRadius: "999px" }}>
                {item && (
                  <span className="anim-pop-in absolute inset-0.5">
                    <Image src={item.src} alt="" fill sizes="(min-width: 1024px) 48px, 44px" className="object-contain" />
                  </span>
                )}
              </span>
            );
          })}
        </div>

        {solved && <Celebration />}
      </div>
    </div>
  );
}
