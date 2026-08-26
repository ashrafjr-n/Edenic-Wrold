import type { CSSProperties } from "react";
import Image from "next/image";
import type { Character } from "@/types/character";

type TileVars = CSSProperties & { "--tile-tint"?: string };

interface FriendPodProps {
  character: Character;
  /** Vertical offset class that staggers the pod out of line with its
      neighbours. Passed in so the arc lives in the section, not in the pod. */
  offset: string;
}

/** One friend standing in a pale circular tile, head rising clear of it. The
    overhang is the whole point — a character boxed inside its own tile looks
    pasted on; one breaking the edge looks like it is standing there. */
export function FriendPod({ character, offset }: FriendPodProps) {
  const { name, tagline, image, accent } = character;

  /* The single place a character's own color is allowed to appear, and only
     as a pale wash — the saturated thing is always the render on top. */
  const tileTint = `color-mix(in srgb, ${accent} 20%, #ffffff)`;

  return (
    <div className={`group flex w-full flex-col items-center ${offset}`}>
      <div
        className="tile tile-round relative h-36 w-36 sm:h-40 sm:w-40"
        style={{ "--tile-tint": tileTint } as TileVars}
      >
        {/* Contact shadow sits on the tile, outside the image, so the character
            stays planted while it scales on hover. */}
        <div
          className="absolute bottom-4 left-1/2 h-3 w-24 -translate-x-1/2 rounded-[50%] bg-[rgb(var(--shadow-hue))]/20 blur-md"
          aria-hidden
        />
        <Image
          src={image}
          alt={name}
          width={475}
          height={539}
          sizes="176px"
          className="absolute bottom-3 left-1/2 h-44 w-auto -translate-x-1/2 object-contain drop-shadow-[0_14px_18px_rgba(92,78,190,0.22)] transition-transform duration-300 group-hover:scale-105 sm:h-48"
        />
      </div>

      <h3 className="card card-pill mt-5 px-5 py-1.5 text-lg font-bold text-[var(--color-ink)]">
        {name}
      </h3>

      <p className="mt-3 max-w-[13rem] text-center text-sm leading-snug text-[var(--color-ink)]/60">
        {tagline}
      </p>
    </div>
  );
}
