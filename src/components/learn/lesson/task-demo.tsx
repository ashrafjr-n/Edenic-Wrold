import type { CSSProperties } from "react";
import Image from "next/image";
import { Check, Pointer, Volume2 } from "lucide-react";
import { SHAPES } from "@/data/shapes";
import { strokeToPath } from "@/lib/trace-score";
import type { Scene, ShapeId } from "@/types/course";
import { FaceView } from "./face";
import { letterTones } from "./clay-word";
import { deal } from "./spell-word";
import { place } from "./find-shapes";
import { ClayFilter } from "./trace-board";

/** What a step's task button shows: how the step is played — only its first
    move, never the whole answer. Each is one looping CSS animation
    (`.demo-*` in `globals.css`, 3.6s), so it is always mid-show when the
    popup opens and a child who looks away has missed nothing. */
export type TaskDemoDef =
  | { kind: "listen"; shape?: ShapeId }
  | { kind: "draw"; shape: ShapeId; accent: string }
  | { kind: "build"; word: string; seed: string }
  | { kind: "find"; scene: Scene; shape: ShapeId };

/** The finger that plays each demo — a lucide icon, white with an ink
    outline so it reads on grass, clay and the white card alike. Put inside a
    zero-size box at the target; the margins land the glyph's fingertip (at
    1/3, 1/12 of `Pointer`'s box) on that point, not its corner. */
function Finger() {
  return (
    <span aria-hidden className="demo-finger pointer-events-none absolute z-10 -ml-[0.83rem] -mt-[0.2rem]">
      <Pointer className="h-10 w-10 fill-white text-[var(--color-ink-fixed)] drop-shadow-md" strokeWidth={1.75} />
    </span>
  );
}

/** Listen: the finger taps the big speaker and the sound rings out. */
function ListenDemo({ shape }: { shape?: ShapeId }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      {shape && (
        <span className="flex h-24 w-24 items-center justify-center">
          <FaceView face={{ kind: "shape", shape }} size="tile" />
        </span>
      )}
      <span className="relative">
        <span aria-hidden className="demo-wave absolute inset-0 rounded-full bg-[var(--color-gold)]" />
        <span aria-hidden className="demo-wave demo-wave--late absolute inset-0 rounded-full bg-[var(--color-gold)]" />
        <span
          className="demo-press clay relative flex h-20 w-20 items-center justify-center rounded-full text-[var(--color-ink-fixed)]"
          style={{ backgroundColor: "var(--color-gold)", "--clay-edge": "var(--color-gold-dark)" } as CSSProperties}
        >
          <Volume2 className="h-9 w-9" strokeWidth={2.75} />
        </span>
        <span className="absolute left-1/2 top-1/2">
          <Finger />
        </span>
      </span>
    </div>
  );
}

/** Draw: the first part of the stroke, from the start disc, the finger riding
    its tip — then it lets go. The rest is the child's. */
function DrawDemo({ shape, accent }: { shape: ShapeId; accent: string }) {
  const d = SHAPES[shape].strokes.map(strokeToPath).join(" ");
  const start = SHAPES[shape].strokes[0][0];
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible" aria-hidden>
      <defs>
        <ClayFilter id="demo-clay" />
      </defs>
      <path d={d} fill="none" stroke="var(--color-locked-dark)" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="0 11.5" />
      <g filter="url(#demo-clay)">
        <circle cx={start[0]} cy={start[1]} r={7} fill={accent} />
        <path className="demo-draw" d={d} pathLength={100} fill="none" stroke={accent} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g className="demo-pen" style={{ "--pen-path": `path("${d}")` } as CSSProperties}>
        <Pointer x={-4.67} y={-1.17} width={14} height={14} className="fill-white text-[var(--color-ink-fixed)]" strokeWidth={1.75} />
      </g>
    </svg>
  );
}

/** Build: the finger taps the word's FIRST letter and it flies into the first
    space. The other letters stay where they are. */
function BuildDemo({ word, seed }: { word: string; seed: string }) {
  const letters = deal(word, seed);
  const tones = letterTones(word);
  const first = letters.indexOf(word[0]);
  const columns = { gridTemplateColumns: `repeat(${word.length}, minmax(0, 2.75rem))` };
  const tile = (letter: string, style?: CSSProperties, className = "") => {
    const tone = tones[word.indexOf(letter)];
    return (
      <span
        className={`clay flex h-full w-full items-center justify-center rounded-[28%] pb-[6%] text-[length:62cqi] font-bold leading-none text-white ${className}`}
        style={{ backgroundColor: tone.face, "--clay-edge": tone.edge, textShadow: `0 0.06em 0 ${tone.edge}`, ...style } as CSSProperties}
      >
        {letter}
      </span>
    );
  };
  return (
    <div dir="ltr" className="flex h-full flex-col items-center justify-center gap-3">
      <div className="grid justify-center gap-1.5" style={columns}>
        {letters.map((_, i) => (
          <span key={i} className="letter-slot aspect-square" />
        ))}
      </div>
      <div className="grid justify-center gap-1.5" style={columns}>
        {letters.map((letter, i) => (
          <span key={i} className="@container relative aspect-square">
            {i === first
              ? tile(letter, { "--fly-x": `calc(${-i} * (100% + 0.375rem))`, "--fly-y": "calc(-100% - 0.75rem)" } as CSSProperties, "demo-fly relative z-[1]")
              : tile(letter)}
            {i === first && (
              <span className="absolute left-1/2 top-1/2">
                <Finger />
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Find: the finger taps ONE of the things and the ring draws round it. */
function FindDemo({ scene, shape }: { scene: Scene; shape: ShapeId }) {
  const target = scene.items.find((item) => item.shape === shape);
  return (
    <div className="relative mx-auto aspect-[4/5] h-full overflow-hidden rounded-[1.35rem]">
      <Image src={scene.background} alt="" fill sizes="18rem" className="object-cover" />
      {scene.items.map((item) => (
        <span key={item.id} className="absolute" style={place(item.box)}>
          <Image src={item.src} alt="" fill sizes="20vw" className="object-contain" />
        </span>
      ))}
      {target && (
        <span className="absolute" style={place(target.hit)}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute left-[-8%] top-[-8%] h-[116%] w-[116%] overflow-visible" aria-hidden>
            <ellipse className="demo-ring find-ring--under" cx="50" cy="50" rx="48" ry="48" pathLength={100} />
            <ellipse className="demo-ring" cx="50" cy="50" rx="48" ry="48" pathLength={100} />
          </svg>
          <span
            className="demo-tick clay absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full text-white"
            style={{ backgroundColor: "var(--color-go)", "--clay-edge": "var(--color-go-dark)" } as CSSProperties}
          >
            <Check className="h-3.5 w-3.5" strokeWidth={3.5} />
          </span>
          <span className="absolute left-1/2 top-1/2">
            <Finger />
          </span>
        </span>
      )}
    </div>
  );
}

/** The demo for one step, filling a square stage. */
export function TaskDemo({ demo }: { demo: TaskDemoDef }) {
  switch (demo.kind) {
    case "listen":
      return <ListenDemo shape={demo.shape} />;
    case "draw":
      return <DrawDemo shape={demo.shape} accent={demo.accent} />;
    case "build":
      return <BuildDemo word={demo.word} seed={demo.seed} />;
    case "find":
      return <FindDemo scene={demo.scene} shape={demo.shape} />;
  }
}
