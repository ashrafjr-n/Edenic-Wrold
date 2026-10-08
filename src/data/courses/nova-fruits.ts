import type { StaticImageData } from "next/image";
import { GARDENS } from "@/data/garden";
import { GROW_SCENES } from "@/data/nova-grow";
import type { Face, LessonDef } from "@/types/course";
import apple from "../../../public/assets/learn/nova/fruits/things/apple.png";
import banana from "../../../public/assets/learn/nova/fruits/things/banana.png";
import orange from "../../../public/assets/learn/nova/fruits/things/orange.png";
import grapes from "../../../public/assets/learn/nova/fruits/things/grapes.png";
import carrot from "../../../public/assets/learn/nova/fruits/things/carrot.png";
import broccoli from "../../../public/assets/learn/nova/fruits/things/broccoli.png";
import corn from "../../../public/assets/learn/nova/fruits/things/corn.png";
import potato from "../../../public/assets/learn/nova/fruits/things/potato.png";
import blenderMix from "../../../public/assets/learn/nova/fruits/make/blender-mix.png";
import glassMix from "../../../public/assets/learn/nova/fruits/make/glass-mix.png";
import potMix from "../../../public/assets/learn/nova/fruits/make/pot-mix.png";

/** One thing to learn: its word, its plural ("I like apples.", "3
    apples") and its picture — in the friends' look: velvet clay with the
    clay buttons' grain and the friends' face (`render.cjs thing
    apple=fruit:apple`). */
interface Food {
  word: string;
  things: string;
  picture: StaticImageData;
}

/** In teaching order: four fruits, then four vegetables. */
const FOODS: Food[] = [
  { word: "apple", things: "apples", picture: apple },
  { word: "banana", things: "bananas", picture: banana },
  { word: "orange", things: "oranges", picture: orange },
  { word: "grapes", things: "grapes", picture: grapes },
  { word: "carrot", things: "carrots", picture: carrot },
  { word: "broccoli", things: "broccoli", picture: broccoli },
  { word: "corn", things: "corn", picture: corn },
  { word: "potato", things: "potatoes", picture: potato },
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
 * (its picture, its word, its speaker) → build its word → grow it (direct
 * request 2026-10-07: Nova plants its seed and the child brings it up, tap
 * by tap, to the food on its plant — where it comes from). Picking from
 * the trees is the review's exam, with several foods to tell apart.
 */
function foodLesson({ word, picture }: Food, i: number): LessonDef {
  return {
    reel: `/assets/learn/nova/fruits/reels/${i + 1}.mp4`,
    cover: [picture],
    questions: [
      { type: "word", ask: { key: "meetThing", vars: { thing: word } }, word, picture },
      { type: "spell", ask: { key: "spell", vars: { word } }, word },
      { type: "change", ask: { key: "growIt", vars: { thing: word } }, magic: "grow", word, scene: GROW_SCENES[word] },
    ],
  };
}

/** Nova · Fruits & Vegetables. Titles live in `dict.lessons.fruits.items`.
    The reels are placeholders until the real clips replace them under the
    same names (`/assets/learn/nova/fruits/reels/<n>.mp4`). */
export const novaFruits: LessonDef[] = [
  ...FOODS.map(foodLesson),
  /* The review, no reel: a mixed juice and a vegetable soup made from
     recipes of words alone (the fourth thing beside each is one of its own
     kind, so every word has to be read), "Do you like…?" (I like / I don't
     like), two words spelled from the picture alone — grapes, the one fruit
     the juice leaves out — then the exam: Nova's note in her garden, three
     plants and one basket, "3 apples, 2 oranges, 1 banana" — never in the
     plants' order, so every line is read, and more on each plant than the
     note asks for, so every line is counted. */
  {
    cover: [apple, banana, carrot, broccoli],
    questions: [
      { type: "make", ask: { key: "mixJuice" }, list: ["apple", "banana", "orange"], stall: ["apple", "banana", "orange", "grapes"].map(face), into: "blender", full: blenderMix, serve: glassMix },
      { type: "make", ask: { key: "makeSoup" }, list: ["carrot", "potato", "corn"], stall: ["carrot", "potato", "corn", "broccoli"].map(face), into: "pot", full: potMix },
      { type: "likes", ask: { key: "likeThem" }, items: ["apple", "broccoli", "banana", "carrot"].map((word) => ({ face: face(word), things: food(word).things })) },
      { type: "spell", ask: { key: "spellPicture" }, word: "carrot", picture: carrot },
      { type: "spell", ask: { key: "spellPicture" }, word: "grapes", picture: grapes },
      { type: "harvest", ask: { key: "pickList" }, order: [line("apple", 3), line("orange", 2), line("banana", 1)], garden: GARDENS.fruits },
      { type: "harvest", ask: { key: "pickList" }, order: [line("potato", 1), line("carrot", 3), line("banana", 2)], garden: GARDENS.vegetables },
    ],
  },
];
