"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";

/** The chest and its lid, as shares of the chest stop's box (measured on the
    frame the camera ends on — the same chest in every course's world). The
    chest's box takes a margin of the flat pedestal round it, so the copy can
    shake over the picture without its edges showing. The lid: the dome down to
    the top of the lock plate. */
const CHEST = {
  portrait: { body: { x: 0.19, y: 0, w: 0.62, h: 0.72 }, lid: { x: 0.285, y: 0.105, w: 0.44, h: 0.225 } },
  landscape: { body: { x: 0.18, y: 0, w: 0.64, h: 0.72 }, lid: { x: 0.275, y: 0.09, w: 0.46, h: 0.235 } },
} as const;

type Box = { x: number; y: number; w: number; h: number };

interface ChestOpenProps {
  /** The chest stop, whose box (% of the frame) is where the chest is now. */
  stop: RefObject<HTMLElement | null>;
  /** The world's canvas — the chest is copied from the picture painted on it. */
  canvas: RefObject<HTMLCanvasElement | null>;
  wide: boolean;
}

/** `box` as CSS, a share of its parent. */
const share = ({ x, y, w, h }: Box) => ({ left: `${x * 100}%`, top: `${y * 100}%`, width: `${w * 100}%`, height: `${h * 100}%` });

/**
 * The gold chest opening (2026-11-11, the user: the child reaches it, it
 * shakes like a cartoon, opens, and there is white light inside): the chest
 * — a copy of the painted pixels, so it is exactly the picture's chest —
 * wobbles on its pedestal, then its lid tips back and a white light fills
 * it, a beam and slow rays rising out. Laid inside the chest's stop, so it
 * sits wherever the camera has put it; only transforms and opacity move. It
 * stays open until the page is left or scrolled.
 */
export function ChestOpen({ stop, canvas, wide }: ChestOpenProps) {
  const bodyRef = useRef<HTMLCanvasElement>(null);
  const lidRef = useRef<HTMLCanvasElement>(null);
  const { body, lid } = CHEST[wide ? "landscape" : "portrait"];
  /* The lid inside the chest's own box. */
  const lidIn: Box = { x: (lid.x - body.x) / body.w, y: (lid.y - body.y) / body.h, w: lid.w / body.w, h: lid.h / body.h };

  useLayoutEffect(() => {
    const [source, element] = [canvas.current, stop.current];
    if (!source || !element) return;
    /* The stop's box in % of the frame, as the camera set it. */
    const [left, top, width, height] = [element.style.left, element.style.top, element.style.width, element.style.height].map(parseFloat);
    const copy = (target: HTMLCanvasElement | null, box: Box) => {
      const context = target?.getContext("2d");
      if (!target || !context) return;
      const [sx, sy] = [((left + box.x * width) / 100) * source.width, ((top + box.y * height) / 100) * source.height];
      const [sw, sh] = [((box.w * width) / 100) * source.width, ((box.h * height) / 100) * source.height];
      target.width = Math.round(sw);
      target.height = Math.round(sh);
      context.drawImage(source, sx, sy, sw, sh, 0, 0, target.width, target.height);
    };
    copy(bodyRef.current, body);
    copy(lidRef.current, lid);
  }, [stop, canvas, body, lid]);

  return (
    <span className="chest-open" aria-hidden>
      <span className="chest-shake" style={share(body)}>
        <canvas ref={bodyRef} className="chest-body" />
        <span className="chest-inside" style={share(lidIn)} />
        <span className="chest-light" style={{ left: `${lidIn.x * 100}%`, width: `${lidIn.w * 100}%`, top: `${lidIn.y * 100}%` }}>
          <span className="chest-beam" />
          <span className="chest-rays" />
        </span>
        <canvas ref={lidRef} className="chest-lid" style={share(lidIn)} />
      </span>
    </span>
  );
}
