import type { CSSProperties } from "react";
import Image from "next/image";
import { Lock, Play } from "lucide-react";
import { Button3D } from "@/components/ui/button-3d";
import type { Character } from "@/types/character";

/** The whole cast lands while the icons are still climbing — the icons are
    decoration and must never gate the content. Everything is on screen by ~1.4s. */
const PANEL_DELAY = 0.4;
const PANEL_STAGGER = 0.1;
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
  const { name, image, accent, accentSoft, accentDark, locked } = character;

  const friendDelay = FRIEND_DELAY + index * FRIEND_STAGGER;
  const delay = {
    panel: `${PANEL_DELAY + index * PANEL_STAGGER}s`,
    friend: `${friendDelay}s`,
    breathe: `${friendDelay + POP_IN_DURATION}s`,
    name: `${friendDelay + NAME_OFFSET}s`,
    button: `${friendDelay + BUTTON_OFFSET}s`,
  };

  /* The open world is the only one that lifts, glows and grows — hierarchy
     comes from the panel's form, not just from its color. */
  const panelClasses = [
    "world-panel anim-arch-in group/card relative flex flex-1 flex-col items-center justify-end px-3 pb-6 pt-24 sm:pt-32",
    locked ? "world-panel--locked" : "world-panel--open sm:-translate-y-3",
  ].join(" ");

  const faceStyle: CSSProperties = {
    backgroundImage: locked
      ? `linear-gradient(180deg, #f4f1f8 0%, ${accentSoft} 55%, ${accent} 100%)`
      : `linear-gradient(180deg, ${accentSoft} 0%, ${accent} 100%)`,
    boxShadow: locked
      ? "0 18px 40px -24px rgb(59 36 101 / 35%)"
      : `inset 0 0 0 3px color-mix(in srgb, var(--color-gold) 55%, transparent), 0 26px 50px -22px ${accentDark}`,
  };

  return (
    <div className={panelClasses} style={{ animationDelay: delay.panel }}>
      {/* The panel's colored face is its own layer so the character can
          overflow past the top edge without being clipped by it. */}
      <div className="panel-face absolute inset-0 -z-10" style={faceStyle} aria-hidden />

      {locked && (
        <div
          className="panel-face absolute inset-0 -z-10 bg-white/45 backdrop-blur-[2px]"
          aria-hidden
        />
      )}

      <div
        className="anim-pop-in relative -mt-20 sm:-mt-28"
        style={{ animationDelay: delay.friend }}
      >
        {/* Contact shadow: a wide ambient pool plus a tight dark core right
            under the feet. Sits outside the floating wrapper so it stays
            planted on the ground while the character breathes. */}
        <div
          className="absolute bottom-0 left-1/2 z-0 h-5 w-36 -translate-x-1/2 rounded-[50%] bg-[var(--color-ink)]/15 blur-lg sm:w-44 lg:w-52"
          aria-hidden
        />
        <div
          className="absolute bottom-1 left-1/2 z-0 h-3 w-24 -translate-x-1/2 rounded-[50%] bg-[var(--color-ink)]/25 blur-md sm:w-28 lg:w-32"
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
            className={`h-56 w-auto object-contain drop-shadow-[0_18px_22px_rgba(59,36,101,0.22)] transition-transform duration-500 sm:h-72 lg:h-[22rem] ${
              locked ? "opacity-70 grayscale" : "group-hover/card:scale-[1.07]"
            }`}
            priority={!locked}
          />
        </div>

        {locked && (
          <span className="absolute inset-0 z-20 flex items-center justify-center">
            <span className="group/lock relative flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_10px_24px_-6px_rgba(59,36,101,0.4)]">
              <Lock
                className="h-8 w-8 text-[var(--color-locked-text)] transition-transform duration-300 group-hover/lock:[animation:wiggle_0.5s_ease-in-out]"
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

      <h3
        className="anim-fade-up relative mt-5 text-4xl font-bold tracking-tight text-white [text-shadow:0_3px_10px_rgba(59,36,101,0.28)] sm:text-5xl"
        style={{
          color: locked ? "var(--color-locked-text)" : undefined,
          textShadow: locked ? "none" : undefined,
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
            : { face: "#ffffff", edge: accentDark, text: accentDark }
        }
        href={locked ? undefined : `/learn/${character.id}`}
        disabled={locked}
        aria-label={locked ? `${name} is locked` : `Learn with ${name}`}
        className="anim-fade-up mt-5 w-full max-w-[230px] px-6 py-3.5 text-base sm:text-lg"
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
