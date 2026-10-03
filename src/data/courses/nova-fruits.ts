import type { StaticImageData } from "next/image";
import { GARDENS } from "@/data/garden";
import type { Face, Garden, LessonDef } from "@/types/course";
import apple from "../../../public/assets/learn/pinki/colors/paint/apple.png";
import banana from "../../../public/assets/learn/pinki/colors/paint/banana.png";
import orange from "../../../public/assets/learn/pinki/colors/paint/orange.png";
import grapes from "../../../public/assets/learn/pinki/colors/paint/grapes.png";
import carrot from "../../../public/assets/learn/pinki/colors/paint/carrot.png";
import broccoli from "../../../public/assets/learn/nova/fruits/things/broccoli.png";
import corn from "../../../public/assets/learn/nova/fruits/things/corn.png";
import potato from "../../../public/assets/learn/nova/fruits/things/potato.png";
import blenderMix from "../../../public/assets/learn/nova/fruits/make/blender-mix.png";
import glassMix from "../../../public/assets/learn/nova/fruits/make/glass-mix.png";
import potMix from "../../../public/assets/learn/nova/fruits/make/pot-mix.png";

/** One thing to learn: its word, its plural ("I like apples.", the full
    basket), its picture (the Colors course's clay fruit is reused — the
    same renders) and the garden it is picked in. */
interface Food {
  word: string;
  things: string;
  picture: StaticImageData;
  garden: Garden;
}

/** In teaching order: four fruits, then four vegetables. */
const FOODS: Food[] = [
  { word: "apple", things: "apples", picture: apple, garden: GARDENS.apple },
  { word: "banana", things: "bananas", picture: banana, garden: GARDENS.banana },
  { word: "orange", things: "oranges", picture: orange, garden: GARDENS.orange },
  { word: "grapes", things: "grapes", picture: grapes, garden: GARDENS.grapes },
  { word: "carrot", things: "carrots", picture: carrot, garden: GARDENS.carrot },
  { word: "broccoli", things: "broccoli", picture: broccoli, garden: GARDENS.broccoli },
  { word: "corn", things: "corn", picture: corn, garden: GARDENS.corn },
  { word: "potato", things: "potatoes", picture: potato, garden: GARDENS.potato },
];

const food = (word: string): Food => {
  const found = FOODS.find((f) => f.word === word);
  if (!found) throw new Error(`No ${word} at the market`);
  return found;
};

const face = (word: string): Face => ({ kind: "picture", src: food(word).picture, word });

/**
 * Nova's garden — one thing, one lesson, and every step about IT (direct
 * request 2026-10-03: no choosing — the child knows it is the apple
 * lesson): meet it (its picture, its word, its speaker) → build its word →
 * fill the word with it (a word made of apples) → pick five of it into
 * Nova's basket, its word popping up at each one. The juice and the soup
 * are the review's.
 */
function foodLesson({ word, things, picture, garden }: Food, i: number): LessonDef {
  return {
    reel: `/assets/learn/nova/fruits/reels/${i + 1}.mp4`,
    cover: [picture],
    questions: [
      { type: "word", ask: { key: "meetThing", vars: { thing: word } }, word, picture },
      { type: "spell", ask: { key: "spell", vars: { word } }, word },
      { type: "fill", ask: { key: "fillWord", vars: { word } }, word, picture: garden.item },
      { type: "harvest", ask: { key: "pickThem", vars: { things } }, word, things, garden },
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
     like), then two words spelled from the picture alone — grapes, the one
     fruit the juice leaves out. */
  {
    cover: [apple, banana, carrot, broccoli],
    questions: [
      { type: "make", ask: { key: "mixJuice" }, list: ["apple", "banana", "orange"], stall: ["apple", "banana", "orange", "grapes"].map(face), into: "blender", full: blenderMix, serve: glassMix },
      { type: "make", ask: { key: "makeSoup" }, list: ["carrot", "potato", "corn"], stall: ["carrot", "potato", "corn", "broccoli"].map(face), into: "pot", full: potMix },
      { type: "likes", ask: { key: "likeThem" }, items: ["apple", "broccoli", "banana", "carrot"].map((word) => ({ face: face(word), things: food(word).things })) },
      { type: "spell", ask: { key: "spellPicture" }, word: "carrot", picture: carrot },
      { type: "spell", ask: { key: "spellPicture" }, word: "grapes", picture: grapes },
    ],
  },
];
