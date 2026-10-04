import { useId } from "react";
import type { CSSProperties } from "react";
import Image, { type StaticImageData } from "next/image";
import { Check, Pointer, ThumbsDown, ThumbsUp, Volume2 } from "lucide-react";
import { COLORS } from "@/data/colors";
import { MAKERS } from "@/data/market";
import { SHAPES } from "@/data/shapes";
import { isTarget } from "@/lib/target";
import { strokeToPath } from "@/lib/trace-score";
import type { ColorId, Face, Garden, Maker, PaintRound, Scene, SeasonScene, ShapeId, SortBin, Target, Thing, Wagon } from "@/types/course";
import { FaceView } from "./face";
import { ClayWord, letterTones, PLAIN_TONE } from "./clay-word";
import { deal } from "./spell-word";
import { shuffle } from "@/lib/seeded";
import { place } from "./find-shapes";
import { ClayFilter } from "./trace-board";
import { binFor } from "./sort-shapes";
import { wordOf } from "./list-note";
import { FillPattern } from "./fill-word";
import { lineOf } from "./harvest-pick";

/** What a step's task button shows: how the step is played — only its first
    move, never the whole answer. Each is one looping CSS animation
    (`.demo-*` in `globals.css`, 3.6s), so it is always mid-show when the
    popup opens and a child who looks away has missed nothing. */
export type TaskDemoDef =
  | { kind: "listen"; face?: Face }
  | { kind: "draw"; shape: ShapeId; accent: string }
  | { kind: "build"; word: string; seed: string }
  | { kind: "find"; scene: Scene; target: Target }
  | { kind: "pick"; word?: string; plain?: boolean; show?: Face[]; options: Face[]; answer: number }
  | { kind: "sort"; item: Thing; bins: SortBin[] }
  | { kind: "paint"; round: PaintRound; pots: ColorId[] }
  | { kind: "pop"; color: ColorId; others: ColorId[] }
  | { kind: "order"; items: Face[]; seed: string }
  | { kind: "make"; list: string[]; stall: Face[]; into: Maker; seed: string }
  | { kind: "like"; face: Face }
  | { kind: "fill"; word: string; picture: StaticImageData }
  | { kind: "change"; scene: SeasonScene }
  | { kind: "train"; engine: StaticImageData; wagons: Wagon[]; seed: string }
  | { kind: "harvest"; garden: Garden; line: { word: string; things: string; count: number } };

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
function ListenDemo({ face }: { face?: Face }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      {face && (
        <span className="flex h-24 w-24 items-center justify-center">
          <FaceView face={face} size="tile" />
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
function FindDemo({ scene, target: looking }: { scene: Scene; target: Target }) {
  const target = scene.items.find((item) => isTarget(item, looking));
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

/** Pick: under the word (or the sum), the finger taps the answer and a
    tick pops on it. */
function PickDemo({ word, plain, show, options, answer }: { word?: string; plain?: boolean; show?: Face[]; options: Face[]; answer: number }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      {word && <ClayWord word={word} size="demo" tone={plain ? PLAIN_TONE : undefined} />}
      {show && (
        <div className="flex items-center justify-center gap-1.5">
          {show.map((face, i) => (
            <FaceView key={i} face={face} size="inline" />
          ))}
        </div>
      )}
      <div className={`grid gap-3 ${options.length === 4 ? "w-[62%] grid-cols-2" : "w-[86%] grid-cols-3"}`}>
        {options.map((face, i) => (
          <span
            key={i}
            className={`card card-clay-white relative flex aspect-square items-center justify-center ${i === answer ? "demo-press" : ""}`}
          >
            <FaceView face={face} size="tile" />
            {i === answer && (
              <>
                <span
                  className="demo-tick clay absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: "var(--color-go)", "--clay-edge": "var(--color-go-dark)" } as CSSProperties}
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={3.5} />
                </span>
                <span className="absolute left-1/2 top-1/2">
                  <Finger />
                </span>
              </>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Sort: the finger taps the right box and the thing flies into it. Laid
    out in % of the square stage so the flight can be worked out: the thing
    is 30% wide, centred at (50, 17); box i sits in a 2x2 grid below. */
function SortDemo({ item, bins }: { item: Thing; bins: SortBin[] }) {
  const i = bins.indexOf(binFor(bins, item) ?? bins[0]);
  const centre = { x: i % 2 === 0 ? 26 : 74, y: i < 2 ? 53.5 : 83.5 };
  const fly = {
    "--fly-x": `${((centre.x - 50) / 30) * 100}%`,
    "--fly-y": `${((centre.y - 17) / 30) * 100}%`,
  } as CSSProperties;
  return (
    <div className="relative h-full w-full">
      <span className="card card-clay-white absolute left-[35%] top-[2%] h-[30%] w-[30%]" />
      <span className="demo-fly absolute left-[35%] top-[2%] z-[1] h-[30%] w-[30%] p-[4%]" style={fly}>
        <span className="relative block h-full w-full">
          <Image src={item.src} alt="" fill sizes="6rem" className="object-contain" />
        </span>
      </span>
      {bins.map(({ word, face: picture, tone: { face, edge, text } }, b) => (
        <span
          key={word}
          className={`clay absolute flex h-[27%] w-[44%] flex-col items-center justify-center gap-1 rounded-[1.2rem] ${b === i ? "demo-press" : ""}`}
          style={
            {
              left: b % 2 === 0 ? "4%" : "52%",
              top: b < 2 ? "40%" : "70%",
              backgroundColor: face,
              color: text,
              "--clay-edge": edge,
            } as CSSProperties
          }
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
            <FaceView face={picture} size="tile" />
          </span>
          <span dir="ltr" className="text-sm font-bold">
            {word}
          </span>
          {b === i && (
            <span className="absolute left-1/2 top-1/2">
              <Finger />
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

/** Paint: under the word, the finger taps its pot and the paint spreads
    over the grey thing. */
function PaintDemo({ round, pots }: { round: PaintRound; pots: ColorId[] }) {
  return (
    /* Sized by its own box (`cqi`): the same demo fills the popup and the
       small panel docked beside a tablet's step. */
    <div className="@container flex h-full w-full flex-col items-center justify-center gap-[4cqi]">
      <span className="[&>span]:text-[17cqi]">
        <ClayWord word={round.color} size="demo" tone={PLAIN_TONE} />
      </span>
      <span className="relative block h-[36%] w-[36%]">
        <Image src={round.blank} alt="" fill sizes="8rem" className="object-contain" />
        <Image src={round.painted} alt="" fill sizes="8rem" className="demo-paint object-contain" />
      </span>
      <div className="flex gap-[3cqi]">
        {pots.map((color) => (
          <span
            key={color}
            className={`card card-clay-white relative flex h-[19cqi] w-[19cqi] items-center justify-center p-[2cqi] ${color === round.color ? "demo-press" : ""}`}
          >
            <span className="relative block h-full w-full">
              <Image src={COLORS[color].pot} alt="" fill sizes="3.5rem" className="object-contain" />
            </span>
            {color === round.color && (
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

/** Pop: three balloons in a pale sky; the finger taps the one of the color
    and it bursts. */
function PopDemo({ color, others }: { color: ColorId; others: ColorId[] }) {
  const row = [others[0], color, others[1] ?? others[0]];
  return (
    <div
      className="relative flex h-full w-full items-center justify-center gap-[6%] overflow-hidden rounded-[1.35rem]"
      style={{ backgroundColor: "color-mix(in srgb, var(--brand) 16%, var(--surface))" }}
    >
      {row.map((c, i) => (
        <span key={i} className={`relative block w-[24%] ${i === 1 ? "-mt-[12%]" : "mt-[8%]"}`}>
          <span className={`block ${i === 1 ? "demo-pop" : ""}`}>
            <Image src={COLORS[c].balloon} alt="" sizes="6rem" className="h-auto w-full" />
          </span>
          {i === 1 && (
            <span className="absolute left-1/2 top-[28%]">
              <Finger />
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

/** Order: the line of numbered spaces, the tiles dealt under it as the
    board deals them; the finger taps the one that comes FIRST and it flies
    into space 1. */
function OrderDemo({ items, seed }: { items: Face[]; seed: string }) {
  const order = shuffle(items.map((_, i) => i), seed);
  const columns = { gridTemplateColumns: `repeat(${items.length}, minmax(0, 3.5rem))` };
  return (
    <div dir="ltr" className="flex h-full flex-col items-center justify-center gap-5">
      <div className="grid justify-center gap-1.5" style={columns}>
        {items.map((_, i) => (
          <span key={i} className="letter-slot aspect-square text-lg font-bold text-[rgb(var(--shadow-hue)/0.28)]">
            {i + 1}
          </span>
        ))}
      </div>
      <div className="grid justify-center gap-1.5" style={columns}>
        {order.map((index, i) => (
          <span key={index} className="relative aspect-square">
            <span
              className={`card card-clay-white flex h-full w-full items-center justify-center ${index === 0 ? "demo-fly relative z-[1]" : ""}`}
              style={index === 0 ? ({ "--fly-x": `calc(${-i} * (100% + 0.375rem))`, "--fly-y": "calc(-100% - 1.25rem)" } as CSSProperties) : undefined}
            >
              <FaceView face={items[index]} size="tile" />
            </span>
            {index === 0 && (
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

/** Make: the word, three things beside the blender (or the pot) as the
    board deals them; the finger takes the one the word names and it flies
    into the jar (the pot's mouth). Laid out in % of the square stage: the
    tiles are 25% wide at 5% left, 25/51/77% top; the blender is 58% wide
    at 38% left, as tall as its picture makes it. */
function MakeDemo({ list, stall, into, seed }: { list: string[]; stall: Face[]; into: Maker; seed: string }) {
  const word = list[0];
  const answer = stall.findIndex((face) => wordOf(face) === word);
  const shown = shuffle([answer, ...stall.map((_, i) => i).filter((i) => i !== answer).slice(0, 2)], seed);
  const { empty, inside } = MAKERS[into];
  const [left, top, width, height] = inside;
  const boxW = 58;
  const boxH = (boxW * empty.height) / empty.width;
  const boxTop = 25 + (74 - boxH) / 2;
  const target = { x: 38 + (boxW * (left + width / 2)) / 100, y: boxTop + (boxH * (top + height * 0.62)) / 100 };
  return (
    /* Sized by its own box (`cqi`): the same demo fills the popup and the
       small panel docked beside a tablet's step. */
    <div dir="ltr" className="@container relative h-full w-full">
      <span className="absolute inset-x-0 top-[3%] flex justify-center [&>span]:text-[13cqi]">
        <ClayWord word={word} size="demo" />
      </span>
      <span className="absolute left-[38%]" style={{ top: `${boxTop}%`, width: `${boxW}%`, height: `${boxH}%` }}>
        <Image src={empty} alt="" fill sizes="12rem" className="object-contain" />
      </span>
      {shown.map((index, slot) => {
        const tileTop = 25 + slot * 26;
        const fly = { "--fly-x": `${((target.x - 17.5) / 25) * 100}%`, "--fly-y": `${((target.y - (tileTop + 11)) / 22) * 100}%` } as CSSProperties;
        return (
          <span key={index} className="absolute left-[5%] h-[22%] w-[25%]" style={{ top: `${tileTop}%` }}>
            <span className={`card card-clay-white absolute inset-0 flex items-center justify-center ${index === answer ? "demo-press" : ""}`}>
              {index === answer ? (
                <span className="demo-fly absolute inset-0 z-[1] flex items-center justify-center" style={fly}>
                  <FaceView face={stall[index]} size="tile" />
                </span>
              ) : (
                <FaceView face={stall[index]} size="tile" />
              )}
            </span>
            {index === answer && (
              <span className="absolute left-1/2 top-1/2">
                <Finger />
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

/** Like: the thing, the two thumbs; the finger taps the thumb up and the
    thing hops onto the "I like" plate. */
function LikeDemo({ face }: { face: Face }) {
  return (
    <div dir="ltr" className="relative h-full w-full">
      <span className="card card-clay-white absolute left-[34%] top-[2%] flex h-[32%] w-[32%] items-center justify-center">
        <span className="demo-fly absolute inset-0 flex items-center justify-center" style={{ "--fly-x": "-78%", "--fly-y": "190%" } as CSSProperties}>
          <FaceView face={face} size="tile" />
        </span>
      </span>
      <span
        className="demo-press clay absolute left-[24%] top-[42%] flex h-[18%] w-[18%] items-center justify-center rounded-full text-white"
        style={{ backgroundColor: "var(--color-go)", "--clay-edge": "var(--color-go-dark)" } as CSSProperties}
      >
        <ThumbsUp className="h-6 w-6" strokeWidth={2.5} />
        <span className="absolute left-1/2 top-1/2">
          <Finger />
        </span>
      </span>
      <span
        className="clay absolute left-[58%] top-[42%] flex h-[18%] w-[18%] items-center justify-center rounded-full text-white"
        style={{ backgroundColor: "var(--accent)", "--clay-edge": "var(--accent-dark)" } as CSSProperties}
      >
        <ThumbsDown className="h-6 w-6" strokeWidth={2.5} />
      </span>
      <span className="plate absolute left-[6%] top-[70%] h-[22%] w-[40%]" />
      <span className="plate absolute right-[6%] top-[70%] h-[22%] w-[40%]" />
    </div>
  );
}

/** How wide each letter of the fill demo stands — even, so the first one's
    place is known without measuring the font. */
const FILL_CELL = 66;

/** Fill: the word in empty clay letters; the finger rubs the FIRST one back
    and forth and the thing's small pictures fill it in behind the finger.
    The other letters stay empty. */
function FillDemo({ word, picture }: { word: string; picture: StaticImageData }) {
  const patternId = `demofill${useId().replace(/[^\w-]/g, "")}`;
  const tones = letterTones(word);
  const width = word.length * FILL_CELL + 24;
  const first = { left: `${(12 / width) * 100}%`, width: `${(FILL_CELL / width) * 100}%` };
  const centre = (i: number) => 12 + FILL_CELL * (i + 0.5);
  return (
    <div dir="ltr" className="flex h-full w-full items-center justify-center">
      <span className="relative block w-[92%]" style={{ aspectRatio: `${width} / 140` }}>
        <svg viewBox={`0 0 ${width} 140`} className="absolute inset-0 h-full w-full overflow-visible font-bold" aria-hidden>
          {[...word].map((char, i) => (
            <text
              key={i}
              x={centre(i)}
              y={102}
              fontSize={100}
              textAnchor="middle"
              className="fill-outline"
              style={{ fill: `color-mix(in srgb, ${tones[i].face} 18%, var(--surface))`, stroke: tones[i].face }}
            >
              {char}
            </text>
          ))}
        </svg>
        <span className="demo-fill absolute top-0 h-full" style={first}>
          <svg viewBox={`12 0 ${FILL_CELL} 140`} className="h-full w-full overflow-visible font-bold" aria-hidden>
            <defs>
              <FillPattern id={patternId} picture={picture} />
            </defs>
            <text x={centre(0)} y={102} fontSize={100} textAnchor="middle" fill={`url(#${patternId})`}>
              {word[0]}
            </text>
          </svg>
        </span>
        <span className="demo-rub absolute top-0 h-full" style={first}>
          <span className="absolute left-1/2 top-[58%]">
            <Finger />
          </span>
        </span>
      </span>
    </div>
  );
}

/** Pick (a review's exam): the note's first line and the basket over the
    garden; the finger taps one of its food and it flies up into the
    basket — behind the basket's front, so it goes IN — as the line's
    first socket fills. Sized by its own box (`cqi`), like the make demo:
    the basket is `BASKET_W` wide at the garden's right end, `DEMO_GAP`
    above it, so where its mouth is in the garden's % is known. */
const BASKET_W = 28;
const DEMO_GAP = 3;

function HarvestDemo({ garden, line }: { garden: Garden; line: { word: string; things: string; count: number } }) {
  const first = Math.max(0, garden.items.findIndex((item) => item.food === line.word));
  const [left, top, width, height] = garden.items[first].box;
  const [hl, ht, hw, hh] = garden.items[first].hit;
  const { basket, front } = garden;
  const [ml, mt, mw, mh] = basket.mouth;
  const basketH = (BASKET_W * basket.src.height) / basket.src.width;
  const gardenH = (100 * garden.ground.height) / garden.ground.width;
  const mouthX = 100 - BASKET_W + (BASKET_W * (ml + mw / 2)) / 100;
  const mouthY = ((-DEMO_GAP - basketH + (basketH * (mt + mh * 0.6)) / 100) / gardenH) * 100;
  const fly = {
    "--fly-x": `${((mouthX - (left + width / 2)) / width) * 100}%`,
    "--fly-y": `${((mouthY - (top + height / 2)) / height) * 100}%`,
  } as CSSProperties;
  return (
    <div dir="ltr" className="@container flex h-full w-full flex-col justify-center gap-[3cqi]">
      <div className="flex items-end justify-between">
        <span className="card card-clay-white -rotate-1 flex items-center gap-[3cqi] px-[5cqi] py-[2.5cqi]">
          <span className="whitespace-nowrap text-[9cqi] font-bold leading-none text-[var(--color-ink)]">{lineOf(line)}</span>
          <span className="flex gap-[1.5cqi]">
            {Array.from({ length: line.count }, (_, k) => (
              <span key={k} className="letter-slot h-[8cqi] w-[8cqi]" style={{ borderRadius: "999px" }}>
                {k === 0 && (
                  <span className="demo-tick absolute inset-0.5">
                    <Image src={garden.foods[line.word]} alt="" fill sizes="2rem" className="object-contain" />
                  </span>
                )}
              </span>
            ))}
          </span>
        </span>
        <span className="relative" style={{ width: `${BASKET_W}cqi`, aspectRatio: `${basket.src.width} / ${basket.src.height}` }}>
          <Image src={basket.src} alt="" fill sizes="6rem" className="object-contain" />
          <span className="absolute inset-0 z-[2]">
            <Image src={basket.rim} alt="" fill sizes="6rem" className="object-contain" />
          </span>
        </span>
      </div>
      <div className="relative w-full" style={{ aspectRatio: `${garden.ground.width} / ${garden.ground.height}` }}>
        <span className="absolute inset-0 overflow-hidden rounded-[1.1rem]">
          <Image src={garden.ground} alt="" fill sizes="20rem" className="object-cover" />
        </span>
        {garden.items.map(({ food, box, tilt }, i) => (
          <span
            key={i}
            className={`absolute z-[1] ${i === first ? "demo-fly" : ""}`}
            style={{ ...place(box), rotate: `${tilt}deg`, transformOrigin: "50% 0%", ...(i === first ? fly : {}) }}
          >
            <Image src={garden.foods[food]} alt="" fill sizes="3rem" className="object-contain" />
          </span>
        ))}
        {front && (
          <span className="absolute z-[2]" style={place(front.box)}>
            <Image src={front.src} alt="" fill sizes="20rem" />
          </span>
        )}
        <span className="absolute z-[4]" style={{ left: `${hl + hw / 2}%`, top: `${ht + hh / 2}%` }}>
          <Finger />
        </span>
      </div>
    </div>
  );
}

/** Make it spring: the island before the season; the finger taps the first
    spot and the first step (the grass, the snow) spreads from it. */
function ChangeDemo({ scene }: { scene: SeasonScene }) {
  const { frames, spots } = scene;
  const [x, y] = spots[0];
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="relative w-full" style={{ aspectRatio: frames[0].width / frames[0].height }}>
        <Image src={frames[0]} alt="" fill sizes="18rem" className="object-contain" />
        <Image src={frames[1]} alt="" fill sizes="18rem" className="demo-change object-contain" style={{ "--x": `${x}%`, "--y": `${y}%` } as CSSProperties} />
        <span className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
          <Finger />
        </span>
      </div>
    </div>
  );
}

/** Build the train: the engine and a numbered space per wagon on the
    rails, the wagons dealt under them as the board deals them; the finger
    taps the one that comes first and it flies up into the first space.
    Laid out in % of the square stage, the flight in `cqi` (the stage is
    square, so `cqi` is its height too); dealt wagons are the spaces' size,
    so the flown one lands exactly. */
function TrainDemo({ engine, wagons, seed }: { engine: StaticImageData; wagons: Wagon[]; seed: string }) {
  const order = shuffle(wagons.map((_, i) => i), seed);
  const { width, height } = wagons[0].src;
  const RAIL = 42;
  const ENGINE_W = 26;
  /* Each space (and each dealt wagon): its width, and its picture's height. */
  const slot = (88 - ENGINE_W) / wagons.length;
  const w = slot * 0.94;
  const h = (w * height) / width;
  const at = (j: number) => 50 - (wagons.length * slot) / 2 + j * slot;
  const first = order.indexOf(0);
  const fly = { "--fly-x": `${6 + ENGINE_W - at(first)}cqi`, "--fly-y": `${RAIL - h - 56}cqi` } as CSSProperties;
  return (
    <div dir="ltr" className="@container relative h-full w-full">
      <span className="absolute" style={{ left: "6%", width: `${ENGINE_W}%`, top: `${RAIL - (ENGINE_W * engine.height) / engine.width}%`, aspectRatio: `${engine.width} / ${engine.height}` }}>
        <Image src={engine} alt="" fill sizes="6rem" className="object-contain" />
      </span>
      {wagons.map((_, k) => (
        <span
          key={k}
          className="letter-slot absolute flex items-center justify-center text-lg font-bold text-[rgb(var(--shadow-hue)/0.28)]"
          style={{ left: `${6 + ENGINE_W + k * slot}%`, width: `${w}%`, top: `${RAIL - h * 0.62}%`, height: `${h * 0.58}%` }}
        >
          {k + 1}
        </span>
      ))}
      <span className="absolute h-[1.6%] rounded-full bg-[color-mix(in_srgb,var(--page-accent-color)_55%,var(--surface))]" style={{ left: "6%", width: "88%", top: `${RAIL}%` }} />
      {order.map((index, j) => (
        <span
          key={index}
          className={`absolute ${index === 0 ? "demo-fly z-[1]" : ""}`}
          style={{ left: `${at(j)}%`, width: `${w}%`, top: "56%", aspectRatio: `${width} / ${height}`, ...(index === 0 ? fly : {}) }}
        >
          <Image src={wagons[index].src} alt="" fill sizes="4rem" className="object-contain" />
        </span>
      ))}
      <span className="absolute" style={{ left: `${at(first) + w / 2}%`, top: `${56 + h * 0.6}%` }}>
        <Finger />
      </span>
    </div>
  );
}

/** The demo for one step, filling a square stage. */
export function TaskDemo({ demo }: { demo: TaskDemoDef }) {
  switch (demo.kind) {
    case "listen":
      return <ListenDemo face={demo.face} />;
    case "draw":
      return <DrawDemo shape={demo.shape} accent={demo.accent} />;
    case "build":
      return <BuildDemo word={demo.word} seed={demo.seed} />;
    case "find":
      return <FindDemo scene={demo.scene} target={demo.target} />;
    case "pick":
      return <PickDemo word={demo.word} plain={demo.plain} show={demo.show} options={demo.options} answer={demo.answer} />;
    case "sort":
      return <SortDemo item={demo.item} bins={demo.bins} />;
    case "paint":
      return <PaintDemo round={demo.round} pots={demo.pots} />;
    case "pop":
      return <PopDemo color={demo.color} others={demo.others} />;
    case "order":
      return <OrderDemo items={demo.items} seed={demo.seed} />;
    case "make":
      return <MakeDemo list={demo.list} stall={demo.stall} into={demo.into} seed={demo.seed} />;
    case "like":
      return <LikeDemo face={demo.face} />;
    case "fill":
      return <FillDemo word={demo.word} picture={demo.picture} />;
    case "harvest":
      return <HarvestDemo garden={demo.garden} line={demo.line} />;
    case "change":
      return <ChangeDemo scene={demo.scene} />;
    case "train":
      return <TrainDemo engine={demo.engine} wagons={demo.wagons} seed={demo.seed} />;
  }
}
