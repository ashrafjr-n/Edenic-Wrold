"use client";

import { useEffect, useEffectEvent, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent, Ref } from "react";
import Image, { type StaticImageData } from "next/image";
import { shuffle } from "@/lib/seeded";
import { format } from "@/lib/format-dict";
import { Celebration } from "@/components/ui/celebration";
import { ClayWord, letterTones, type LetterTone } from "./clay-word";

/** Below this the finger never really moved — a tap, not a drag. */
const DRAG_THRESHOLD = 8;
/** How long a letter takes to fly to its new place. */
const FLY_MS = 340;
/** The gap between letters Help puts in, one after another. */
const HELP_STEP_MS = 420;
/** How long misplaced letters shake before they fly home — `.anim-wiggle`'s
    0.5s plus a beat. */
const WIGGLE_MS = 650;

export interface SpellWordHandle {
  /** Send every misplaced letter back, then put the word together in order. */
  help: () => void;
  /** Send every placed letter home — a clean board to start again from. */
  reset: () => void;
}

interface SpellWordProps {
  word: string;
  /** One tone for the word's letters on top — a color word in its color. */
  tone?: LetterTone;
  /** Shown INSTEAD of the word: spell it from the picture alone. */
  picture?: StaticImageData;
  /** Deals the letters — the same seed gives the same order on the server. */
  seed: string;
  /** "Letter {letter}", for each tile's screen-reader name. */
  letterAria: string;
  /** Glow the first letter until one is placed — Pinki showing how. */
  hint: boolean;
  onSolved: () => void;
  /** Every space is full and the word is not right yet. The misplaced
      letters then fly home by themselves, and the child tries again. */
  onMiss: () => void;
  /** Whether any letter is in a space — the lesson offers "Start over" then. */
  onStarted: (started: boolean) => void;
  ref?: Ref<SpellWordHandle>;
}

/** Which tile sits in each space (or each cell of the tray below);
    `null` is an empty one. */
type Slots = (number | null)[];

/** Where a drag can end: a space of the word, a cell of the tray, or
    "home" — the tray cell the letter started in. */
type Target = { zone: "slot" | "tray"; i: number } | { zone: "home" };

interface Drag {
  id: number;
  startX: number;
  startY: number;
  dx: number;
  dy: number;
  moved: boolean;
}

/** The letters in a seeded order that never already spells the word. */
export function deal(word: string, seed: string): string[] {
  const letters = shuffle([...word], seed);
  return letters.join("") === word ? [...letters.slice(1), letters[0]] : letters;
}

/**
 * Build the word: the word in clay letters on top, a row of empty spaces, and
 * its letters shuffled underneath.
 *
 * - **Tap** a letter and it flies to the first empty space; tap a placed
 *   letter and it flies home again.
 * - **Drag** a letter and it can go in ANY space. A space that is taken swaps
 *   (or sends its letter home, if the dragged one came from below). A letter
 *   dragged out of the word goes back below — to the cell it came from, or
 *   any other empty one; below, letters can also be rearranged. A drop
 *   anywhere else springs back.
 * - **Type** it, on a keyboard: a letter key taps the first tile in the tray
 *   with that letter, Backspace taps the one in the last filled space.
 *
 * Nothing is judged until every space is full: then a right word jumps, and a
 * wrong one shakes the misplaced letters (never a word like "wrong") and sends
 * them home — the right ones stay — so the child can try again as often as
 * they like. From the second miss the lesson also offers Help, which comes in
 * through the ref; it is never required.
 *
 * Every move — tap, drop, spring-back, Help — animates the same way: a FLIP.
 * The rects of all tiles are snapshotted before the state changes, and after
 * the re-render each tile that moved is played from its old spot to its new
 * one with the Web Animations API on `translate`, so tiles in the tray and
 * tiles in a space are just rendered where they are.
 */
export function SpellWord({ word, tone, picture, seed, letterAria, hint, onSolved, onMiss, onStarted, ref }: SpellWordProps) {
  const [dealt] = useState(() => deal(word, seed));
  const [slots, setSlots] = useState<Slots>(() => Array(word.length).fill(null));
  /* The tray's cells: tile `i` starts in cell `i`; a letter may be put back
     in any empty cell. */
  const [tray, setTray] = useState<Slots>(() => Array.from({ length: word.length }, (_, i) => i));
  const [drag, setDrag] = useState<Drag | null>(null);
  const [wrong, setWrong] = useState<number[]>([]);
  const [shake, setShake] = useState(0);
  const [solved, setSolved] = useState(false);
  const [helping, setHelping] = useState(false);
  const [returning, setReturning] = useState(false);

  const tileEls = useRef(new Map<number, HTMLButtonElement>());
  const slotEls = useRef<(HTMLDivElement | null)[]>([]);
  const cellEls = useRef<(HTMLSpanElement | null)[]>([]);
  /* The drag, mirrored in a ref: pointer moves arrive faster than React
     renders, and a drop must see where the finger really is and whether it
     really moved — not the last render's idea of it. */
  const dragRef = useRef<Drag | null>(null);
  const before = useRef<Map<number, DOMRect> | null>(null);
  const dragged = useRef(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const tones = letterTones(word);
  const toneOf = (letter: string) => tones[word.indexOf(letter)];
  const locked = solved || helping || returning;

  /* ---- The FLIP ---- */
  const snapshot = () => {
    const rects = new Map<number, DOMRect>();
    tileEls.current.forEach((el, id) => rects.set(id, el.getBoundingClientRect()));
    before.current = rects;
  };

  useLayoutEffect(() => {
    const rects = before.current;
    if (!rects) return;
    before.current = null;
    tileEls.current.forEach((el, id) => {
      const from = rects.get(id);
      if (!from) return;
      const to = el.getBoundingClientRect();
      const dx = from.left - to.left;
      const dy = from.top - to.top;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
      el.animate([{ translate: `${dx}px ${dy}px` }, { translate: "0px 0px" }], {
        duration: FLY_MS,
        easing: "cubic-bezier(0.34, 1.25, 0.5, 1)",
      });
    });
  }, [slots, tray, drag]);

  /* ---- Moves ---- */
  /** Every change of the spaces and the tray goes through here, animated. */
  const fill = (nextSlots: Slots, nextTray: Slots) => {
    snapshot();
    setSlots(nextSlots);
    setTray(nextTray);
    onStarted(nextSlots.some((id) => id !== null));
  };

  /** Put `ids` back in the tray: each in its own first cell, or the first
      empty one. */
  const sendHome = (cells: Slots, ids: number[]): Slots => {
    const next = [...cells];
    for (const id of ids) next[next[id] === null ? id : next.indexOf(null)] = id;
    return next;
  };

  /** Judge the word once every space is full. */
  const place = (nextSlots: Slots, nextTray: Slots) => {
    fill(nextSlots, nextTray);
    if (nextSlots.some((id) => id === null)) {
      setWrong([]);
      return;
    }
    const misplaced = nextSlots.flatMap((id, i) => (dealt[id as number] === word[i] ? [] : [i]));
    if (misplaced.length === 0) {
      setWrong([]);
      setSolved(true);
      onSolved();
    } else {
      setWrong(misplaced);
      setShake((value) => value + 1);
      setReturning(true);
      onMiss();
      timers.current.push(
        window.setTimeout(() => {
          fill(
            nextSlots.map((id, i) => (misplaced.includes(i) ? null : id)),
            sendHome(nextTray, misplaced.map((i) => nextSlots[i] as number)),
          );
          setWrong([]);
          setReturning(false);
        }, WIGGLE_MS),
      );
    }
  };

  /** `id` to `target`. A taken space or cell swaps with the dragged letter
      (from the tray, the letter it displaces takes the cell left free). */
  const moveTo = (id: number, target: Target) => {
    const nextSlots = [...slots];
    const nextTray = [...tray];
    const fromSlot = nextSlots.indexOf(id);
    const fromCell = nextTray.indexOf(id);
    if (fromSlot !== -1) nextSlots[fromSlot] = null;
    if (fromCell !== -1) nextTray[fromCell] = null;
    const home = () => (nextTray[id] === null ? id : nextTray.indexOf(null));

    if (target.zone === "slot") {
      const displaced = nextSlots[target.i];
      nextSlots[target.i] = id;
      if (displaced !== null) {
        if (fromSlot !== -1) nextSlots[fromSlot] = displaced;
        else nextTray[fromCell] = displaced;
      }
    } else if (target.zone === "tray") {
      const occupant = nextTray[target.i];
      if (occupant === null) nextTray[target.i] = id;
      else if (fromCell !== -1) {
        nextTray[fromCell] = occupant;
        nextTray[target.i] = id;
      } else nextTray[home()] = id;
    } else {
      nextTray[home()] = id;
    }
    place(nextSlots, nextTray);
  };

  const tap = (id: number) => {
    if (locked) return;
    if (slots.includes(id)) {
      moveTo(id, { zone: "home" });
      return;
    }
    const empty = slots.indexOf(null);
    if (empty !== -1) moveTo(id, { zone: "slot", i: empty });
  };

  /** What is under the finger: the nearest space or tray cell, if it is
      close enough. */
  const targetAt = (x: number, y: number): Target | null => {
    let best: Target | null = null;
    let bestDistance = Infinity;
    const look = (els: (HTMLElement | null)[], zone: "slot" | "tray") =>
      els.forEach((el, i) => {
        if (!el) return;
        const box = el.getBoundingClientRect();
        const distance = Math.hypot(x - (box.left + box.width / 2), y - (box.top + box.height / 2));
        if (distance < Math.max(box.width, 40) && distance < bestDistance) {
          best = { zone, i };
          bestDistance = distance;
        }
      });
    look(slotEls.current, "slot");
    look(cellEls.current, "tray");
    return best;
  };

  /* ---- Pointer: a tap is left to `onClick` (so Enter and Space work too);
     a real drag suppresses that click. ---- */
  const onPointerDown = (event: ReactPointerEvent<HTMLButtonElement>, id: number) => {
    dragged.current = false;
    if (locked) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { id, startX: event.clientX, startY: event.clientY, dx: 0, dy: 0, moved: false };
    setDrag(dragRef.current);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLButtonElement>, id: number) => {
    const current = dragRef.current;
    if (current?.id !== id) return;
    const dx = event.clientX - current.startX;
    const dy = event.clientY - current.startY;
    dragRef.current = { ...current, dx, dy, moved: current.moved || Math.hypot(dx, dy) > DRAG_THRESHOLD };
    setDrag(dragRef.current);
  };

  const endDrag = () => {
    dragRef.current = null;
    setDrag(null);
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLButtonElement>, id: number) => {
    const current = dragRef.current;
    if (current?.id !== id) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (!current.moved) {
      endDrag();
      return;
    }
    dragged.current = true;
    const to = targetAt(event.clientX, event.clientY);
    /* Snapshot WITH the drag offset still applied, so the tile flies on from
       where the finger let go — into its space, or back where it was. */
    if (to === null) snapshot();
    else moveTo(id, to);
    endDrag();
  };

  const onClick = (id: number) => {
    if (dragged.current) {
      dragged.current = false;
      return;
    }
    tap(id);
  };

  /* ---- Keyboard (a desktop): typing a letter taps the first tile in the
     tray that carries it — the same move as clicking it. ---- */
  const onKey = useEffectEvent((event: KeyboardEvent) => {
    if (locked || event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
    /* Not while the task popup is open over the board. */
    if (document.querySelector("dialog[open]")) return;
    /* Backspace sends the letter in the last filled space back home. */
    if (event.key === "Backspace") {
      const last = slots.findLast((tile) => tile !== null);
      if (last === undefined || last === null) return;
      event.preventDefault();
      tap(last);
      return;
    }
    const letter = event.key.toLowerCase();
    const id = dealt.findIndex((candidate, tile) => candidate === letter && !slots.includes(tile));
    if (id === -1) return;
    event.preventDefault();
    tap(id);
  });

  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ---- Help ---- */
  useImperativeHandle(ref, () => ({
    reset: () => {
      if (!locked)
        fill(
          Array(word.length).fill(null),
          Array.from({ length: word.length }, (_, i) => i),
        );
    },
    help: () => {
      if (locked) return;
      setHelping(true);
      setWrong([]);

      /* Right letters stay; the rest go home first. */
      const kept: Slots = slots.map((id, i) => (id !== null && dealt[id] === word[i] ? id : null));
      const keptIds = kept.filter((id): id is number => id !== null);
      const used = new Set(keptIds);
      const steps: Slots[] = [];
      let state = kept;
      kept.forEach((id, i) => {
        if (id !== null) return;
        const pick = dealt.findIndex((letter, tile) => letter === word[i] && !used.has(tile));
        used.add(pick);
        state = state.map((value, j) => (j === i ? pick : value));
        steps.push(state);
      });

      /* Everything not kept is in the tray, each where it can go. */
      const trayNow = sendHome(
        tray,
        dealt.flatMap((_, id) => (slots.includes(id) && !keptIds.includes(id) ? [id] : [])),
      );
      snapshot();
      setSlots(kept);
      setTray(trayNow);
      steps.forEach((step, k) => {
        timers.current.push(
          window.setTimeout(() => {
            snapshot();
            setSlots(step);
            setTray(trayNow.map((id) => (id !== null && step.includes(id) ? null : id)));
            if (k === steps.length - 1) {
              setSolved(true);
              onSolved();
            }
          }, HELP_STEP_MS * (k + 1)),
        );
      });
      if (steps.length === 0) {
        setSolved(true);
        onSolved();
      }
    },
  }));

  /* ---- Render ---- */
  const tileFor = (id: number, inSpace: number | null) => {
    const letter = dealt[id];
    const tone = toneOf(letter);
    const isDragging = drag?.id === id && drag.moved;
    const shaking = inSpace !== null && wrong.includes(inSpace);

    return (
      <button
        key={`${id}.${inSpace === null ? "tray" : shake}`}
        ref={(el) => {
          if (el) tileEls.current.set(id, el);
          else if (tileEls.current.get(id)?.isConnected === false) tileEls.current.delete(id);
        }}
        type="button"
        aria-label={format(letterAria, { letter })}
        onClick={() => onClick(id)}
        onPointerDown={(event) => onPointerDown(event, id)}
        onPointerMove={(event) => onPointerMove(event, id)}
        onPointerUp={(event) => onPointerUp(event, id)}
        onPointerCancel={endDrag}
        /* `touch-action: none` or a drag scrolls the page instead. */
        className={`clay flex h-full w-full touch-none select-none items-center justify-center rounded-[28%] pb-[6%] text-[length:62cqi] font-bold leading-none text-white focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[var(--page-accent-color)] ${
          isDragging ? "relative z-10 cursor-grabbing" : locked ? "cursor-default" : "cursor-grab hover:brightness-105"
        } ${shaking ? "anim-wiggle" : ""} ${solved && inSpace !== null ? "anim-jump" : ""}`}
        style={
          {
            backgroundColor: tone.face,
            "--clay-edge": tone.edge,
            textShadow: `0 0.06em 0 ${tone.edge}`,
            ...(isDragging ? { translate: `${drag.dx}px ${drag.dy}px`, scale: "1.12" } : {}),
            ...(solved && inSpace !== null ? { animationDelay: `${inSpace * 0.07}s` } : {}),
          } as CSSProperties
        }
      >
        {letter}
      </button>
    );
  };

  const firstLetterTile = dealt.indexOf(word[0]);
  const showHint = hint && slots.every((id) => id === null) && !drag;

  return (
    <div dir="ltr" className="flex w-full flex-col items-center gap-3 sm:gap-7 lg:gap-[min(2.25rem,4svh)]">
      {picture ? (
        <span className="anim-pop-in relative block h-[min(7rem,13svh)] w-[min(7rem,13svh)] lg:h-[min(9rem,15svh)] lg:w-[min(9rem,15svh)]">
          <Image src={picture} alt="" fill preload sizes="(min-width: 1024px) 9rem, 7rem" className="object-contain" />
        </span>
      ) : (
        <ClayWord word={word} size="md" tone={tone} />
      )}

      <div className="card card-clay-white card-bare-lg relative w-full max-w-xl px-3 py-3 sm:px-6 sm:py-6 lg:px-5 lg:py-5">
        <div
          className="grid justify-center gap-1.5 sm:gap-2.5"
          style={{ gridTemplateColumns: `repeat(${word.length}, minmax(0, 4.5rem))` }}
        >
          {slots.map((id, i) => (
            <div
              key={i}
              ref={(el) => {
                slotEls.current[i] = el;
              }}
              className="letter-slot @container aspect-square"
            >
              {id !== null && tileFor(id, i)}
            </div>
          ))}
        </div>
        {solved && <Celebration />}
      </div>

      {/* Desktop: the tray is a grid with the SAME columns as the spaces
          above it (the columns only apply once it is a grid), so the letters
          sit in one row, each under a space, however long the word. */}
      <div
        className="flex max-w-xl flex-wrap justify-center gap-2 sm:gap-3 lg:grid lg:w-full lg:gap-2.5 lg:px-5"
        style={{ gridTemplateColumns: `repeat(${word.length}, minmax(0, 4.5rem))` }}
      >
        {tray.map((id, cell) => (
          <span
            key={cell}
            ref={(el) => {
              cellEls.current[cell] = el;
            }}
            className={`@container relative block h-[3.25rem] w-[3.25rem] sm:h-[4.5rem] sm:w-[4.5rem] lg:aspect-square lg:h-auto lg:w-full ${
              showHint && id === firstLetterTile ? "guide-target" : ""
            }`}
          >
            {id !== null ? (
              tileFor(id, null)
            ) : (
              <span className="letter-gap block h-full w-full rounded-[28%] border-2 border-dashed border-[color-mix(in_srgb,var(--color-ink-soft)_30%,transparent)]" />
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
