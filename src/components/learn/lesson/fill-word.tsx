"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import { getImageProps, type StaticImageData } from "next/image";
import { Celebration } from "@/components/ui/celebration";
import { format } from "@/lib/format-dict";
import { lessonCue, playCue } from "@/lib/cue";
import { CueButton } from "./cue-button";
import { letterTones } from "./clay-word";

/** The letters are laid out at this size, in the drawing's own units. */
const FONT_SIZE = 100;
/** The face the drawing is set in (`font-bold` below) — measured the same. */
const FONT = `700 ${FONT_SIZE}px Fredoka`;
/** Room between the letters, so each is a thing of its own to rub. */
const GAP = 8;
/** Room round the word for the outline and the hint. */
const PAD = 12;
/** A letter's ink is looked at on this grid (units). */
const STEP = 5;
/** How far the finger reaches, on the screen — the same on every screen. */
const BRUSH_PX = 18;
/** Rubbed this much, a letter fills the rest of the way by itself. */
const ENOUGH = 0.6;
/** The small pictures fit a square this big (units), one unit apart. */
const TILE = 15;
/** The last letter fills, then the word is done. */
const DONE_MS = 500;

interface Letter {
  char: string;
  /** Where its pen starts — the text's `x`. */
  x: number;
  /** Its ink: left, top, right, bottom (the baseline is y 0). */
  box: [number, number, number, number];
  /** Points inside its ink: x, y, x, y… */
  samples: Float32Array;
}

interface Layout {
  letters: Letter[];
  view: [number, number, number, number];
}

/** Lays the word out and samples each letter's ink on a canvas, in the same
    font as the drawing, so the points lie where the letters are drawn. */
function measure(word: string): Layout | null {
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return null;
  ctx.font = FONT;
  let pen = 0;
  const letters = [...word].map((char): Letter => {
    const m = ctx.measureText(char);
    const left = Math.ceil(m.actualBoundingBoxLeft);
    const right = Math.ceil(m.actualBoundingBoxRight);
    const up = Math.ceil(m.actualBoundingBoxAscent);
    const down = Math.ceil(m.actualBoundingBoxDescent);
    const width = left + right + 2;
    const height = up + down + 2;
    const glyph = document.createElement("canvas");
    glyph.width = width;
    glyph.height = height;
    const g = glyph.getContext("2d", { willReadFrequently: true });
    const points: number[] = [];
    if (g) {
      g.font = FONT;
      g.fillText(char, left + 1, up + 1);
      const ink = g.getImageData(0, 0, width, height).data;
      for (let py = STEP / 2; py < height; py += STEP) {
        for (let px = STEP / 2; px < width; px += STEP) {
          if (ink[(Math.floor(py) * width + Math.floor(px)) * 4 + 3] > 127) points.push(pen - left - 1 + px, py - up - 1);
        }
      }
    }
    const letter: Letter = { char, x: pen, box: [pen - left, -up, pen + right, down], samples: Float32Array.from(points) };
    pen += m.width + GAP;
    return letter;
  });
  const left = Math.min(...letters.map((l) => l.box[0]));
  const top = Math.min(...letters.map((l) => l.box[1]));
  const right = Math.max(...letters.map((l) => l.box[2]));
  const bottom = Math.max(...letters.map((l) => l.box[3]));
  return { letters, view: [left - PAD, top - PAD, right - left + PAD * 2, bottom - top + PAD * 2] };
}

/** The small pictures a letter fills with, packed close whatever their
    shape — a carrot is tall, an apple wide. */
export function FillPattern({ id, picture }: { id: string; picture: StaticImageData }) {
  const aspect = picture.width / picture.height;
  const width = aspect >= 1 ? TILE : TILE * aspect;
  const height = aspect >= 1 ? TILE / aspect : TILE;
  const href = getImageProps({ src: picture, alt: "", width: 32 }).props.src;
  return (
    <pattern id={id} width={width + 1} height={height + 1} patternUnits="userSpaceOnUse" patternTransform="rotate(-12)">
      <image href={href} x={0.5} y={0.5} width={width} height={height} />
    </pattern>
  );
}

interface FillWordProps {
  word: string;
  /** What the letters fill with. */
  picture: StaticImageData;
  /** "Letter {letter}" — each letter's name for a screen reader. */
  letterAria: string;
  /** "Hear {word}" — the speaker's name. */
  hearLabel: string;
  onSolved: () => void;
}

/**
 * Fill the word: the word in big empty letters, each with its clay outline.
 * Rub a letter with a finger and small pictures of the thing appear where
 * the finger has been; once most of it is rubbed the rest fills by itself
 * and the letter hops. Every letter full → the word is made of apples (of
 * carrots…), and it jumps. Nothing can go wrong — the word is the lesson.
 * On a keyboard each letter is a button: Enter or Space fills it.
 *
 * The drawing is laid out once the font is there (`measure`, on a canvas):
 * each letter's ink is sampled on a grid, and a letter counts as rubbed by
 * how many of its points the finger has passed over.
 */
export function FillWord({ word, picture, letterAria, hearLabel, onSolved }: FillWordProps) {
  /* `useId`'s punctuation is not safe inside `url(#…)`. */
  const fillId = `fill${useId().replace(/[^\w-]/g, "")}`;
  const [layout, setLayout] = useState<Layout | null>(null);
  const [filled, setFilled] = useState<boolean[]>([]);
  const [started, setStarted] = useState(false);
  const inkRef = useRef<SVGPathElement>(null);
  /* What has been rubbed — kept out of state, it changes on every move. */
  const done = useRef<boolean[]>([]);
  const covered = useRef<Uint8Array[]>([]);
  const counts = useRef<number[]>([]);
  const trail = useRef("");
  const last = useRef<{ x: number; y: number } | null>(null);
  const rubbing = useRef(false);
  const brush = useRef(BRUSH_PX);
  const timer = useRef<number | undefined>(undefined);

  /* Laid out before the first paint once Fredoka is in (it always is by
     now — every page is set in it); the canvas needs the real face. */
  useLayoutEffect(() => {
    let live = true;
    const lay = () => {
      const next = live ? measure(word) : null;
      if (!next) return;
      done.current = next.letters.map(() => false);
      covered.current = next.letters.map((letter) => new Uint8Array(letter.samples.length / 2));
      counts.current = next.letters.map(() => 0);
      setFilled(done.current.slice());
      setLayout(next);
    };
    if (document.fonts.check(FONT)) lay();
    else document.fonts.load(FONT).then(lay, lay);
    return () => {
      live = false;
    };
  }, [word]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const solved = filled.length > 0 && filled.every(Boolean);
  const tones = letterTones(word);

  const complete = (i: number) => {
    if (done.current[i]) return;
    done.current[i] = true;
    setFilled(done.current.slice());
    if (!done.current.every(Boolean)) return;
    void playCue(lessonCue.word(word));
    timer.current = window.setTimeout(onSolved, DONE_MS);
  };

  /** Everything of a letter within the brush of (x, y) is rubbed. */
  const rubAt = (x: number, y: number) => {
    if (!layout) return;
    const reach = brush.current;
    layout.letters.forEach((letter, i) => {
      if (done.current[i]) return;
      const [left, top, right, bottom] = letter.box;
      if (x < left - reach || x > right + reach || y < top - reach || y > bottom + reach) return;
      const hit = covered.current[i];
      let count = counts.current[i];
      for (let k = 0; k < hit.length; k++) {
        if (hit[k]) continue;
        if (Math.hypot(letter.samples[2 * k] - x, letter.samples[2 * k + 1] - y) <= reach) {
          hit[k] = 1;
          count++;
        }
      }
      counts.current[i] = count;
      if (count >= hit.length * ENOUGH) complete(i);
    });
  };

  /** From the last point to this one, in steps of half a brush — a fast
      finger skips no part of a letter. */
  const rubTo = (x: number, y: number) => {
    const from = last.current;
    const steps = from ? Math.ceil(Math.hypot(x - from.x, y - from.y) / (brush.current / 2)) : 0;
    for (let k = 1; k <= steps && from; k++) rubAt(from.x + ((x - from.x) * k) / steps, from.y + ((y - from.y) * k) / steps);
    if (!steps) rubAt(x, y);
    last.current = { x, y };
  };

  /** The pointer, in the drawing's units, and how many pixels one unit is. */
  const local = (event: ReactPointerEvent<SVGSVGElement>) => {
    const matrix = event.currentTarget.getScreenCTM();
    if (!matrix) return null;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    return { x: point.x, y: point.y, scale: matrix.a };
  };

  const draw = (segment: string) => {
    trail.current += segment;
    inkRef.current?.setAttribute("d", trail.current);
  };

  const onPointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    const point = local(event);
    if (!point || solved) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    rubbing.current = true;
    brush.current = BRUSH_PX / point.scale;
    inkRef.current?.setAttribute("stroke-width", String(brush.current * 2));
    const at = `${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
    draw(`M${at}L${at}`);
    last.current = null;
    rubTo(point.x, point.y);
    setStarted(true);
  };

  const onPointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!rubbing.current) return;
    const point = local(event);
    if (!point) return;
    draw(`L${point.x.toFixed(1)} ${point.y.toFixed(1)}`);
    rubTo(point.x, point.y);
  };

  const onPointerUp = () => {
    rubbing.current = false;
    last.current = null;
  };

  const onKeyDown = (i: number) => (event: KeyboardEvent<SVGGElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    setStarted(true);
    complete(i);
  };

  return (
    <div className="card card-clay-white card-bare-lg flex w-full max-w-2xl flex-col items-center gap-4 px-3 py-6 sm:gap-6 sm:px-8 sm:py-9 lg:max-w-4xl lg:gap-8 [@media(max-height:700px)]:gap-2 [@media(max-height:700px)]:py-3">
      <CueButton cue={lessonCue.word(word)} label={format(hearLabel, { word })} size="lg" />
      {/* English in every locale: laid out left to right, never mirrored. */}
      <div dir="ltr" className={`relative flex w-full justify-center ${solved ? "anim-jump" : ""}`}>
        {layout ? (
          <svg
            viewBox={layout.view.join(" ")}
            role="group"
            aria-label={word}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            /* `touch-action: none` or a rub scrolls the page instead. */
            className="block h-auto max-h-[min(12rem,26svh)] w-full touch-none select-none overflow-visible font-bold sm:max-h-[min(16rem,28svh)] lg:max-h-[min(20rem,calc(var(--stage-h)*0.55))]"
          >
            <defs>
              <FillPattern id={`${fillId}-p`} picture={picture} />
              <mask id={`${fillId}-m`} maskUnits="userSpaceOnUse" x={layout.view[0]} y={layout.view[1]} width={layout.view[2]} height={layout.view[3]}>
                <path ref={inkRef} fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" />
              </mask>
            </defs>
            {layout.letters.map((letter, i) => (
              <g
                key={i}
                role="button"
                tabIndex={0}
                aria-label={format(letterAria, { letter: letter.char })}
                aria-pressed={filled[i]}
                onKeyDown={onKeyDown(i)}
                className={`fill-letter ${filled[i] ? "fill-pop" : ""}`}
              >
                <text
                  x={letter.x}
                  fontSize={FONT_SIZE}
                  className={`fill-outline ${!started && i === 0 ? "fill-hint" : ""}`}
                  style={{ fill: `color-mix(in srgb, ${tones[i].face} 18%, var(--surface))`, stroke: tones[i].face }}
                >
                  {letter.char}
                </text>
                <text x={letter.x} fontSize={FONT_SIZE} fill={`url(#${fillId}-p)`} mask={`url(#${fillId}-m)`}>
                  {letter.char}
                </text>
                {filled[i] && (
                  <text x={letter.x} fontSize={FONT_SIZE} fill={`url(#${fillId}-p)`} className="fill-in">
                    {letter.char}
                  </text>
                )}
              </g>
            ))}
          </svg>
        ) : (
          <span className="block h-[min(7rem,16svh)] w-full" />
        )}
        {solved && <Celebration />}
      </div>
    </div>
  );
}
