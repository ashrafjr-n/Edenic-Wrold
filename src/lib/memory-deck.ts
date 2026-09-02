import type { MemoryLevel } from "@/types/memory";

/** One card on the board: which picture it wears, and a key that stays with
    it for React's sake even though two cards share a face. */
export interface MemoryCard {
  /** Unique per card — `apple#0`, `apple#1`. */
  key: string;
  faceId: string;
}

/**
 * A deterministic 0–1 generator.
 *
 * `Math.imul` keeps every step in exact 32-bit integer arithmetic, so the
 * same seed deals the same board in every engine — which matters here for the
 * same reason it matters to the puzzle's tray scatter and `Celebration`'s
 * confetti: **the board renders on the server too**, and `Math.random()`
 * would lay it out one way there and another way on hydration.
 *
 * Unlike those, this one has to produce a SEQUENCE (a shuffle needs a fresh
 * number per swap), so it returns a generator rather than a single value.
 */
function rng(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * The level's deck, shuffled: two cards per face, dealt into one array.
 *
 * `round` is what lets "Again" re-deal. It starts at 0, which is what the
 * server renders and what the client's first render agrees on; only pressing
 * Again moves it, and by then hydration is long done. So the board is
 * SSR-safe and still different every time a child replays it — a memory game
 * whose layout never moved would be memorised rather than played.
 */
export function deckFor(level: MemoryLevel, round: number): MemoryCard[] {
  const cards: MemoryCard[] = level.faces.flatMap((faceId) => [
    { key: `${faceId}#0`, faceId },
    { key: `${faceId}#1`, faceId },
  ]);

  /* Fisher–Yates, back to front, off the seeded generator. */
  const next = rng(level.value * 7919 + round * 104729);
  for (let i = cards.length - 1; i > 0; i -= 1) {
    const j = Math.floor(next() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  return cards;
}

/** `32s` — what the header counts down. Clamped at zero, where it simply
    stops mattering rather than stopping the game. */
export function secondsLeft(level: MemoryLevel, elapsed: number): number {
  return Math.max(0, level.seconds - elapsed);
}
