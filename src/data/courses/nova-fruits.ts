import type { StaticImageData } from "next/image";
import { GARDENS } from "@/data/garden";
import type { Face, LessonDef } from "@/types/course";
import carrot from "../../../public/assets/learn/nova/fruits/things/carrot.png";
import broccoli from "../../../public/assets/learn/nova/fruits/things/broccoli.png";
import potato from "../../../public/assets/learn/nova/fruits/things/potato.png";
import tomato from "../../../public/assets/learn/nova/fruits/things/tomato.png";
import pepper from "../../../public/assets/learn/nova/fruits/things/pepper.png";
import potMix from "../../../public/assets/learn/nova/fruits/make/pot-mix.png";

/** One thing to learn: its word, its plural ("I like carrots.", "3
    carrots") and its picture — the videos' look (smooth satin clay, no
    face, the clay buttons' grain: `render.cjs thing carrot=video:carrot`). */
interface Food {
  word: string;
  things: string;
  picture: StaticImageData;
}

/** In teaching order — only what the course videos show (direct request
    2026-10-12: the apple, banana, orange, grapes and corn went): three
    vegetables, then the two the videos added. */
const FOODS: Food[] = [
  { word: "carrot", things: "carrots", picture: carrot },
  { word: "broccoli", things: "broccoli", picture: broccoli },
  { word: "potato", things: "potatoes", picture: potato },
  { word: "tomato", things: "tomatoes", picture: tomato, core: true },
  { word: "pepper", things: "peppers", picture: pepper, core: true },
];

const food = (word: string): Food => {
  const found = FOODS.find((f) => f.word === word);
  if (!found) throw new Error(`No ${word} at the market`);
  return found;
};

const face = (word: string): Face => ({ kind: "picture", src: food(word).picture, word });

/** A line of Nova's note: how many of a food to pick. */
const line = (word: string, count: number) => ({ word, things: food(word).things, count });

/**
 * Nova's garden — one thing, one lesson, and every step about IT: meet it
 * (its picture, its word, its speaker) → build its word → Nova's cups
 * (direct request 2026-10-08, replacing Grow it): it goes under one of
 * three cups, they swap, and the child finds it — the same one thing,
 * watched closely. Picking in her garden is the review's exam, with
 * several foods to tell apart.
 */
function foodLesson({ word, picture, core }: Food, i: number): LessonDef {
  return {
    reel: `/assets/learn/nova/fruits/reels/${i + 1}.mp4`,
    cover: [picture],
    questions: [
      { type: "word", ask: { key: "meetThing", vars: { thing: word } }, word, picture },
      { type: "spell", ask: { key: "spell", vars: { word } }, word },
      ...(core ? [] : [{ type: "cups" as const, ask: { key: "findUnderCup" as const, vars: { thing: word } }, word, picture }]),
    ],
  };
}

/** Nova · Fruits & Vegetables. Titles live in `dict.lessons.fruits.items`.
    The reels are placeholders until the real clips replace them under the
    same names (`/assets/learn/nova/fruits/reels/<n>.mp4`). */
export const novaFruits: LessonDef[] = [
  ...FOODS.map(foodLesson),
  /* The review, no reel: a vegetable soup from a recipe of words alone
     (the fourth thing beside the pot is a vegetable too, so every word has
     to be read), "Do you like…?" (I like / I don't like), two words spelled
     from the picture alone, then the exam, twice: Nova's note in her
     garden — a carrot bed, a tomato plant, a potato bed — and one basket,
     "1 potato, 3 carrots, 2 tomatoes" — never in the plants' order, so
     every line is read, and more on each plant than the note asks for, so
     every line is counted. (The juice went with the fruits, 2026-10-12.) */
  {
    cover: [carrot, broccoli, tomato, pepper],
    questions: [
      { type: "make", ask: { key: "makeSoup" }, list: ["carrot", "potato", "broccoli"], stall: ["carrot", "potato", "broccoli", "pepper"].map(face), full: potMix },
      { type: "likes", ask: { key: "likeThem" }, items: ["tomato", "broccoli", "pepper", "carrot"].map((word) => ({ face: face(word), things: food(word).things })) },
      { type: "spell", ask: { key: "spellPicture" }, word: "carrot", picture: carrot },
      { type: "spell", ask: { key: "spellPicture" }, word: "pepper", picture: pepper },
      { type: "harvest", ask: { key: "pickList" }, order: [line("potato", 1), line("carrot", 3), line("tomato", 2)], garden: GARDENS.vegetables },
      { type: "harvest", ask: { key: "pickList" }, order: [line("tomato", 3), line("potato", 2), line("carrot", 1)], garden: GARDENS.vegetables },
    ],
  },
];
