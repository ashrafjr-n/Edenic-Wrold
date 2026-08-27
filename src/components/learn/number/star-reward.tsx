import type { CSSProperties } from "react";
import Image from "next/image";

interface StarRewardProps {
  /** 1–3. Never 0 — finishing the numeral at all is the achievement. */
  stars: number;
}

const MAX_STARS = 3;
const STAR_DELAY = 0.1;
const STAR_STAGGER = 0.14;

/* Confetti as fixed data rather than `Math.random()`: this renders on the
   server as well as the client, and a random burst would differ between the
   two and hydrate mismatched. Angles and distances are spread by hand so it
   still reads as a scatter. */
const CONFETTI = [
  { x: "-7.5rem", y: "-4rem", spin: "220deg", delay: 0, color: "var(--color-pinki)" },
  { x: "-5rem", y: "-7rem", spin: "-160deg", delay: 0.06, color: "var(--color-gold)" },
  { x: "-2rem", y: "-8.5rem", spin: "300deg", delay: 0.02, color: "var(--brand)" },
  { x: "1.5rem", y: "-8rem", spin: "-240deg", delay: 0.1, color: "var(--color-nova)" },
  { x: "4.5rem", y: "-6.5rem", spin: "180deg", delay: 0.04, color: "var(--color-pinki)" },
  { x: "7rem", y: "-3.5rem", spin: "-300deg", delay: 0.12, color: "var(--color-bloo)" },
  { x: "8rem", y: "0.5rem", spin: "260deg", delay: 0.02, color: "var(--color-gold)" },
  { x: "6.5rem", y: "4.5rem", spin: "-200deg", delay: 0.14, color: "var(--brand)" },
  { x: "3rem", y: "7rem", spin: "340deg", delay: 0.08, color: "var(--color-pinki)" },
  { x: "-1rem", y: "8rem", spin: "-280deg", delay: 0.16, color: "var(--color-nova)" },
  { x: "-4.5rem", y: "6.5rem", spin: "200deg", delay: 0.06, color: "var(--color-gold)" },
  { x: "-7.5rem", y: "3rem", spin: "-320deg", delay: 0.11, color: "var(--color-bloo)" },
] as const;

/**
 * Three gold clay stars, filled as far as the child earned, over a two-second
 * confetti burst.
 *
 * The stars are the same rendered asset the rest of the site uses rather than
 * an icon glyph — next to the clay numeral, a flat outlined star reads as a
 * different material entirely. Unearned ones stay in place, desaturated, so
 * the child can see what there was to win without the row jumping about.
 */
export function StarReward({ stars }: StarRewardProps) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Behind the stars, and non-interactive — it must never eat a tap
          meant for the Next button underneath. */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden
      >
        {CONFETTI.map((piece, index) => (
          <span
            key={index}
            className="confetti-piece"
            style={
              {
                backgroundColor: piece.color,
                "--confetti-x": piece.x,
                "--confetti-y": piece.y,
                "--confetti-spin": piece.spin,
                animationDelay: `${piece.delay}s`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div
        className="relative flex items-end gap-2 sm:gap-4"
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
              className={`anim-pop-in h-12 w-12 object-contain sm:h-16 sm:w-16 ${
                earned
                  ? "drop-shadow-[0_10px_14px_rgba(201,137,26,0.35)]"
                  : "opacity-35 grayscale"
              }`}
              style={{
                animationDelay: `${STAR_DELAY + index * STAR_STAGGER}s`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
