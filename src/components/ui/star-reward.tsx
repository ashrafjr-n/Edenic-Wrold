import Image from "next/image";

/** `reward` is the celebration screen's own size; `compact` is the summary
    row that sits under a numeral in a grid. Only the scale differs — what
    an earned and an unearned star LOOK like is defined once, below. */
type StarSize = "reward" | "compact";

interface StarRewardProps {
  /** 0–3. Zero is a legitimate value for `compact`: an unfinished number
      still shows three empty slots, so a child can see what is on offer. */
  stars: number;
  size?: StarSize;
}

const MAX_STARS = 3;
const STAR_DELAY = 0.1;
const STAR_STAGGER = 0.14;

const SIZES: Record<StarSize, { row: string; star: string }> = {
  reward: { row: "gap-2 sm:gap-4", star: "h-14 w-14 sm:h-20 sm:w-20" },
  compact: { row: "gap-1", star: "h-4 w-4 sm:h-5 sm:w-5" },
};

/**
 * The three gold clay stars that close a number out.
 *
 * They arrive once the whole loop is done — traced and both rounds picked —
 * not after the tracing alone, so they read as the number's own reward rather
 * than as a mark for one step.
 *
 * The same rendered asset as the rest of the site rather than an icon glyph:
 * next to a clay numeral a flat outlined star is a different material.
 *
 * **All three slots are always drawn; unearned ones stay in place,
 * desaturated.** That is the whole point of the component — a row that only
 * rendered the stars a child had actually won would jump around, and on a
 * grid of unfinished numbers it would say nothing about there being stars to
 * win at all.
 */
export function StarReward({ stars, size = "reward" }: StarRewardProps) {
  const scale = SIZES[size];

  return (
    <div
      className={`flex items-end ${scale.row}`}
      role="img"
      aria-label={`${stars} out of ${MAX_STARS} stars`}
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
            className={`anim-pop-in object-contain ${scale.star} ${
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
