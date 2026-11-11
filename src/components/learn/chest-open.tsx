"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";

/** The lid of the chest, as a share of the chest stop's box (measured on the
    frame the camera ends on, the same in every course's world): the dome down
    to the gold band. */
const LID = {
  portrait: { x: 0.285, y: 0.105, w: 0.44, h: 0.34 },
  landscape: { x: 0.275, y: 0.09, w: 0.46, h: 0.32 },
} as const;

/** How long the opening plays, ms (the sum of the `chest-*` animations in
    `globals.css`): the review starts when it ends. */
export const CHEST_OPEN_MS = 2300;

interface ChestOpenProps {
  /** The chest stop, whose box (% of the frame) is where the chest is now. */
  stop: RefObject<HTMLElement | null>;
  /** The world's canvas — the lid is copied from the picture painted on it. */
  canvas: RefObject<HTMLCanvasElement | null>;
  wide: boolean;
}

/**
 * The chest opening (2026-11-11, the user): the lid — a copy of the painted
 * pixels, so it starts exactly where the picture's lid is — tips back, a warm
 * light fills the chest under it, a beam and slow rays rise out, and the light
 * grows until it covers the world. Laid inside the chest's stop, so it goes
 * wherever the camera has put it; only transforms and opacity move.
 */
export function ChestOpen({ stop, canvas, wide }: ChestOpenProps) {
  const lidRef = useRef<HTMLCanvasElement>(null);
  const lid = LID[wide ? "landscape" : "portrait"];

  useLayoutEffect(() => {
    const [source, target, element] = [canvas.current, lidRef.current, stop.current];
    const context = target?.getContext("2d");
    if (!source || !target || !context || !element) return;
    /* The stop's box in % of the frame, as the camera set it. */
    const [left, top, width, height] = [element.style.left, element.style.top, element.style.width, element.style.height].map(parseFloat);
    const [sx, sy] = [((left + lid.x * width) / 100) * source.width, ((top + lid.y * height) / 100) * source.height];
    const [sw, sh] = [((lid.w * width) / 100) * source.width, ((lid.h * height) / 100) * source.height];
    target.width = Math.round(sw);
    target.height = Math.round(sh);
    context.drawImage(source, sx, sy, sw, sh, 0, 0, target.width, target.height);
  }, [stop, canvas, lid]);

  const box = { left: `${lid.x * 100}%`, top: `${lid.y * 100}%`, width: `${lid.w * 100}%`, height: `${lid.h * 100}%` };

  return (
    <span className="chest-open" aria-hidden>
      <span className="chest-inside" style={box} />
      <span className="chest-light" style={{ left: box.left, width: box.width, top: box.top }}>
        <span className="chest-beam" />
        <span className="chest-rays" />
      </span>
      <canvas ref={lidRef} className="chest-lid" style={box} />
      <span className="chest-bloom" style={{ left: "50%", top: `${(lid.y + lid.h / 2) * 100}%` }} />
    </span>
  );
}
