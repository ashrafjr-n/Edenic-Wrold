"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import Image, { type StaticImageData } from "next/image";
import { Check } from "lucide-react";
import { format } from "@/lib/format-dict";
import { Celebration } from "@/components/ui/celebration";
import { isTarget } from "@/lib/target";
import type { Scene, SceneItem, SceneRect, Target } from "@/types/course";

/** Two misses on this board and the next thing to find starts to glow. */
const HINT_AFTER = 2;

interface FindShapesProps {
  scene: Scene;
  /** The shape or color to find. */
  target: Target;
  /** "Tap the {word}", naming each thing for a screen reader. */
  itemAria: string;
  onSolved: () => void;
  onMiss: () => void;
}

/** The card a picture activity (Find, Pop) plays on, sized so the card
    and the tray under it fit the stage: as wide as the screen allows on a
    phone, capped by the height left once the tray and the chrome are taken
    off (measured at 375x667, 390x844, 820x1180) — the picture is 4:5. */
export const STAGE_CARD =
  "card card-clay-white card-bare-lg relative w-full max-w-[min(100%,calc((100svh-24.75rem-min(2.5rem,4svh))*0.8))] p-2 sm:max-w-[min(28rem,calc((100svh-40rem)*0.8))] sm:p-3 lg:max-w-[min(36rem,calc((var(--stage-h)-6.75rem)*0.8+1.5rem))]";

/**
 * The tray of sockets UNDER a picture activity (moved out of the picture on
 * request): one per thing to collect, each filled, in order, with the
 * picture of one collected.
 */
export function SocketTray({ filled, count }: { filled: StaticImageData[]; count: number }) {
  return (
    <div
      className="clay flex shrink-0 items-center gap-1.5 rounded-full bg-[var(--surface)] p-1.5 sm:gap-2 sm:p-2 lg:gap-2.5 lg:p-2.5"
      style={{ "--clay-edge": "var(--color-locked-dark)" } as CSSProperties}
    >
      {Array.from({ length: count }, (_, i) => (
        /* `.letter-slot` sets its own radius, unlayered — the round one
           has to come inline. */
        <span key={i} className="letter-slot h-9 w-9 sm:h-11 sm:w-11 lg:h-12 lg:w-12" style={{ borderRadius: "999px" }}>
          {filled[i] && (
            <span className="anim-pop-in absolute inset-0.5">
              <Image src={filled[i]} alt="" fill sizes="(min-width: 1024px) 48px, 44px" className="object-contain" />
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

export const place = ([left, top, width, height]: SceneRect): CSSProperties => ({
  left: `${left}%`,
  top: `${top}%`,
  width: `${width}%`,
  height: `${height}%`,
});

/**
 * Find every thing in the scene that is the `target` shape or color — the
 * lesson's last step, where the word leaves the page and turns up in the
 * child's world.
 *
 * The scene is one render: an empty picnic with each thing laid over it at the
 * spot it was rendered in, so it reads as one picture but every thing can move
 * on its own. A right tap jumps, gets a ring and drops a copy into the tray of
 * sockets under the picture (one per thing to find); a wrong one only wiggles. After two misses
 * the next thing to find glows. All found → the whole set jumps together.
 */
export function FindShapes({ scene, target, itemAria, onSolved, onMiss }: FindShapesProps) {
  const targets = scene.items.filter((item) => isTarget(item, target));
  const [found, setFound] = useState<string[]>([]);
  const [shake, setShake] = useState<{ id: string; n: number } | null>(null);
  const [misses, setMisses] = useState(0);

  const solved = found.length === targets.length;
  const hinted = misses >= HINT_AFTER ? targets.find((item) => !found.includes(item.id))?.id : undefined;

  const tap = (item: SceneItem) => {
    if (solved || found.includes(item.id)) return;
    if (isTarget(item, target)) {
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
    <div className="flex w-full flex-col items-center gap-3">
      <div className={STAGE_CARD}>
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.35rem] lg:shadow-[0_20px_44px_-18px_rgb(var(--shadow-hue)/0.34)]">
          <Image
            src={scene.background}
            alt=""
            fill
            preload
            sizes="(min-width: 1024px) 34rem, (min-width: 640px) 28rem, 92vw"
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
              }`}
              style={place(item.hit)}
            />
          ))}

          {solved && <Celebration />}
        </div>
      </div>
      <SocketTray
        count={targets.length}
        filled={found.flatMap((id) => scene.items.find((item) => item.id === id)?.src ?? [])}
      />
    </div>
  );
}
