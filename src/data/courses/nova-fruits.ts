import type { StaticImageData } from "next/image";
import type { ColorId, Face, LessonDef, Scene, SceneItem, SortBin } from "@/types/course";
import { COLORS } from "@/data/colors";
import { fruitPicnic, vegetablePicnic } from "@/data/nova-scenes";
import apple from "../../../public/assets/learn/pinki/colors/paint/apple.png";
import appleBlank from "../../../public/assets/learn/pinki/colors/paint/apple-blank.png";
import banana from "../../../public/assets/learn/pinki/colors/paint/banana.png";
import bananaBlank from "../../../public/assets/learn/pinki/colors/paint/banana-blank.png";
import orange from "../../../public/assets/learn/pinki/colors/paint/orange.png";
import orangeBlank from "../../../public/assets/learn/pinki/colors/paint/orange-blank.png";
import grapes from "../../../public/assets/learn/pinki/colors/paint/grapes.png";
import grapesBlank from "../../../public/assets/learn/pinki/colors/paint/grapes-blank.png";
import carrot from "../../../public/assets/learn/pinki/colors/paint/carrot.png";
import carrotBlank from "../../../public/assets/learn/pinki/colors/paint/carrot-blank.png";
import broccoli from "../../../public/assets/learn/nova/fruits/things/broccoli.png";
import broccoliBlank from "../../../public/assets/learn/nova/fruits/things/broccoli-blank.png";
import corn from "../../../public/assets/learn/nova/fruits/things/corn.png";
import cornBlank from "../../../public/assets/learn/nova/fruits/things/corn-blank.png";
import potato from "../../../public/assets/learn/nova/fruits/things/potato.png";
import potatoBlank from "../../../public/assets/learn/nova/fruits/things/potato-blank.png";

/** One thing to learn: its picture (and in grey clay, to paint), its own
    color, how a Find names a few of them, and the picnic it is found in.
    The Colors course's paint things are reused — the same clay. */
interface Food {
  word: string;
  things: string;
  picture: StaticImageData;
  blank: StaticImageData;
  color: ColorId;
  /** Two other paints on offer beside its own. */
  others: [ColorId, ColorId];
  scene: Scene;
}

const food = (word: string, things: string, picture: StaticImageData, blank: StaticImageData, color: ColorId, others: [ColorId, ColorId], scene: Scene): Food => ({
  word,
  things,
  picture,
  blank,
  color,
  others,
  scene,
});

/** In teaching order: four fruits, then four vegetables. */
const FOODS: Food[] = [
  food("apple", "apples", apple, appleBlank, "red", ["green", "blue"], fruitPicnic),
  food("banana", "bananas", banana, bananaBlank, "yellow", ["red", "purple"], fruitPicnic),
  food("orange", "oranges", orange, orangeBlank, "orange", ["yellow", "green"], fruitPicnic),
  food("grapes", "grapes", grapes, grapesBlank, "purple", ["red", "orange"], fruitPicnic),
  food("carrot", "carrots", carrot, carrotBlank, "orange", ["purple", "green"], vegetablePicnic),
  food("broccoli", "broccoli", broccoli, broccoliBlank, "green", ["red", "yellow"], vegetablePicnic),
  food("corn", "corn", corn, cornBlank, "yellow", ["blue", "orange"], vegetablePicnic),
  food("potato", "potatoes", potato, potatoBlank, "brown", ["pink", "green"], vegetablePicnic),
];

/** Turns a list so the right pot does not always sit in the same place. */
const turn = <T,>(items: T[], by: number): T[] => items.map((_, i) => items[(i + by) % items.length]);

const face = (picture: StaticImageData, word: string): Face => ({ kind: "picture", src: picture, word });

/**
 * One thing, one lesson: watch its reel, meet it (its picture and word),
 * spell it, paint it its own color — reading the color word, so Pinki's
 * Colors come back — then find every one of it in the picnic.
 */
function foodLesson({ word, things, picture, blank, color, others, scene }: Food, n: number): LessonDef {
  return {
    reel: `/assets/learn/nova/fruits/reels/${n}.mp4`,
    cover: [picture],
    questions: [
      { type: "word", ask: { key: "meetThing", vars: { thing: word } }, word, picture },
      { type: "spell", ask: { key: "spell", vars: { word } }, word },
      { type: "paint", ask: { key: "paint" }, rounds: [{ color, blank, painted: picture, word }], pots: turn([color, ...others], n) },
      { type: "find", ask: { key: "findThings", vars: { things } }, target: { word }, scene },
    ],
  };
}

/** One thing out of a picnic, for the review's baskets. */
function thing(scene: Scene, id: string): SceneItem {
  const item = scene.items.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`No ${id} in that scene`);
  return item;
}

/** The review's two baskets. */
const BASKETS: SortBin[] = [
  { target: { group: "fruit" }, word: "fruit", face: face(apple, "fruit"), tone: { face: COLORS.red.face, edge: COLORS.red.edge, text: COLORS.red.text } },
  { target: { group: "vegetable" }, word: "vegetable", face: face(carrot, "vegetable"), tone: { face: COLORS.green.face, edge: COLORS.green.edge, text: COLORS.green.text } },
];

/** Nova · Fruits & Vegetables. Titles live in `dict.lessons.fruits.items`.
    The reels are placeholders until the real clips replace them under the
    same names (`/assets/learn/nova/fruits/reels/<n>.mp4`). */
export const novaFruits: LessonDef[] = [
  ...FOODS.map((item, i) => foodLesson(item, i + 1)),
  /* The review, no reel: fruit or vegetable into two baskets, two things
     named by their word, then two spelled from the picture alone. */
  {
    cover: [apple, banana, carrot, broccoli],
    questions: [
      {
        type: "sort",
        ask: { key: "sortFood" },
        bins: BASKETS,
        items: [
          thing(fruitPicnic, "apple1"),
          thing(vegetablePicnic, "carrot1"),
          thing(vegetablePicnic, "broccoli1"),
          thing(fruitPicnic, "banana1"),
          thing(fruitPicnic, "grapes1"),
          thing(vegetablePicnic, "corn1"),
          thing(fruitPicnic, "orange1"),
          thing(vegetablePicnic, "potato1"),
        ],
      },
      { type: "pick", ask: { key: "whichThing", vars: { thing: "corn" } }, word: "corn", options: [face(banana, "banana"), face(corn, "corn"), face(carrot, "carrot"), face(potato, "potato")], answer: 1 },
      { type: "pick", ask: { key: "whichThing", vars: { thing: "grapes" } }, word: "grapes", options: [face(apple, "apple"), face(broccoli, "broccoli"), face(orange, "orange"), face(grapes, "grapes")], answer: 3 },
      { type: "spell", ask: { key: "spellPicture" }, word: "carrot", picture: carrot },
      { type: "spell", ask: { key: "spellPicture" }, word: "banana", picture: banana },
    ],
  },
];
