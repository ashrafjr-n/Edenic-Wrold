import type { StaticImageData } from "next/image";
import type { Face, LessonDef, Maker, Question } from "@/types/course";
import apple from "../../../public/assets/learn/pinki/colors/paint/apple.png";
import banana from "../../../public/assets/learn/pinki/colors/paint/banana.png";
import orange from "../../../public/assets/learn/pinki/colors/paint/orange.png";
import grapes from "../../../public/assets/learn/pinki/colors/paint/grapes.png";
import carrot from "../../../public/assets/learn/pinki/colors/paint/carrot.png";
import broccoli from "../../../public/assets/learn/nova/fruits/things/broccoli.png";
import corn from "../../../public/assets/learn/nova/fruits/things/corn.png";
import potato from "../../../public/assets/learn/nova/fruits/things/potato.png";
import blenderApple from "../../../public/assets/learn/nova/fruits/make/blender-apple.png";
import blenderBanana from "../../../public/assets/learn/nova/fruits/make/blender-banana.png";
import blenderOrange from "../../../public/assets/learn/nova/fruits/make/blender-orange.png";
import blenderGrapes from "../../../public/assets/learn/nova/fruits/make/blender-grapes.png";
import glassApple from "../../../public/assets/learn/nova/fruits/make/glass-apple.png";
import glassBanana from "../../../public/assets/learn/nova/fruits/make/glass-banana.png";
import glassOrange from "../../../public/assets/learn/nova/fruits/make/glass-orange.png";
import glassGrapes from "../../../public/assets/learn/nova/fruits/make/glass-grapes.png";
import potCarrot from "../../../public/assets/learn/nova/fruits/make/pot-carrot.png";
import potBroccoli from "../../../public/assets/learn/nova/fruits/make/pot-broccoli.png";
import potCorn from "../../../public/assets/learn/nova/fruits/make/pot-corn.png";
import potPotato from "../../../public/assets/learn/nova/fruits/make/pot-potato.png";

/** One thing to learn: its word, its plural (for "I like apples."), its
    picture (the Colors course's clay fruit is reused — the same renders)
    and what Nova makes of it: a fruit's juice in the blender (and the
    glass it pours), a vegetable's soup in the pot. */
interface Food {
  word: string;
  things: string;
  picture: StaticImageData;
  makes: { into: Maker; full: StaticImageData; serve?: StaticImageData };
}

/** In teaching order: four fruits, then four vegetables. */
const FOODS: Food[] = [
  { word: "apple", things: "apples", picture: apple, makes: { into: "blender", full: blenderApple, serve: glassApple } },
  { word: "banana", things: "bananas", picture: banana, makes: { into: "blender", full: blenderBanana, serve: glassBanana } },
  { word: "orange", things: "oranges", picture: orange, makes: { into: "blender", full: blenderOrange, serve: glassOrange } },
  { word: "grapes", things: "grapes", picture: grapes, makes: { into: "blender", full: blenderGrapes, serve: glassGrapes } },
  { word: "carrot", things: "carrots", picture: carrot, makes: { into: "pot", full: potCarrot } },
  { word: "broccoli", things: "broccoli", picture: broccoli, makes: { into: "pot", full: potBroccoli } },
  { word: "corn", things: "corn", picture: corn, makes: { into: "pot", full: potCorn } },
  { word: "potato", things: "potatoes", picture: potato, makes: { into: "pot", full: potPotato } },
];

const food = (word: string): Food => {
  const found = FOODS.find((f) => f.word === word);
  if (!found) throw new Error(`No ${word} at the market`);
  return found;
};

const face = (word: string): Face => ({ kind: "picture", src: food(word).picture, word });

/** What else stands by the blender (the pot): two of the same kind — the
    ones learned last first — so the word has to be read; a fruit among
    vegetables would give it away. */
function besides(i: number): string[] {
  const kind = FOODS.map((f, k) => ({ word: f.word, k })).filter(({ k }) => k !== i && FOODS[k].makes.into === FOODS[i].makes.into);
  const learned = kind.filter(({ k }) => k < i).reverse();
  return [...learned, ...kind.filter(({ k }) => k > i)].slice(0, 2).map(({ word }) => word);
}

/** A stall of four: what is on the list, then the next foods along. */
function stallFor(list: string[], from: number): Face[] {
  const others = [1, 2, 3, 4, 5, 6, 7].map((k) => FOODS[(from + k) % FOODS.length].word).filter((word) => !list.includes(word));
  return [...list, ...others].slice(0, 4).map(face);
}

/**
 * Nova's market — one thing, one lesson: meet it (its picture, its word,
 * its speaker) → build its word → make something of it, finding it by its
 * word among two of its kind (apple juice in the blender, carrot soup in
 * the pot) → get it off the stall from Nova's shopping list, with the one
 * met last lesson so each word comes back (spaced retrieval; lesson 1 has
 * nothing to bring back yet, so no list).
 */
function foodLesson({ word, picture, makes: { into, full, serve } }: Food, i: number): LessonDef {
  const questions: Question[] = [
    { type: "word", ask: { key: "meetThing", vars: { thing: word } }, word, picture },
    { type: "spell", ask: { key: "spell", vars: { word } }, word },
    {
      type: "make",
      ask: { key: into === "blender" ? "makeJuice" : "cookSoup", vars: { thing: word } },
      list: [word],
      stall: [word, ...besides(i)].map(face),
      into,
      full,
      serve,
    },
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
