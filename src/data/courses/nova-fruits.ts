import type { StaticImageData } from "next/image";
import type { Face, LessonDef, Question } from "@/types/course";
import apple from "../../../public/assets/learn/pinki/colors/paint/apple.png";
import banana from "../../../public/assets/learn/pinki/colors/paint/banana.png";
import orange from "../../../public/assets/learn/pinki/colors/paint/orange.png";
import grapes from "../../../public/assets/learn/pinki/colors/paint/grapes.png";
import carrot from "../../../public/assets/learn/pinki/colors/paint/carrot.png";
import broccoli from "../../../public/assets/learn/nova/fruits/things/broccoli.png";
import corn from "../../../public/assets/learn/nova/fruits/things/corn.png";
import potato from "../../../public/assets/learn/nova/fruits/things/potato.png";

/** One thing to learn: its word, its plural (for "I like apples.") and its
    picture. The Colors course's clay fruit is reused — the same renders. */
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

/** A stall of four: what is on the list, then the next foods along. */
function stallFor(list: string[], from: number): Face[] {
  const others = [1, 2, 3, 4, 5, 6, 7].map((k) => FOODS[(from + k) % FOODS.length].word).filter((word) => !list.includes(word));
  return [...list, ...others].slice(0, 4).map(face);
}

/**
 * Nova's market — one thing, one lesson: meet it (its picture, its word,
 * its speaker) → build its word → get it off the stall from Nova's
 * shopping list, with the one met last lesson so each word comes back
 * (spaced retrieval; lesson 1 has nothing to bring back yet, so no list).
 */
function foodLesson({ word, picture }: Food, i: number): LessonDef {
  const questions: Question[] = [
    { type: "word", ask: { key: "meetThing", vars: { thing: word } }, word, picture },
    { type: "spell", ask: { key: "spell", vars: { word } }, word },
  ];
  if (i > 0) {
    const list = [word, FOODS[i - 1].word];
    questions.push({ type: "shop", ask: { key: "shopList" }, list, stall: stallFor(list, i), into: "basket" });
  }
  return { reel: `/assets/learn/nova/fruits/reels/${i + 1}.mp4`, cover: [picture], questions };
}

/** Nova · Fruits & Vegetables. Titles live in `dict.lessons.fruits.items`.
    The reels are placeholders until the real clips replace them under the
    same names (`/assets/learn/nova/fruits/reels/<n>.mp4`). */
export const novaFruits: LessonDef[] = [
  ...FOODS.map(foodLesson),
  /* The review, no reel: a fruit salad and a vegetable soup made by their
     recipes (line by line), "Do you like…?" (I like / I don't like), then
     two words spelled from the picture alone. */
  {
    cover: [apple, banana, carrot, broccoli],
    questions: [
      { type: "shop", ask: { key: "makeSalad" }, list: ["banana", "apple", "grapes"], stall: ["banana", "apple", "grapes", "carrot"].map(face), into: "bowl", ordered: true },
      { type: "shop", ask: { key: "makeSoup" }, list: ["carrot", "potato", "corn"], stall: ["carrot", "potato", "corn", "orange"].map(face), into: "pot", ordered: true },
      { type: "likes", ask: { key: "likeThem" }, items: ["apple", "broccoli", "banana", "carrot"].map((word) => ({ face: face(word), things: food(word).things })) },
      { type: "spell", ask: { key: "spellPicture" }, word: "carrot", picture: carrot },
      { type: "spell", ask: { key: "spellPicture" }, word: "banana", picture: banana },
    ],
  },
];
