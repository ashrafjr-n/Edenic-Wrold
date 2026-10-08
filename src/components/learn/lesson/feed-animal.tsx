"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import Image, { type StaticImageData } from "next/image";
import { Heart } from "lucide-react";
import { Celebration } from "@/components/ui/celebration";
import { format } from "@/lib/format-dict";
import { lessonCue, playCue } from "@/lib/cue";
import { ClayWord } from "./clay-word";

/** Three bites, one after another. */
const BITES = 3;
/** A bite flying into the mouth. */
const FLY_MS = 560;
/** The last bite is eaten, then the step is solved. */
const DONE_MS = 800;
/** Below this the finger never really moved — a tap, not a drag. */
const DRAG_THRESHOLD = 8;

/* The scene, in % of its width (`cqi`): the animal `ANIMAL_W` wide in the
   middle at the top, its food in a row under it — `BITE` wide, each at its
   `BITE_AT` — and room below for the bites' shadows. */
const ANIMAL_W = 62;
const BITE = 22;
const BITE_AT = [11, 39, 67];
const GAP = 2;
const FLOOR = 3;

/* The scene's width, capped by the height a step has so it never pushes
   the page into a scroll (`--ratio` is its w/h). Phone and tablet: over
   the word; desktop: beside it. */
const SCENE_SIZE =
  "max-w-[min(100%,calc((100svh-26rem-min(2.5rem,4svh))*var(--ratio)))] sm:max-w-[min(32rem,calc((100svh-44rem)*var(--ratio)))] lg:max-w-[min(38rem,calc((var(--stage-h)-2rem)*var(--ratio)))]";

interface Drag {
  index: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  moved: boolean;
}

interface FeedAnimalProps {
  /** The animal, in English, and its picture. */
  word: string;
  picture: StaticImageData;
  /** One bite of what it eats. */
  food: StaticImageData;
  /** Where its mouth is, in % of its picture. */
  mouth: readonly [number, number];
  /** "Feed the {word}" — each bite's name for a screen reader. */
  biteAria: string;
  onSolved: () => void;
}

/**
 * Feed it: the lesson's animal, and three bites of its food on the floor
 * in front of it (a bone, a bottle of milk…). Drag a bite onto the animal,
 * or tap it, and it flies into the animal's mouth — it munches and a heart
 * floats up. Three eaten → its word is said and it jumps. Nothing can go
 * wrong: all the food is its own, so nothing is chosen (the one-thing
 * lesson rule); a bite let go anywhere else just goes back.
 */
export function FeedAnimal({ word, picture, food, mouth, biteAria, onSolved }: FeedAnimalProps) {
  const [eaten, setEaten] = useState<number[]>([]);
  const [drag, setDrag] = useState<Drag | null>(null);
  /* How many bites it has munched — each one's heart is keyed by it. */
  const [munches, setMunches] = useState(0);
  const animalRef = useRef<HTMLSpanElement>(null);
  const biteRefs = useRef<(HTMLSpanElement | null)[]>([]);
  /* What a tap reads — taps outrun renders. */
  const busy = useRef(false);
  const done = useRef<number[]>([]);
  /* A drag ends in a click on the same bite — that click is not a tap. */
  const dragged = useRef(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);
  const after = (ms: number, run: () => void) => {
    timers.current.push(window.setTimeout(run, ms));
  };

  const full = eaten.length === BITES;
  const animalH = (ANIMAL_W * picture.height) / picture.width;
  const ratio = 100 / (animalH + GAP + BITE + FLOOR);

  const springBack = (index: number, dx: number, dy: number) =>
    biteRefs.current[index]?.animate([{ translate: `${dx}px ${dy}px` }, { translate: "0px 0px" }], { duration: 260, easing: "ease-out" });

  /** Bite `index` is eaten: a tap on it, or a drop on the animal `offset`
      away from where it lay. */
  const eat = (index: number, offset = { dx: 0, dy: 0 }) => {
    if (busy.current || done.current.includes(index)) return;
    busy.current = true;
    const bite = biteRefs.current[index];
    const animal = animalRef.current;
    if (bite && animal) {
      /* Worked out from where the bite lies, not where the finger has it. */
      const from = bite.getBoundingClientRect();
      const to = animal.getBoundingClientRect();
      const x = to.left + (to.width * mouth[0]) / 100 - (from.left + from.width / 2 - offset.dx);
      const y = to.top + (to.height * mouth[1]) / 100 - (from.top + from.height / 2 - offset.dy);
      bite.animate(
        [
          { translate: `${offset.dx}px ${offset.dy}px`, scale: "1", opacity: 1 },
          { translate: `${x}px ${y}px`, scale: "0.35", opacity: 1, offset: 0.85 },
          { translate: `${x}px ${y}px`, scale: "0.2", opacity: 0 },
        ],
        { duration: FLY_MS, easing: "cubic-bezier(0.45, 0, 0.55, 1)", fill: "forwards" },
      );
    }
    after(FLY_MS, () => {
      done.current = [...done.current, index];
      setEaten(done.current);
      setMunches((count) => count + 1);
      /* Reduced motion: no munch — the heart and the bite going are enough. */
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        animal?.animate([{ scale: "1 1" }, { scale: "1.06 0.92" }, { scale: "0.97 1.04" }, { scale: "1 1" }], { duration: 420, easing: "ease-out" });
      }
      if (done.current.length < BITES) {
        busy.current = false;
        return;
      }
      void playCue(lessonCue.word(word));
      after(DONE_MS, onSolved);
    });
  };

  /* ---- Dragging a bite; a real drag ends on the animal or springs back ---- */
  const onPointerDown = (index: number) => (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (busy.current) return;
    dragged.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ index, x: event.clientX, y: event.clientY, dx: 0, dy: 0, moved: false });
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    setDrag({ ...drag, dx, dy, moved: drag.moved || Math.hypot(dx, dy) > DRAG_THRESHOLD });
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    const { index, dx, dy, moved } = drag;
    setDrag(null);
    /* A tap: the click that follows takes it. */
    if (!moved) return;
    dragged.current = true;
    window.setTimeout(() => (dragged.current = false), 0);
    const box = animalRef.current?.getBoundingClientRect();
    const over = box && event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom;
    if (over) eat(index, { dx, dy });
    else springBack(index, dx, dy);
  };

  return (
    <div className="card card-clay-white card-bare-lg flex w-full max-w-2xl flex-col items-center gap-3 px-3 py-4 sm:gap-5 sm:px-8 sm:py-6 lg:max-w-4xl lg:flex-row lg:justify-center lg:gap-12 lg:py-2 [@media(max-height:700px)]:gap-2 [@media(max-height:700px)]:py-3">
      <div className={`relative w-full [container-type:inline-size] ${SCENE_SIZE}`} style={{ aspectRatio: ratio, "--ratio": ratio } as CSSProperties}>
        <span
          ref={animalRef}
          className={`absolute block origin-bottom ${full ? "anim-jump" : ""}`}
          style={{ left: `${(100 - ANIMAL_W) / 2}cqi`, top: 0, width: `${ANIMAL_W}cqi`, height: `${animalH}cqi` }}
        >
          <Image src={picture} alt="" fill loading="eager" sizes="(min-width: 1024px) 24rem, 62vw" draggable={false} className="pointer-events-none select-none object-contain" />
        </span>

        {/* A heart for each bite, out of its mouth. */}
        {munches > 0 && (
          <span
            key={munches}
            aria-hidden
            className="feed-heart pointer-events-none absolute z-[4] block h-[11cqi] w-[11cqi] text-[var(--accent)]"
            style={{ left: `${(100 - ANIMAL_W) / 2 + (ANIMAL_W * mouth[0]) / 100}cqi`, top: `${(animalH * mouth[1]) / 100}cqi` }}
          >
            <Heart className="h-full w-full fill-current drop-shadow-sm" strokeWidth={1.5} />
          </span>
        )}

        {BITE_AT.map((left, index) => {
          const gone = eaten.includes(index);
          /* Where the finger has it, while it is being dragged. */
          const held = drag?.index === index && drag.moved ? drag : null;
          return (
            <span key={index} className="absolute block" style={{ left: `${left}cqi`, top: `${animalH + GAP}cqi`, width: `${BITE}cqi`, height: `${BITE}cqi` }}>
              {/* Its shadow on the floor: it stays when the bite is eaten. */}
              <span
                aria-hidden
                className={`absolute -bottom-[2cqi] left-[12%] h-[5cqi] w-[76%] rounded-[50%] bg-[radial-gradient(closest-side,rgb(var(--shadow-hue)/0.28),transparent)] transition-opacity duration-300 ${gone ? "opacity-0" : ""}`}
              />
              {!gone && (
                <button
                  type="button"
                  aria-label={format(biteAria, { word })}
                  onClick={() => {
                    if (!dragged.current) eat(index);
                  }}
                  onPointerDown={onPointerDown(index)}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={() => setDrag(null)}
                  /* `touch-action: none` or a drag scrolls the page instead. */
                  className={`absolute inset-0 block touch-none select-none rounded-[30%] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[var(--page-accent-color)] ${
                    held ? "z-20 cursor-grabbing" : "cursor-grab"
                  }`}
                >
                  {/* Until the first bite is eaten, the first one glows. */}
                  <span className={`block h-full w-full ${eaten.length === 0 && index === 0 && !held ? "guide-target" : ""}`}>
                    <span
                      ref={(el) => {
                        biteRefs.current[index] = el;
                      }}
                      className="pointer-events-none relative block h-full w-full"
                      style={held ? { translate: `${held.dx}px ${held.dy}px`, scale: "1.1" } : undefined}
                    >
                      <Image src={food} alt="" fill loading="eager" sizes="(min-width: 1024px) 8rem, 22vw" draggable={false} className="object-contain" />
                    </span>
                  </span>
                </button>
              )}
            </span>
          );
        })}

        {full && <Celebration />}
      </div>

      {/* English in every locale: never mirrored. No speaker — the word card
          is where it is heard. */}
      <div dir="ltr" className={`flex items-center justify-center lg:shrink-0 ${full ? "anim-jump" : ""}`}>
        <ClayWord word={word} size="sm" />
      </div>
    </div>
  );
}
