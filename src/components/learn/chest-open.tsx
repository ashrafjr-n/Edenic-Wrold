"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";

/** The chest, as shares of its stop's box (measured on the frame the camera
    ends on — the same chest in every course's world): the whole chest, and
    how much of its top is the lid (the dome down to the lock plate). */
const CHEST = {
  portrait: { x: 0.285, y: 0.105, w: 0.44, h: 0.545, lid: 0.225 },
  landscape: { x: 0.275, y: 0.09, w: 0.46, h: 0.56, lid: 0.235 },
} as const;

interface ChestOpenProps {
  /** The chest stop, whose box (% of the frame) is where the chest is now. */
  stop: RefObject<HTMLElement | null>;
  /** The world's canvas — the chest is copied from the picture painted on it. */
  canvas: RefObject<HTMLCanvasElement | null>;
  wide: boolean;
  /** `play`: it shakes, then opens. `still`: it is simply open (a later visit). */
  mode: "play" | "still";
}

/**
 * The gold chest open (2026-11-11, the user): the chest — copied from the
 * painted pixels, so it is exactly the picture's chest — wobbles like a
 * cartoon, then its lid tips back and a soft white light rises out of it.
 * The lid and the body are two copies over the picture; the light sits on an
 * orange inside that hides the picture's own lid. Laid inside the chest's
 * stop, so it stays on the chest wherever the camera is; only transforms and
 * opacity move, and it stays open.
 */
export function ChestOpen({ stop, canvas, wide, mode }: ChestOpenProps) {
  const lidRef = useRef<HTMLCanvasElement>(null);
  const bodyRef = useRef<HTMLCanvasElement>(null);
  const chest = CHEST[wide ? "landscape" : "portrait"];
  const lidShare = chest.lid / chest.h;

  useLayoutEffect(() => {
    const [source, element] = [canvas.current, stop.current];
    if (!source || !element) return;
    /* The stop's box in % of the frame, as the camera set it. */
    const [left, top, width, height] = [element.style.left, element.style.top, element.style.width, element.style.height].map(parseFloat);
    const copy = (target: HTMLCanvasElement | null, [x, y, w, h]: number[]) => {
      const context = target?.getContext("2d");
      if (!target || !context) return;
      const [sx, sy] = [((left + x * width) / 100) * source.width, ((top + y * height) / 100) * source.height];
      const [sw, sh] = [((w * width) / 100) * source.width, ((h * height) / 100) * source.height];
      target.width = Math.round(sw);
      target.height = Math.round(sh);
      context.drawImage(source, sx, sy, sw, sh, 0, 0, target.width, target.height);
    };
    copy(lidRef.current, [chest.x, chest.y, chest.w, chest.lid]);
    copy(bodyRef.current, [chest.x, chest.y + chest.lid, chest.w, chest.h - chest.lid]);
  }, [stop, canvas, chest]);

  const at = { left: `${chest.x * 100}%`, top: `${chest.y * 100}%`, width: `${chest.w * 100}%`, height: `${chest.h * 100}%` };
  const lidBox = { height: `${lidShare * 100}%` };

  return (
    <span className={`chest-open ${mode === "still" ? "chest-open--still" : ""}`} aria-hidden>
      <span className="chest-shake" style={at}>
        <canvas ref={bodyRef} className="chest-body" style={{ top: `${lidShare * 100}%`, height: `${(1 - lidShare) * 100}%` }} />
        <span className="chest-inside" style={lidBox} />
        <span className="chest-light" style={{ top: 0 }}>
          <span className="chest-beam" />
          <span className="chest-rays" />
        </span>
        <canvas ref={lidRef} className="chest-lid" style={lidBox} />
      </span>
    </span>
  );
}
