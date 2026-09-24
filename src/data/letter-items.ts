import type { StaticImageData } from "next/image";
import type { LetterId, LetterItem, LetterNode, LetterWord } from "@/types/letter-item";
import { LETTER_IDS } from "@/types/letter-item";
import { capitalStrokes, smallStrokes } from "./letter-strokes";
import applePicture from "../../public/assets/icons/apple.png";
import ballPicture from "../../public/assets/icons/ball.png";
import carPicture from "../../public/assets/icons/car-toy.png";
import catPicture from "../../public/assets/icons/cat.png";
import dogPicture from "../../public/assets/icons/dog.png";
import rabbitPicture from "../../public/assets/icons/rabbit.png";
import starPicture from "../../public/assets/icons/yellow-star.png";
import capitalA from "../../public/assets/learn-with-pinki/learn-letters/letters/capital/a.png";
import capitalB from "../../public/assets/learn-with-pinki/learn-letters/letters/capital/b.png";
import capitalC from "../../public/assets/learn-with-pinki/learn-letters/letters/capital/c.png";
import capitalD from "../../public/assets/learn-with-pinki/learn-letters/letters/capital/d.png";
import capitalE from "../../public/assets/learn-with-pinki/learn-letters/letters/capital/e.png";
import capitalF from "../../public/assets/learn-with-pinki/learn-letters/letters/capital/f.png";
import capitalG from "../../public/assets/learn-with-pinki/learn-letters/letters/capital/g.png";
import capitalH from "../../public/assets/learn-with-pinki/learn-letters/letters/capital/h.png";
import capitalI from "../../public/assets/learn-with-pinki/learn-letters/letters/capital/i.png";
import capitalJ from "../../public/assets/learn-with-pinki/learn-letters/letters/capital/j.png";
import capitalK from "../../public/assets/learn-with-pinki/learn-letters/letters/capital/k.png";
import capitalL from "../../public/assets/learn-with-pinki/learn-letters/letters/capital/l.png";
import capitalM from "../../public/assets/learn-with-pinki/learn-letters/letters/capital/m.png";
import capitalN from "../../public/assets/learn-with-pinki/learn-letters/letters/capital/n.png";
import capitalO from "../../public/assets/learn-with-pinki/learn-letters/letters/capital/o.png";
import capitalP from "../../public/assets/learn-with-pinki/learn-letters/letters/capital/p.png";
import capitalQ from "../../public/assets/learn-with-pinki/learn-letters/letters/capital/q.png";
import capitalR from "../../public/assets/learn-with-pinki/learn-letters/letters/capital/r.png";
import capitalS from "../../public/assets/learn-with-pinki/learn-letters/letters/capital/s.png";
import capitalT from "../../public/assets/learn-with-pinki/learn-letters/letters/capital/t.png";
import capitalU from "../../public/assets/learn-with-pinki/learn-letters/letters/capital/u.png";
import capitalV from "../../public/assets/learn-with-pinki/learn-letters/letters/capital/v.png";
import capitalW from "../../public/assets/learn-with-pinki/learn-letters/letters/capital/w.png";
import capitalX from "../../public/assets/learn-with-pinki/learn-letters/letters/capital/x.png";
import capitalY from "../../public/assets/learn-with-pinki/learn-letters/letters/capital/y.png";
import capitalZ from "../../public/assets/learn-with-pinki/learn-letters/letters/capital/z.png";
import smallA from "../../public/assets/learn-with-pinki/learn-letters/letters/small/a.png";
import smallB from "../../public/assets/learn-with-pinki/learn-letters/letters/small/b.png";
import smallC from "../../public/assets/learn-with-pinki/learn-letters/letters/small/c.png";
import smallD from "../../public/assets/learn-with-pinki/learn-letters/letters/small/d.png";
import smallE from "../../public/assets/learn-with-pinki/learn-letters/letters/small/e.png";
import smallF from "../../public/assets/learn-with-pinki/learn-letters/letters/small/f.png";
import smallG from "../../public/assets/learn-with-pinki/learn-letters/letters/small/g.png";
import smallH from "../../public/assets/learn-with-pinki/learn-letters/letters/small/h.png";
import smallI from "../../public/assets/learn-with-pinki/learn-letters/letters/small/i.png";
import smallJ from "../../public/assets/learn-with-pinki/learn-letters/letters/small/j.png";
import smallK from "../../public/assets/learn-with-pinki/learn-letters/letters/small/k.png";
import smallL from "../../public/assets/learn-with-pinki/learn-letters/letters/small/l.png";
import smallM from "../../public/assets/learn-with-pinki/learn-letters/letters/small/m.png";
import smallN from "../../public/assets/learn-with-pinki/learn-letters/letters/small/n.png";
import smallO from "../../public/assets/learn-with-pinki/learn-letters/letters/small/o.png";
import smallP from "../../public/assets/learn-with-pinki/learn-letters/letters/small/p.png";
import smallQ from "../../public/assets/learn-with-pinki/learn-letters/letters/small/q.png";
import smallR from "../../public/assets/learn-with-pinki/learn-letters/letters/small/r.png";
import smallS from "../../public/assets/learn-with-pinki/learn-letters/letters/small/s.png";
import smallT from "../../public/assets/learn-with-pinki/learn-letters/letters/small/t.png";
import smallU from "../../public/assets/learn-with-pinki/learn-letters/letters/small/u.png";
import smallV from "../../public/assets/learn-with-pinki/learn-letters/letters/small/v.png";
import smallW from "../../public/assets/learn-with-pinki/learn-letters/letters/small/w.png";
import smallX from "../../public/assets/learn-with-pinki/learn-letters/letters/small/x.png";
import smallY from "../../public/assets/learn-with-pinki/learn-letters/letters/small/y.png";
import smallZ from "../../public/assets/learn-with-pinki/learn-letters/letters/small/z.png";

interface LetterEntry {
  unit: number;
  capital: StaticImageData;
  small: StaticImageData;
  words: readonly LetterWord[];
}

/* The clay letters were cut out of two sheets (`letters/letters-capital.jpeg`
   and `letters-small.jpeg`) and un-matted — see `claude-docs/letters-lesson.md`.

   Pictures: a word with a clay render in `assets/icons` shows it; every other
   word shows its emoji until its own render is made. Every word starts with
   the letter's most common sound — c, g are hard, the vowels are short —
   except x, taught as the sound at the end of a word. */
const LETTERS: Record<LetterId, LetterEntry> = {
  a: { unit: 1, capital: capitalA, small: smallA, words: [{ word: "apple", emoji: "🍎", picture: applePicture }, { word: "ant", emoji: "🐜" }, { word: "alligator", emoji: "🐊" }] },
  b: { unit: 1, capital: capitalB, small: smallB, words: [{ word: "ball", emoji: "⚽", picture: ballPicture }, { word: "bear", emoji: "🐻" }, { word: "banana", emoji: "🍌" }] },
  c: { unit: 1, capital: capitalC, small: smallC, words: [{ word: "cat", emoji: "🐱", picture: catPicture }, { word: "car", emoji: "🚗", picture: carPicture }, { word: "cake", emoji: "🎂" }] },
  d: { unit: 1, capital: capitalD, small: smallD, words: [{ word: "dog", emoji: "🐶", picture: dogPicture }, { word: "duck", emoji: "🦆" }, { word: "drum", emoji: "🥁" }] },
  e: { unit: 1, capital: capitalE, small: smallE, words: [{ word: "egg", emoji: "🥚" }, { word: "elephant", emoji: "🐘" }, { word: "envelope", emoji: "✉️" }] },
  f: { unit: 2, capital: capitalF, small: smallF, words: [{ word: "fish", emoji: "🐟" }, { word: "frog", emoji: "🐸" }, { word: "flower", emoji: "🌸" }] },
  g: { unit: 2, capital: capitalG, small: smallG, words: [{ word: "goat", emoji: "🐐" }, { word: "gift", emoji: "🎁" }, { word: "grapes", emoji: "🍇" }] },
  h: { unit: 2, capital: capitalH, small: smallH, words: [{ word: "hat", emoji: "🎩" }, { word: "horse", emoji: "🐴" }, { word: "house", emoji: "🏠" }] },
  i: { unit: 2, capital: capitalI, small: smallI, words: [{ word: "insect", emoji: "🐞" }, { word: "iguana", emoji: "🦎" }] },
  j: { unit: 2, capital: capitalJ, small: smallJ, words: [{ word: "juice", emoji: "🧃" }, { word: "jeans", emoji: "👖" }, { word: "jacket", emoji: "🧥" }] },
  k: { unit: 3, capital: capitalK, small: smallK, words: [{ word: "kite", emoji: "🪁" }, { word: "key", emoji: "🔑" }, { word: "kangaroo", emoji: "🦘" }] },
  l: { unit: 3, capital: capitalL, small: smallL, words: [{ word: "lion", emoji: "🦁" }, { word: "leaf", emoji: "🍃" }, { word: "lemon", emoji: "🍋" }] },
  m: { unit: 3, capital: capitalM, small: smallM, words: [{ word: "moon", emoji: "🌙" }, { word: "monkey", emoji: "🐵" }, { word: "milk", emoji: "🥛" }] },
  n: { unit: 3, capital: capitalN, small: smallN, words: [{ word: "nose", emoji: "👃" }, { word: "nut", emoji: "🥜" }, { word: "notebook", emoji: "📓" }] },
  o: { unit: 3, capital: capitalO, small: smallO, words: [{ word: "octopus", emoji: "🐙" }, { word: "otter", emoji: "🦦" }, { word: "olive", emoji: "🫒" }] },
  p: { unit: 4, capital: capitalP, small: smallP, words: [{ word: "pig", emoji: "🐷" }, { word: "pizza", emoji: "🍕" }, { word: "penguin", emoji: "🐧" }] },
  q: { unit: 4, capital: capitalQ, small: smallQ, words: [{ word: "queen", emoji: "👸" }, { word: "question", emoji: "❓" }] },
  r: { unit: 4, capital: capitalR, small: smallR, words: [{ word: "rabbit", emoji: "🐰", picture: rabbitPicture }, { word: "rainbow", emoji: "🌈" }, { word: "rocket", emoji: "🚀" }] },
  s: { unit: 4, capital: capitalS, small: smallS, words: [{ word: "sun", emoji: "☀️" }, { word: "star", emoji: "⭐", picture: starPicture }, { word: "snake", emoji: "🐍" }] },
  t: { unit: 4, capital: capitalT, small: smallT, words: [{ word: "tiger", emoji: "🐯" }, { word: "tree", emoji: "🌳" }, { word: "turtle", emoji: "🐢" }] },
  u: { unit: 5, capital: capitalU, small: smallU, words: [{ word: "umbrella", emoji: "☂️" }, { word: "up", emoji: "⬆️" }] },
  v: { unit: 5, capital: capitalV, small: smallV, words: [{ word: "van", emoji: "🚐" }, { word: "violin", emoji: "🎻" }, { word: "volcano", emoji: "🌋" }] },
  w: { unit: 5, capital: capitalW, small: smallW, words: [{ word: "watermelon", emoji: "🍉" }, { word: "whale", emoji: "🐳" }, { word: "watch", emoji: "⌚" }] },
  x: { unit: 5, capital: capitalX, small: smallX, words: [{ word: "box", emoji: "📦" }, { word: "fox", emoji: "🦊" }, { word: "six", emoji: "6️⃣" }] },
  y: { unit: 5, capital: capitalY, small: smallY, words: [{ word: "yo-yo", emoji: "🪀" }, { word: "yarn", emoji: "🧶" }, { word: "yellow", emoji: "🟡" }] },
  z: { unit: 5, capital: capitalZ, small: smallZ, words: [{ word: "zebra", emoji: "🦓" }, { word: "zero", emoji: "0️⃣" }] },
};

/** Letters whose reel has been delivered to `learn-letters/letters-videos/`.
    Add a letter here the moment its `<id>.mp4` lands — nothing else changes;
    a letter without one starts its session at `meet`. */
const VIDEO_READY: readonly LetterId[] = [];

export const letterItems: LetterItem[] = LETTER_IDS.map((id) => ({
  id,
  ...LETTERS[id],
  video: VIDEO_READY.includes(id)
    ? `/assets/learn-with-pinki/learn-letters/letters-videos/${id}.mp4`
    : undefined,
  capitalStrokes: capitalStrokes[id],
  smallStrokes: smallStrokes[id],
}));

export const LETTER_UNITS = 5;

/** The map, in order: each unit's letters, then its checkpoint. */
export const letterNodes: LetterNode[] = Array.from(
  { length: LETTER_UNITS },
  (_, index) => index + 1,
).flatMap((unit) => [
  ...letterItems
    .filter((item) => item.unit === unit)
    .map((item): LetterNode => ({ kind: "letter", id: item.id, unit })),
  { kind: "checkpoint", id: `unit-${unit}`, unit },
]);

export function findLetterItem(id: string): LetterItem | undefined {
  return letterItems.find((item) => item.id === id);
}

export function findLetterNode(id: string): LetterNode | undefined {
  return letterNodes.find((node) => node.id === id);
}
