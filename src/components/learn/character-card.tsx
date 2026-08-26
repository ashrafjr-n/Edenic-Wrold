import type { CSSProperties } from "react";
import Image from "next/image";
import { Lock, Play } from "lucide-react";
import { Button3D } from "@/components/ui/button-3d";
import type { Character } from "@/types/character";

type TileVars = CSSProperties & { "--tile-tint"?: string };

/** The whole cast lands while the icons are still climbing — the icons are
    decoration and must never gate the content. Everything is on screen by ~1.4s. */
const CARD_DELAY = 0.4;
const CARD_STAGGER = 0.1;
const FRIEND_DELAY = 0.65;
const FRIEND_STAGGER = 0.13;
/** Idle float starts once pop-in (0.75s) has settled, so the two never fight. */
const POP_IN_DURATION = 0.75;
const NAME_OFFSET = 0.15;
const BUTTON_OFFSET = 0.25;

interface CharacterCardProps {
  character: Character;
  /** Name of the character that must be finished first; locked cards only. */
  previousName?: string;
  index: number;
}

export function CharacterCard({
  character,
  previousName,
  index,
}: CharacterCardProps) {
  const { name, image, accent, locked } = character;

  const friendDelay = FRIEND_DELAY + index * FRIEND_STAGGER;
  const delay = {
    card: `${CARD_DELAY + index * CARD_STAGGER}s`,
    friend: `${friendDelay}s`,
    breathe: `${friendDelay + POP_IN_DURATION}s`,
    name: `${friendDelay + NAME_OFFSET}s`,
    button: `${friendDelay + BUTTON_OFFSET}s`,
  };

  /* The tile is the only place a character's own color appears on this page —
     kept pale so the render on top of it stays the saturated thing. Locked
     tiles drop most of the way to neutral but keep a trace of the hue, so the
     card still reads as belonging to that friend. */
  const tileTint = locked
    ? `color-mix(in srgb, ${accent} 10%, var(--color-locked))`
    : `color-mix(in srgb, ${accent} 20%, #ffffff)`;

  return (
    <div
      className={`card anim-fade-up group/card flex w-full max-w-[300px] flex-col p-4 ${
        locked ? "" : "card-lift"
      }`}
      style={{ animationDelay: delay.card }}
    >
      <div
        className="tile relative flex h-56 items-end justify-center sm:h-64"
        style={{ "--tile-tint": tileTint } as TileVars}
      >
        <div
          className="anim-pop-in relative"
          style={{ animationDelay: delay.friend }}
        >
          {/* Contact shadow: a wide ambient pool plus a tight dark core right
              under the feet. Sits outside the floating wrapper so it stays
              planted on the tile while the character breathes. */}
          <div
            className="absolute bottom-1 left-1/2 z-0 h-4 w-32 -translate-x-1/2 rounded-[50%] bg-[rgb(var(--shadow-hue))]/15 blur-lg sm:w-40"
            aria-hidden
          />
          <div
            className="absolute bottom-2 left-1/2 z-0 h-2.5 w-20 -translate-x-1/2 rounded-[50%] bg-[rgb(var(--shadow-hue))]/25 blur-md sm:w-24"
            aria-hidden
          />

          <div
            className={`relative z-10 ${locked ? "" : "anim-breathe"}`}
            style={locked ? undefined : { animationDelay: delay.breathe }}
          >
            <Image
              src={image}
              alt={name}
              width={475}
              height={539}
              className={`h-52 w-auto object-contain drop-shadow-[0_12px_16px_rgba(92,78,190,0.2)] transition-transform duration-300 sm:h-60 ${
                locked
                  ? "opacity-75 grayscale-[0.55]"
                  : "group-hover/card:scale-105"
              }`}
              priority={!locked}
            />
          </div>

          {locked && (
            <span className="absolute inset-0 z-20 flex items-center justify-center">
              <span className="group/lock relative flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_10px_22px_-8px_rgb(92_78_190_/_45%)]">
                <Lock
                  className="h-6 w-6 text-[var(--color-locked-text)] transition-transform duration-300 group-hover/lock:[animation:wiggle_0.5s_ease-in-out]"
                  strokeWidth={2.5}
                />
                {previousName && (
                  <span className="pointer-events-none absolute -top-3 left-1/2 w-max max-w-[11rem] -translate-x-1/2 -translate-y-full rounded-xl bg-[var(--color-ink)] px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-200 group-hover/lock:opacity-100">
                    Finish {previousName}&apos;s lessons first!
                  </span>
                )}
              </span>
            </span>
          )}
        </div>
      </div>

      <h3
        className="anim-fade-up mt-4 text-center text-2xl font-bold sm:text-3xl"
        style={{
          color: locked ? "var(--color-locked-text)" : "var(--color-ink)",
          animationDelay: delay.name,
        }}
      >
        {name}
      </h3>

      <Button3D
        tone={
          locked
            ? {
                face: "var(--color-locked)",
                edge: "var(--color-locked-dark)",
                text: "var(--color-locked-text)",
              }
            : { face: "var(--brand)", edge: "var(--brand-dark)" }
        }
        href={locked ? undefined : `/learn/${character.id}`}
        disabled={locked}
        aria-label={locked ? `${name} is locked` : `Learn with ${name}`}
        className="anim-fade-up mt-3 w-full px-5 py-3 text-sm sm:text-base"
        style={{ animationDelay: delay.button }}
      >
        {locked ? (
          <>
            <Lock className="h-4 w-4" strokeWidth={2.75} />
            Locked
          </>
        ) : (
          <>
            Learn With {name}
            <Play className="h-4 w-4 fill-current" strokeWidth={2.75} />
          </>
        )}
      </Button3D>
    </div>
  );
}
