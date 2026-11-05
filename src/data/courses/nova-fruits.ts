import type { StaticImageData } from "next/image";
import { BASKET, GARDENS } from "@/data/garden";
import { KITCHEN } from "@/data/kitchen";
import { VEG_GARDEN } from "@/data/veg-garden";
import type { Face, Food, LessonDef, Vegetable } from "@/types/course";
import carrot from "../../../public/assets/learn/nova/fruits/things/carrot.png";
import broccoli from "../../../public/assets/learn/nova/fruits/things/broccoli.png";
import potato from "../../../public/assets/learn/nova/fruits/things/potato.png";
import tomato from "../../../public/assets/learn/nova/fruits/things/tomato.png";
import pepper from "../../../public/assets/learn/nova/fruits/things/pepper.png";
import potMix from "../../../public/assets/learn/nova/fruits/make/pot-mix.png";

/** One thing to learn: its word, its plural ("I like carrots.", "3
    carrots"), its picture — the videos' look (smooth satin clay, no
    face, the clay buttons' grain: `render.cjs thing carrot=video:carrot`). */
interface Veg {
  word: Vegetable;
  things: string;
  picture: StaticImageData;
}

/** In teaching order — only what the course videos show (direct request
    2026-10-12: the apple, banana, orange, grapes and corn went): three
    vegetables, then the two the videos added. */
const FOODS: Veg[] = [
  { word: "carrot", things: "carrots", picture: carrot },
  { word: "broccoli", things: "broccoli", picture: broccoli },
  { word: "potato", things: "potatoes", picture: potato },
  { word: "tomato", things: "tomatoes", picture: tomato },
  { word: "pepper", things: "peppers", picture: pepper },
];

const food = (word: string): Veg => {
  const found = FOODS.find((f) => f.word === word);
  if (!found) throw new Error(`No ${word} at the market`);
  return found;
};

const face = (word: string): Face => ({ kind: "picture", src: food(word).picture, word });

/** A line of Nova's note: how many of a food to pick. */
const line = (word: string, count: number) => ({ word, things: food(word).things, count });

/** A vegetable as Basket Time's demo carries it: its word and picture. */
const bite = ({ word, picture }: Veg): Food => ({ word, src: picture });

/**
 * Nova's garden (2026-11-05: the course's world, `data/veg-garden.ts`; its
 * bed grows the lesson's vegetable as the steps are done) — one thing, one
 * lesson: watch its reel, meet it (its picture, its word, its speaker) by
 * the bed's sign, build its word among the seed packets, then go in at her
 * door to Basket Time — read its word and put it from the kitchen counter,
 * among everything else on it, into the basket (the user's design,
 * 2026-11-01: Find It! merged into it). Its demo carries another vegetable. (Grow it, the
 * third step from 2026-10-24, was removed 2026-11-01; Nova's cups,
 * before it, are a game on `/play`.) Picking in her garden is the
 * review's exam, with several foods to tell apart.
 */
function foodLesson(veg: Veg, i: number): LessonDef {
  const { word, picture } = veg;
  const others = FOODS.filter((other) => other !== veg);
  const outsider = others[i % others.length];
  return {
    reel: `/assets/learn/nova/fruits/reels/${i + 1}.mp4`,
    cover: [picture],
    world: VEG_GARDEN[i + 1],
    questions: [
      { type: "word", ask: { key: "meetThing", vars: { thing: word } }, word, picture },
      { type: "spell", ask: { key: "spell", vars: { word } }, word },
      { type: "basket", ask: { key: "basketTime", vars: { thing: word } }, word, kitchen: KITCHEN, basket: BASKET, demo: bite(outsider) },
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
     every line is counted. (The juice went with the fruits, 2026-10-12.)
     In her world: the soup at the kitchen counter, out at the door to the
     likes at a garden table, the spells among seed packets, the exam over
     the bed, all five growing in it. */
  {
    cover: [carrot, broccoli, tomato, pepper],
    world: VEG_GARDEN[6],
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
