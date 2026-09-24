import { letterItems } from "@/data/letter-items";
import { BUILD_WORDS } from "@/data/letter-build-words";
import type { LetterId, LetterNode, LetterWord } from "@/types/letter-item";

/** A word, and the letter it was taught with. */
export interface OwnedWord extends LetterWord {
  letter: LetterId;
}

export interface Bubble {
  letter: LetterId;
  capital: boolean;
}

/**
 * One exercise in a Letters session. A session is a LIST of these, built by
 * `sessionFor` from a library of exercise kinds — not a fixed run of stages —
 * so a letter's session can mix in review of what came before, and a word
 * exercise appears only once the child has the letters to spell it.
 */
export type LetterStep =
  | { kind: "watch"; letter: LetterId }
  | { kind: "meet"; letter: LetterId }
  | { kind: "trace"; letter: LetterId; capital: boolean }
  | { kind: "sound-pick"; letter: LetterId; choices: OwnedWord[] }
  | { kind: "match"; letters: LetterId[]; smallOrder: LetterId[] }
  /** `bigOnly`: the targets are the CAPITAL letter and the decoys are its
      small form — the first letter's version, when there is no other
      learned letter to use as a decoy. */
  | { kind: "bubbles"; letter: LetterId; bubbles: Bubble[]; bigOnly: boolean }
  | { kind: "build"; word: LetterWord; tiles: string[] }
  | { kind: "find"; letter: LetterId; choices: LetterId[] };

/* ---------------------------------------------------------------
   Seeded shuffling. Sessions render on the server first, so nothing here
   may use `Math.random()` — the same seed gives the same session on the
   server and the client. The seed is the node id plus the child's own
   progress, so a replay after more letters are learned deals differently.
   --------------------------------------------------------------- */

function hash(text: string): number {
  let value = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    value ^= text.charCodeAt(i);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

/** mulberry32 — a tiny, well-mixed PRNG for dealing cards, not for crypto. */
function random(seed: string): () => number {
  let state = hash(seed);
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: readonly T[], rand: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/* Letters that make the same first sound in these words. A decoy picture
   must never start with the answer's sound, or two answers are right. */
const SAME_SOUND: readonly (readonly LetterId[])[] = [["c", "k", "q"]];

function soundsAlike(a: LetterId, b: LetterId): boolean {
  return a === b || SAME_SOUND.some((group) => group.includes(a) && group.includes(b));
}

const wordsOf = (letter: LetterId): OwnedWord[] =>
  (letterItems.find((item) => item.id === letter)?.words ?? []).map((word) => ({
    ...word,
    letter,
  }));

const ALL_WORDS: OwnedWord[] = letterItems.flatMap((item) => wordsOf(item.id));

function soundPick(letter: LetterId, rand: () => number): LetterStep {
  const own = wordsOf(letter);
  const answer = own[Math.floor(rand() * own.length)];
  const decoys = shuffle(
    ALL_WORDS.filter((word) => !soundsAlike(word.letter, letter)),
    rand,
  ).slice(0, 3);
  return { kind: "sound-pick", letter, choices: shuffle([answer, ...decoys], rand) };
}

function match(letters: LetterId[], rand: () => number): LetterStep {
  return { kind: "match", letters, smallOrder: shuffle(letters, rand) };
}

const BUBBLE_COUNT = 9;
const BUBBLE_TARGETS = 4;

/**
 * **Decoys come only from letters the child has already learned** (plus the
 * letter itself) — a child on A has never met B, so B cannot be the thing
 * they tell A apart from. With nothing learned yet, the game becomes "pop
 * every BIG A" among small a's: the one other shape the child does know.
 */
function bubbles(letter: LetterId, learned: LetterId[], rand: () => number): LetterStep {
  const others = learned.filter((id) => id !== letter);
  const bigOnly = others.length === 0;

  const targets: Bubble[] = Array.from({ length: BUBBLE_TARGETS }, (_, i) => ({
    letter,
    capital: bigOnly || i % 2 === 0,
  }));
  const decoys: Bubble[] = Array.from({ length: BUBBLE_COUNT - BUBBLE_TARGETS }, (_, i) =>
    bigOnly
      ? { letter, capital: false }
      : { letter: others[Math.floor(rand() * others.length)], capital: i % 2 === 1 },
  );
  return { kind: "bubbles", letter, bubbles: shuffle([...targets, ...decoys], rand), bigOnly };
}

/** Find the letter among up to three LEARNED letters; none learned, no game. */
function find(letter: LetterId, learned: LetterId[], rand: () => number): LetterStep | undefined {
  const decoys = shuffle(learned.filter((id) => id !== letter), rand).slice(0, 3);
  if (decoys.length === 0) return undefined;
  return { kind: "find", letter, choices: shuffle([letter, ...decoys], rand) };
}

/** A spelling word the child has every letter for, or none. `must` limits it
    to words using one of those letters, so a session practises its own. */
function build(
  known: ReadonlySet<LetterId>,
  must: readonly LetterId[],
  rand: () => number,
): LetterStep | undefined {
  const candidates = BUILD_WORDS.filter(
    ({ word }) =>
      [...word].every((ch) => known.has(ch as LetterId)) &&
      must.some((letter) => word.includes(letter)),
  );
  if (candidates.length === 0) return undefined;

  const word = candidates[Math.floor(rand() * candidates.length)];
  const spare = shuffle(
    [...known].filter((letter) => !word.word.includes(letter)),
    rand,
  ).slice(0, 2);
  return { kind: "build", word, tiles: shuffle([...word.word, ...spare], rand) };
}

interface SessionProgress {
  /** Letters the child has finished, in A–Z order. */
  known: LetterId[];
  /** Finished letters that did not go smoothly (fewer than 3 stars) — the
      ones a later session quietly brings back. */
  shaky: LetterId[];
  /** Which replay this is — "Again" deals a fresh session, not the same one. */
  round?: number;
}

/**
 * The exercises for one map node.
 *
 * A letter: meet it, write it big, hear it in a word, write it small, pop
 * it among the letters already learned, then spell a word with it once that
 * is possible (or find it, or hear it once more), and review a shaky earlier
 * letter. The reel leads when there is one. **Only learned letters ever
 * appear beside it** — nothing from later in the alphabet. Matching big to
 * small across several letters is a CHALLENGE exercise only.
 *
 * A checkpoint: the whole unit, mixed — no new teaching, only finding,
 * hearing, matching and spelling what the unit taught.
 */
export function sessionFor(node: LetterNode, progress: SessionProgress): LetterStep[] {
  const rand = random(`${node.id}:${progress.known.join("")}:${progress.round ?? 0}`);

  if (node.kind === "letter") {
    const letter = node.id;
    const item = letterItems.find((entry) => entry.id === letter);
    const known = new Set<LetterId>([...progress.known, letter]);
    const learned = progress.known.filter((id) => id !== letter);
    const review = progress.shaky.find((id) => id !== letter);
    const spell = build(known, [letter], rand);

    const steps: (LetterStep | undefined)[] = [
      item?.video ? { kind: "watch", letter } : undefined,
      { kind: "meet", letter },
      { kind: "trace", letter, capital: true },
      soundPick(letter, rand),
      { kind: "trace", letter, capital: false },
      bubbles(letter, learned, rand),
      spell ?? find(letter, learned, rand) ?? soundPick(letter, rand),
      review ? soundPick(review, rand) : undefined,
    ];
    return steps.filter((step): step is LetterStep => step !== undefined);
  }

  const unitLetters = letterItems
    .filter((item) => item.unit === node.unit)
    .map((item) => item.id);
  const known = new Set<LetterId>([...progress.known, ...unitLetters]);
  const [first, second, third] = shuffle(unitLetters, rand);
  const spell = build(known, unitLetters, rand);

  const steps: (LetterStep | undefined)[] = [
    soundPick(first, rand),
    find(second, unitLetters, rand),
    match(shuffle(unitLetters, rand).slice(0, 4), rand),
    bubbles(third, unitLetters, rand),
    soundPick(second, rand),
    spell ?? find(first, unitLetters, rand),
  ];
  return steps.filter((step): step is LetterStep => step !== undefined);
}
