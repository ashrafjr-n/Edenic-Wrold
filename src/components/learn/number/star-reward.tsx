import Image from "next/image";

interface StarRewardProps {
  /** 1–3. Never 0 — finishing the number at all is the achievement. */
  stars: number;
}

const MAX_STARS = 3;
const STAR_DELAY = 0.1;
const STAR_STAGGER = 0.14;

/**
 * The three gold clay stars that close a number out.
 *
 * They arrive once the whole loop is done — traced and both rounds picked —
 * not after the tracing alone, so they read as the number's own reward rather
 * than as a mark for one step.
 *
 * The same rendered asset as the rest of the site rather than an icon glyph:
 * next to a clay numeral a flat outlined star is a different material.
 * Unearned ones stay in place, desaturated, so the row never jumps.
 */
export function StarReward({ stars }: StarRewardProps) {
  return (
    <div
      className="flex items-end gap-2 sm:gap-4"
      role="img"
      aria-label={`You earned ${stars} out of ${MAX_STARS} stars`}
    >
      {Array.from({ length: MAX_STARS }, (_, index) => {
        const earned = index < stars;

        return (
          <Image
            key={index}
            src="/assets/icons/yellow-star.png"
            alt=""
            width={140}
            height={140}
            className={`anim-pop-in h-14 w-14 object-contain sm:h-20 sm:w-20 ${
              earned
                ? "drop-shadow-[0_10px_14px_rgba(201,137,26,0.35)]"
                : "opacity-35 grayscale"
            }`}
            style={{ animationDelay: `${STAR_DELAY + index * STAR_STAGGER}s` }}
          />
        );
      })}
    </div>
  );
}
