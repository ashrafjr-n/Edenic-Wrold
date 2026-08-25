import type { CSSProperties } from "react";
import Image from "next/image";
import { Lock, Play } from "lucide-react";
import type { Character } from "@/types/character";

type ShadowVars = CSSProperties & { "--btn-shadow"?: string };
export type ArchPosition = "left" | "middle" | "right";

export function CharacterCard({
  character,
  previousName,
  position,
}: {
  character: Character;
  previousName?: string;
  position: ArchPosition;
}) {
  const { name, image, accentSoft, locked } = character;

  return (
    <div
      className={`group/card relative flex w-full max-w-[260px] flex-col items-center sm:-mx-6 ${
        position === "middle" ? "z-[2]" : "z-[1]"
      }`}
    >
      <div className="relative flex w-full flex-col items-center pb-2 pt-10 sm:pt-14">
        <div
          className="absolute bottom-0 left-1/2 h-56 w-64 -translate-x-1/2 rounded-t-full transition-opacity duration-300 sm:h-72 sm:w-80"
          style={{ backgroundColor: accentSoft, opacity: locked ? 0.55 : 1 }}
          aria-hidden
        />

        <div className="relative">
          <Image
            src={image}
            alt={name}
            width={475}
            height={539}
            className={`h-52 w-auto object-contain drop-shadow-[0_12px_20px_rgba(61,36,114,0.2)] transition-transform duration-300 sm:h-72 ${
              locked ? "grayscale opacity-50" : "group-hover/card:scale-105"
            }`}
            priority={!locked}
          />

          <div
            className="absolute -bottom-2 left-1/2 h-4 w-28 -translate-x-1/2 rounded-full bg-[var(--color-ink)]/15 blur-md"
            aria-hidden
          />

          {locked && (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="group/lock relative flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-md">
                <Lock
                  className="h-7 w-7 text-[var(--color-ink)]/60 transition-transform duration-300 group-hover/lock:[animation:wiggle_0.5s_ease-in-out]"
                  strokeWidth={2.25}
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
          className="relative mt-3 text-3xl font-semibold sm:text-4xl"
          style={{ color: locked ? "#9a93b3" : "var(--color-ink)" }}
        >
          {name}
        </h3>
      </div>

      {locked ? (
        <button
          type="button"
          disabled
          className="relative mt-4 w-full max-w-[200px] rounded-full bg-[var(--color-locked)] px-6 py-3 text-base font-semibold text-[#9a93b3] shadow-[0_4px_0_0_var(--btn-shadow)] sm:text-lg"
          style={{ "--btn-shadow": "var(--color-locked-dark)" } as ShadowVars}
        >
          Locked
        </button>
      ) : (
        <button type="button" className="hero-cta relative mt-4 text-base sm:text-lg">
          Learn With {name}
          <Play />
        </button>
      )}
    </div>
  );
}
