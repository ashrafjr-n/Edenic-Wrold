import type { CSSProperties } from "react";
import Image from "next/image";
import { Lock } from "lucide-react";
import type { Character } from "@/types/character";

type ShadowVars = CSSProperties & { "--btn-shadow"?: string };

export function CharacterCard({
  character,
  previousName,
}: {
  character: Character;
  previousName?: string;
}) {
  const { name, image, accent, accentSoft, accentDark, locked } = character;

  return (
    <div
      className="group/card relative flex w-full max-w-xs flex-col items-center rounded-[2.5rem] px-6 pb-7 pt-8 text-center shadow-[inset_0_2px_0_0_rgb(255_255_255_/_50%),0_14px_28px_-12px_rgba(61,36,114,0.22)] transition-transform duration-300 sm:hover:-translate-y-2"
      style={{ backgroundColor: accentSoft }}
    >
      <div
        className="absolute top-6 h-40 w-40 rounded-full blur-3xl"
        style={{ backgroundColor: accent, opacity: locked ? 0.2 : 0.35 }}
      />

      <div className="relative">
        <Image
          src={image}
          alt={name}
          width={475}
          height={539}
          className={`h-48 w-auto object-contain drop-shadow-[0_12px_20px_rgba(61,36,114,0.2)] transition-transform duration-300 sm:h-56 ${
            locked ? "grayscale opacity-50" : "group-hover/card:scale-105"
          }`}
          priority={!locked}
        />

        <div
          className="absolute -bottom-2 left-1/2 h-4 w-24 -translate-x-1/2 rounded-full bg-[var(--color-ink)]/15 blur-md"
          aria-hidden
        />

        {locked && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="group/lock relative flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-md">
              <Lock
                className="h-6 w-6 text-[var(--color-ink)]/60 transition-transform duration-300 group-hover/lock:[animation:wiggle_0.5s_ease-in-out]"
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
        className="relative mt-3 text-2xl font-semibold sm:text-3xl"
        style={{ color: locked ? "#9a93b3" : "var(--color-ink)" }}
      >
        {name}
      </h3>

      <button
        type="button"
        disabled={locked}
        className={`relative mt-5 w-full rounded-full px-6 py-3 text-base font-semibold transition-all duration-150 sm:text-lg ${
          locked
            ? "bg-[var(--color-locked)] text-[#9a93b3] shadow-[0_4px_0_0_var(--btn-shadow)]"
            : "text-white shadow-[0_4px_0_0_var(--btn-shadow)] hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_var(--btn-shadow)] active:translate-y-1 active:shadow-[0_0px_0_0_var(--btn-shadow)]"
        }`}
        style={
          {
            backgroundColor: locked ? undefined : accent,
            "--btn-shadow": locked ? "var(--color-locked-dark)" : accentDark,
          } as ShadowVars
        }
      >
        {locked ? "Locked" : `Learn With ${name}`}
      </button>
    </div>
  );
}
