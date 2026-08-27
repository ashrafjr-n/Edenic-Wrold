import type { CSSProperties } from "react";

/* Fixed data, never `Math.random()`: this renders on the server too, and a
   random burst would hydrate mismatched. The angles and distances are spread
   by hand so it still reads as a scatter. */
const CONFETTI = [
  { x: "-8rem", y: "-4.5rem", spin: "220deg", delay: 0, color: "var(--color-pinki)" },
  { x: "-5.5rem", y: "-7.5rem", spin: "-160deg", delay: 0.06, color: "var(--color-gold)" },
  { x: "-2rem", y: "-9rem", spin: "300deg", delay: 0.02, color: "var(--brand)" },
  { x: "1.5rem", y: "-8.5rem", spin: "-240deg", delay: 0.1, color: "var(--color-nova)" },
  { x: "5rem", y: "-7rem", spin: "180deg", delay: 0.04, color: "var(--color-go)" },
  { x: "7.5rem", y: "-3.5rem", spin: "-300deg", delay: 0.12, color: "var(--color-bloo)" },
  { x: "8.5rem", y: "0.5rem", spin: "260deg", delay: 0.02, color: "var(--color-gold)" },
  { x: "7rem", y: "5rem", spin: "-200deg", delay: 0.14, color: "var(--brand)" },
  { x: "3rem", y: "7.5rem", spin: "340deg", delay: 0.08, color: "var(--color-pinki)" },
  { x: "-1rem", y: "8.5rem", spin: "-280deg", delay: 0.16, color: "var(--color-go)" },
  { x: "-5rem", y: "7rem", spin: "200deg", delay: 0.06, color: "var(--color-gold)" },
  { x: "-8rem", y: "3rem", spin: "-320deg", delay: 0.11, color: "var(--color-bloo)" },
] as const;

/**
 * A two-second confetti burst from the centre of whatever contains it.
 *
 * CSS keyframes rather than canvas-confetti: a dozen squares does not earn a
 * dependency, and every other animation on the site is keyframes. The wrapper
 * is `pointer-events-none` — it must never eat a tap meant for the button it
 * is bursting over.
 */
export function Celebration() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
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
  );
}
