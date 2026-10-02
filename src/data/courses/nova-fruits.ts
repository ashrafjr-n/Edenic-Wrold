import type { StaticImageData } from "next/image";
import type { Face, LessonDef } from "@/types/course";
import apple from "../../../public/assets/learn/pinki/colors/paint/apple.png";
import banana from "../../../public/assets/learn/pinki/colors/paint/banana.png";
import orange from "../../../public/assets/learn/pinki/colors/paint/orange.png";
import grapes from "../../../public/assets/learn/pinki/colors/paint/grapes.png";
import carrot from "../../../public/assets/learn/pinki/colors/paint/carrot.png";
import broccoli from "../../../public/assets/learn/nova/fruits/things/broccoli.png";
import corn from "../../../public/assets/learn/nova/fruits/things/corn.png";
import potato from "../../../public/assets/learn/nova/fruits/things/potato.png";
import appleCut from "../../../public/assets/learn/nova/fruits/cut/apple-cut.png";
import bananaCut from "../../../public/assets/learn/nova/fruits/cut/banana-cut.png";
import orangeCut from "../../../public/assets/learn/nova/fruits/cut/orange-cut.png";
import grapeCut from "../../../public/assets/learn/nova/fruits/cut/grape-cut.png";
import carrotCut from "../../../public/assets/learn/nova/fruits/cut/carrot-cut.png";
import broccoliCut from "../../../public/assets/learn/nova/fruits/cut/broccoli-cut.png";
import cornCut from "../../../public/assets/learn/nova/fruits/cut/corn-cut.png";
import potatoCut from "../../../public/assets/learn/nova/fruits/cut/potato-cut.png";

/** One thing to learn: its word, its plural (for "I like apples."), its
    picture and its picture cut open. The Colors course's clay fruit is
    reused — the same renders. */
interface Food {
  word: string;
  things: string;
  picture: StaticImageData;
  inside: StaticImageData;
}

/** In teaching order: four fruits, then four vegetables. */
const FOODS: Food[] = [
  { word: "apple", things: "apples", picture: apple, inside: appleCut },
  { word: "banana", things: "bananas", picture: banana, inside: bananaCut },
  { word: "orange", things: "oranges", picture: orange, inside: orangeCut },
  { word: "grapes", things: "grapes", picture: grapes, inside: grapeCut },
  { word: "carrot", things: "carrots", picture: carrot, inside: carrotCut },
  { word: "broccoli", things: "broccoli", picture: broccoli, inside: broccoliCut },
  { word: "corn", things: "corn", picture: corn, inside: cornCut },
  { word: "potato", things: "potatoes", picture: potato, inside: potatoCut },
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
 * Nova's market — one thing, one lesson, built LISTEN → DO → SPELL → USE
 * (research: hear and recognise a word before producing it, tie it to an
 * action, then use it): what's in the bag? (its shadow, pick which, out it
 * comes with its word and speaker) → cut it open → get it off the stall
 * from Nova's shopping list (with the one met last lesson, so each word
 * comes back) → build its word.
 */
function foodLesson({ word, picture, inside }: Food, i: number): LessonDef {
  /* A decoy of a very different shape, so the shadow can be told. */
  const decoy = FOODS[(i + 4) % FOODS.length].word;
  const list = i === 0 ? [word] : [word, FOODS[i - 1].word];
  return {
    reel: `/assets/learn/nova/fruits/reels/${i + 1}.mp4`,
    cover: [picture],
    questions: [
      { type: "reveal", ask: { key: "whatsInBag" }, word, picture, decoy: face(decoy) },
      { type: "cut", ask: { key: "cutOpen", vars: { thing: word } }, word, picture, inside },
      { type: "shop", ask: { key: "shopList" }, list, stall: stallFor(list, i), into: "basket" },
      { type: "spell", ask: { key: "spell", vars: { word } }, word },
    ],
  };
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
