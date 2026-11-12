import type { StaticImageData } from "next/image";
import { BASKET } from "@/data/garden";
import { KITCHEN } from "@/data/kitchen";
import { VEG_KITCHEN } from "@/data/veg-kitchen";
import type { Food, LessonDef, Vegetable } from "@/types/course";
import carrot from "../../../public/assets/learn/nova/fruits/things/carrot.png";
import broccoli from "../../../public/assets/learn/nova/fruits/things/broccoli.png";
import potato from "../../../public/assets/learn/nova/fruits/things/potato.png";
import tomato from "../../../public/assets/learn/nova/fruits/things/tomato.png";
import pepper from "../../../public/assets/learn/nova/fruits/things/pepper.png";

/** One thing to learn: its word and its picture — the videos' look (smooth
    satin clay, no face, the clay buttons' grain: `render.cjs thing
    carrot=video:carrot`). */
interface Veg {
  word: Vegetable;
  picture: StaticImageData;
}

/** In teaching order — only what the course videos show (direct request
    2026-10-12: the apple, banana, orange, grapes and corn went): three
    vegetables, then the two the videos added. */
const FOODS: Veg[] = [
  { word: "carrot", picture: carrot },
  { word: "broccoli", picture: broccoli },
  { word: "potato", picture: potato },
  { word: "tomato", picture: tomato },
  { word: "pepper", picture: pepper },
];

/** A vegetable as Basket Time's demo carries it: its word and picture. */
const bite = ({ word, picture }: Veg): Food => ({ word, src: picture });

/**
 * Nova's kitchen (2026-11-06: the whole course's world, `data/veg-kitchen.ts`
 * — the user: all of it indoors, the camera moving once for the steps and once
 * for Basket Time, no progress marker) — one thing, one lesson: watch its reel,
 * then the camera comes down into the kitchen and stays there while it is met
 * (its picture, its word, its speaker) and its word is built; then ONE move in
 * to the counter for Basket Time — read its word and put it from the counter,
 * among everything else on it, into the basket (the user's design,
 * 2026-11-01: Find It! merged into it). Its demo carries another vegetable.
 * (Grow it, the third step from 2026-10-24, was removed 2026-11-01; Nova's
 * cups, before it, are a game on `/play`.)
 */
function foodLesson(veg: Veg, i: number): LessonDef {
  const { word, picture } = veg;
  const others = FOODS.filter((other) => other !== veg);
  const outsider = others[i % others.length];
  return {
    reel: `/assets/learn/nova/fruits/reels/${word}.mp4`,
    cover: [picture],
    world: { ...VEG_KITCHEN[1], stepStation: [0, 0, 1] },
    questions: [
      { type: "word", ask: { key: "meetThing", vars: { thing: word } }, word, picture },
      { type: "spell", ask: { key: "spell", vars: { word } }, word },
      { type: "basket", ask: { key: "basketTime", vars: { thing: word } }, word, kitchen: KITCHEN, basket: BASKET, demo: bite(outsider) },
    ],
  };
}

/** Nova · Fruits & Vegetables. Titles live in `dict.lessons.fruits.items`.
    The reels are the real clips, H.264 720p (`tools/reels/encode.sh`):
    `/assets/learn/nova/fruits/reels/<word>.mp4`. */
export const novaFruits: LessonDef[] = FOODS.map(foodLesson);
