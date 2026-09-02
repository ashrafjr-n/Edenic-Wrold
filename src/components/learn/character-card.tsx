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
const TAGLINE_OFFSET = 0.22;
const BUTTON_OFFSET = 0.3;

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
  const { name, tagline, image, accent, accentDark, locked } = character;

  const friendDelay = FRIEND_DELAY + index * FRIEND_STAGGER;
  const delay = {
    card: `${CARD_DELAY + index * CARD_STAGGER}s`,
    friend: `${friendDelay}s`,
    breathe: `${friendDelay + POP_IN_DURATION}s`,
    name: `${friendDelay + NAME_OFFSET}s`,
    tagline: `${friendDelay + TAGLINE_OFFSET}s`,
    button: `${friendDelay + BUTTON_OFFSET}s`,
  };

  /* The pale circle is the only place a character's own color appears here —
     kept faint so the render standing on it stays the saturated thing.
     Locked circles drop most of the way to neutral but keep a trace of the
     hue, so it still reads as belonging to that friend. */
  const tileTint = locked
    ? `color-mix(in srgb, ${accent} 10%, var(--color-locked))`
    : `color-mix(in srgb, ${accent} 20%, #ffffff)`;

  return (
    <div
      className="anim-fade-up group/card flex w-full max-w-[300px] flex-col items-center"
      style={{ animationDelay: delay.card }}
    >
      {/* No card, no square frame around the character — just a soft round
          tint standing in for ground, the same treatment as the home page's
          friend pods, sized up since this page is the main cast portrait. */}
      <div className="relative flex h-72 items-end justify-center sm:h-80">
        <div
          className="tile tile-round tile-grain absolute bottom-0 h-48 w-48 sm:h-56 sm:w-56"
          style={{ "--tile-tint": tileTint } as TileVars}
          aria-hidden
        />

        <div
          className="anim-pop-in relative"
          style={{ animationDelay: delay.friend }}
        >
          {/* Contact shadow: a wide ambient pool plus a tight dark core right
              under the feet. Sits outside the floating wrapper so it stays
              planted while the character breathes. */}
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
              className={`h-64 w-auto object-contain drop-shadow-[0_12px_16px_rgba(92,78,190,0.2)] transition-transform duration-300 sm:h-80 ${
                locked
                  ? "opacity-75 grayscale-[0.55]"
                  : "group-hover/card:scale-105"
              }`}
              priority={!locked}
            />
          </div>

          {locked && (
            <span className="absolute inset-0 z-20 flex items-center justify-center">
              {/* `.lock-chip`: the shared clay padlock — a dormant lavender
                  face with the site's grain and the same inflated shading
                  every other object here has. It was a flat white disc with a
                  grey padlock in it, which next to three clay characters read
                  as a sticker rather than as part of the world. */}
              <span className="lock-chip group/lock relative h-14 w-14">
                <Lock
                  className="h-6 w-6 transition-transform duration-300 group-hover/lock:[animation:wiggle_0.5s_ease-in-out]"
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

      {/* Name in a small white pill, tagline bare underneath — the exact
          treatment the home page's `FriendPod` uses, so a friend is presented
          the same way on both pages. White on white: the pill is read by its
          shadow, the same way it is on the home card. */}
      <h3
        className="card card-pill anim-fade-up mt-5 px-5 py-1.5 text-lg font-bold sm:px-6 sm:text-xl"
        style={{
          color: locked ? "var(--color-locked-text)" : "var(--color-ink)",
          animationDelay: delay.name,
        }}
      >
        {name}
      </h3>

      <p
        className="anim-fade-up mt-3 max-w-[13rem] text-center text-sm leading-snug text-[var(--color-ink)]/60"
        style={{ animationDelay: delay.tagline }}
      >
        {tagline}
      </p>

      <Button3D
        tone={
          locked
            ? {
                face: "var(--color-locked)",
                edge: "var(--color-locked-dark)",
                text: "var(--color-locked-text)",
              }
            : { face: accent, edge: accentDark }
        }
        href={locked ? undefined : `/learn/${character.id}`}
        disabled={locked}
        aria-label={locked ? `${name} is locked` : `Learn with ${name}`}
        className="anim-fade-up mt-5 w-full max-w-[220px] px-5 py-3 text-sm sm:text-base"
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
