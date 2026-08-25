import type { CSSProperties } from "react";
import Image from "next/image";
import { Lock, Play } from "lucide-react";
import { Button3D } from "@/components/ui/button-3d";
import type { Character } from "@/types/character";

type ArchVars = CSSProperties & { "--arch-opacity"?: string };

/** Arches land while the icons are still climbing; the friends arrive after. */
const ARCH_DELAY = 0.5;
const ARCH_STAGGER = 0.12;
const FRIEND_DELAY = 2.3;
const FRIEND_STAGGER = 0.15;

export function CharacterCard({
  character,
  previousName,
  index,
}: {
  character: Character;
  previousName?: string;
  index: number;
}) {
  const { name, image, accent, accentSoft, accentDark, locked } = character;

  const archDelay = `${ARCH_DELAY + index * ARCH_STAGGER}s`;
  const friendDelay = FRIEND_DELAY + index * FRIEND_STAGGER;

  return (
    <div className="group/card relative flex w-full max-w-[300px] flex-col items-center">
      {/* The arch stops at the character's feet — the name and button sit
          below it, clear of the shape. */}
      <div className="relative flex w-full justify-center pt-10 sm:pt-14">
        <div
          className="anim-arch-in absolute bottom-0 left-1/2 h-[85%] w-64 -translate-x-1/2 rounded-t-full sm:w-72 lg:w-80"
          style={
            {
              backgroundColor: accentSoft,
              animationDelay: archDelay,
              "--arch-opacity": locked ? "0.5" : "1",
            } as ArchVars
          }
          aria-hidden
        />

        <div
          className="anim-pop-in relative"
          style={{ animationDelay: `${friendDelay}s` }}
        >
          <Image
            src={image}
            alt={name}
            width={475}
            height={539}
            className={`h-60 w-auto object-contain drop-shadow-[0_12px_20px_rgba(61,36,114,0.18)] transition-transform duration-300 sm:h-72 lg:h-80 ${
              locked ? "opacity-60 grayscale" : "group-hover/card:scale-105"
            }`}
            priority={!locked}
          />

          <div
            className="absolute -bottom-1 left-1/2 h-3 w-28 -translate-x-1/2 rounded-[50%] bg-[var(--color-ink)]/15 blur-md"
            aria-hidden
          />

          {locked && (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="group/lock relative flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_6px_16px_-4px_rgba(61,36,114,0.35)]">
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
      </div>

      <h3
        className="anim-fade-up relative mt-4 text-3xl font-semibold sm:text-4xl"
        style={{
          color: locked ? "var(--color-locked-text)" : "var(--color-ink)",
          animationDelay: `${friendDelay + 0.15}s`,
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
            : { face: accent, edge: accentDark }
        }
        disabled={locked}
        aria-label={locked ? `${name} is locked` : `Learn with ${name}`}
        className="anim-fade-up mt-4 w-full max-w-[220px] px-6 py-3.5 text-base sm:text-lg"
        style={{ animationDelay: `${friendDelay + 0.25}s` }}
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
