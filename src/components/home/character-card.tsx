import Image from "next/image";
import { Lock } from "lucide-react";
import type { Character } from "@/types/character";

export function CharacterCard({ character }: { character: Character }) {
  const { name, image, accent, accentSoft, locked } = character;

  return (
    <div
      className="group relative flex w-full max-w-xs flex-col items-center rounded-[2.5rem] px-6 pb-7 pt-10 text-center shadow-[0_10px_30px_-12px_rgba(61,36,114,0.18)] transition-transform duration-300 sm:hover:-translate-y-2"
      style={{ backgroundColor: locked ? "#f4f2fa" : accentSoft }}
    >
      <div
        className="absolute top-6 h-40 w-40 rounded-full blur-3xl"
        style={{ backgroundColor: accent, opacity: locked ? 0.12 : 0.35 }}
      />

      <div className="relative">
        <Image
          src={image}
          alt={name}
          width={475}
          height={539}
          className={`h-48 w-auto object-contain drop-shadow-[0_12px_20px_rgba(61,36,114,0.2)] transition-transform duration-300 sm:h-56 ${
            locked ? "grayscale opacity-50" : "group-hover:scale-105"
          }`}
          priority={!locked}
        />

        {locked && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-md">
              <Lock className="h-6 w-6 text-[var(--color-ink)]/60" strokeWidth={2.25} />
            </span>
          </span>
        )}
      </div>

      <h3
        className="relative mt-4 text-2xl font-semibold sm:text-3xl"
        style={{ color: locked ? "#9a93b3" : "var(--color-ink)" }}
      >
        {name}
      </h3>

      <button
        type="button"
        disabled={locked}
        className={`relative mt-5 w-full rounded-full px-6 py-3 text-base font-semibold transition-transform sm:text-lg ${
          locked
            ? "cursor-not-allowed bg-[#e7e4f1] text-[#9a93b3]"
            : "text-white shadow-md hover:scale-105"
        }`}
        style={locked ? undefined : { backgroundColor: accent }}
      >
        {locked ? "Locked" : `Learn With ${name}`}
      </button>
    </div>
  );
}
