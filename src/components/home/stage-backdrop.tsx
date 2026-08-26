import type { CSSProperties } from "react";

type StageVars = CSSProperties & {
  "--x"?: string;
  "--y"?: string;
  "--size"?: string;
  "--tint"?: string;
  "--shape"?: string;
  "--soft"?: string;
  "--strength"?: string;
};

interface StageBlob {
  x: string;
  y: string;
  size: string;
  tint: string;
  /** Irregular border-radius — what makes the shape read as organic. */
  shape: string;
  strength: string;
}

interface StageDot {
  x: string;
  y: string;
  size: string;
  tint: string;
  strength: string;
}

/** Large, soft, and few. Their job is to break up the flat field without
    ever becoming something a child would look *at* — every one of them is
    blurred well past the point of being a recognisable shape. */
const blobs: StageBlob[] = [
  {
    x: "-6%",
    y: "8%",
    size: "clamp(220px, 26vw, 420px)",
    tint: "color-mix(in srgb, var(--color-pinki) 34%, transparent)",
    shape: "58% 42% 47% 53% / 44% 51% 49% 56%",
    strength: "0.5",
  },
  {
    x: "72%",
    y: "-4%",
    size: "clamp(200px, 24vw, 390px)",
    tint: "color-mix(in srgb, var(--color-bloo) 36%, transparent)",
    shape: "43% 57% 62% 38% / 55% 43% 57% 45%",
    strength: "0.5",
  },
  {
    x: "38%",
    y: "-12%",
    size: "clamp(170px, 20vw, 320px)",
    tint: "color-mix(in srgb, var(--color-nova) 30%, transparent)",
    shape: "52% 48% 38% 62% / 47% 58% 42% 53%",
    strength: "0.45",
  },
];

/** Flat bubbles, gold-led — the signature color, scattered lightly. */
const dots: StageDot[] = [
  { x: "12%", y: "26%", size: "clamp(8px, 1vw, 14px)", tint: "var(--color-gold)", strength: "0.5" },
  { x: "27%", y: "16%", size: "clamp(5px, 0.6vw, 9px)", tint: "var(--color-pinki)", strength: "0.4" },
  { x: "63%", y: "13%", size: "clamp(7px, 0.9vw, 12px)", tint: "var(--color-gold)", strength: "0.45" },
  { x: "81%", y: "30%", size: "clamp(6px, 0.7vw, 10px)", tint: "var(--color-bloo)", strength: "0.45" },
  { x: "91%", y: "18%", size: "clamp(5px, 0.6vw, 9px)", tint: "var(--color-nova)", strength: "0.4" },
  { x: "48%", y: "34%", size: "clamp(5px, 0.6vw, 8px)", tint: "var(--color-gold)", strength: "0.35" },
];

/** Flat, CSS-only backdrop for the home hero: soft organic washes and a few
    bubbles in the open area around the headline. The world panels are the
    ground now, so there's nothing to draw underneath them — this only has to
    keep the space above them from reading as empty white. No images, so it
    stays a Server Component. */
export function StageBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {blobs.map((blob) => (
        <div
          key={`${blob.x}-${blob.y}`}
          className="stage-blob"
          style={
            {
              "--x": blob.x,
              "--y": blob.y,
              "--size": blob.size,
              "--tint": blob.tint,
              "--shape": blob.shape,
              "--strength": blob.strength,
            } as StageVars
          }
        />
      ))}

      {dots.map((dot) => (
        <div
          key={`${dot.x}-${dot.y}`}
          className="stage-dot"
          style={
            {
              "--x": dot.x,
              "--y": dot.y,
              "--size": dot.size,
              "--tint": dot.tint,
              "--strength": dot.strength,
            } as StageVars
          }
        />
      ))}
    </div>
  );
}
