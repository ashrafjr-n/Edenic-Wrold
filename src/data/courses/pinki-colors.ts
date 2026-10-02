import type { StaticImageData } from "next/image";
import type { ColorId, Face, LessonDef, PaintRound, Question, Scene, SceneItem } from "@/types/course";
import { COLOR_ORDER, COLORS, colorBin, potFace } from "@/data/colors";
import * as scenes from "@/data/color-scenes";
import apple from "../../../public/assets/learn/pinki/colors/paint/apple.png";
import appleBlank from "../../../public/assets/learn/pinki/colors/paint/apple-blank.png";
import fish from "../../../public/assets/learn/pinki/colors/paint/fish.png";
import fishBlank from "../../../public/assets/learn/pinki/colors/paint/fish-blank.png";
import duck from "../../../public/assets/learn/pinki/colors/paint/duck.png";
import duckBlank from "../../../public/assets/learn/pinki/colors/paint/duck-blank.png";
import frog from "../../../public/assets/learn/pinki/colors/paint/frog.png";
import frogBlank from "../../../public/assets/learn/pinki/colors/paint/frog-blank.png";
import carrot from "../../../public/assets/learn/pinki/colors/paint/carrot.png";
import carrotBlank from "../../../public/assets/learn/pinki/colors/paint/carrot-blank.png";
import grapes from "../../../public/assets/learn/pinki/colors/paint/grapes.png";
import grapesBlank from "../../../public/assets/learn/pinki/colors/paint/grapes-blank.png";
import pig from "../../../public/assets/learn/pinki/colors/paint/pig.png";
import pigBlank from "../../../public/assets/learn/pinki/colors/paint/pig-blank.png";
import teddy from "../../../public/assets/learn/pinki/colors/paint/teddy.png";
import teddyBlank from "../../../public/assets/learn/pinki/colors/paint/teddy-blank.png";
import hat from "../../../public/assets/learn/pinki/colors/paint/hat.png";
import hatBlank from "../../../public/assets/learn/pinki/colors/paint/hat-blank.png";
import snowman from "../../../public/assets/learn/pinki/colors/paint/snowman.png";
import snowmanBlank from "../../../public/assets/learn/pinki/colors/paint/snowman-blank.png";
import strawberry from "../../../public/assets/learn/pinki/colors/paint/strawberry.png";
import strawberryBlank from "../../../public/assets/learn/pinki/colors/paint/strawberry-blank.png";
import whale from "../../../public/assets/learn/pinki/colors/paint/whale.png";
import whaleBlank from "../../../public/assets/learn/pinki/colors/paint/whale-blank.png";
import banana from "../../../public/assets/learn/pinki/colors/paint/banana.png";
import bananaBlank from "../../../public/assets/learn/pinki/colors/paint/banana-blank.png";
import pear from "../../../public/assets/learn/pinki/colors/paint/pear.png";
import pearBlank from "../../../public/assets/learn/pinki/colors/paint/pear-blank.png";
import orange from "../../../public/assets/learn/pinki/colors/paint/orange.png";
import orangeBlank from "../../../public/assets/learn/pinki/colors/paint/orange-blank.png";
import eggplant from "../../../public/assets/learn/pinki/colors/paint/eggplant.png";
import eggplantBlank from "../../../public/assets/learn/pinki/colors/paint/eggplant-blank.png";
import iceCream from "../../../public/assets/learn/pinki/colors/paint/icecream.png";
import iceCreamBlank from "../../../public/assets/learn/pinki/colors/paint/icecream-blank.png";
import acorn from "../../../public/assets/learn/pinki/colors/paint/acorn.png";
import acornBlank from "../../../public/assets/learn/pinki/colors/paint/acorn-blank.png";
import ant from "../../../public/assets/learn/pinki/colors/paint/ant.png";
import antBlank from "../../../public/assets/learn/pinki/colors/paint/ant-blank.png";
import sheep from "../../../public/assets/learn/pinki/colors/paint/sheep.png";
import sheepBlank from "../../../public/assets/learn/pinki/colors/paint/sheep-blank.png";

const text = (value: string): Face => ({ kind: "text", text: value });

type Thing = { word: string; blank: StaticImageData; painted: StaticImageData };
const thingOf = (word: string, blank: StaticImageData, painted: StaticImageData): Thing => ({ word, blank, painted });

/** Each color's two things to paint (grey, then painted) and its picnic —
    a lesson paints only its own color (direct request). */
const OF: Record<ColorId, { paint: [Thing, Thing]; scene: Scene }> = {
  red: { paint: [thingOf("apple", appleBlank, apple), thingOf("strawberry", strawberryBlank, strawberry)], scene: scenes.redThings },
  blue: { paint: [thingOf("fish", fishBlank, fish), thingOf("whale", whaleBlank, whale)], scene: scenes.blueThings },
  yellow: { paint: [thingOf("duck", duckBlank, duck), thingOf("banana", bananaBlank, banana)], scene: scenes.yellowThings },
  green: { paint: [thingOf("frog", frogBlank, frog), thingOf("pear", pearBlank, pear)], scene: scenes.greenThings },
  orange: { paint: [thingOf("carrot", carrotBlank, carrot), thingOf("orange", orangeBlank, orange)], scene: scenes.orangeThings },
  purple: { paint: [thingOf("grapes", grapesBlank, grapes), thingOf("eggplant", eggplantBlank, eggplant)], scene: scenes.purpleThings },
  pink: { paint: [thingOf("pig", pigBlank, pig), thingOf("ice cream", iceCreamBlank, iceCream)], scene: scenes.pinkThings },
  brown: { paint: [thingOf("teddy bear", teddyBlank, teddy), thingOf("acorn", acornBlank, acorn)], scene: scenes.brownThings },
  black: { paint: [thingOf("hat", hatBlank, hat), thingOf("ant", antBlank, ant)], scene: scenes.blackThings },
  white: { paint: [thingOf("snowman", snowmanBlank, snowman), thingOf("sheep", sheepBlank, sheep)], scene: scenes.whiteThings },
};

/** The colors that make the secondaries — lessons 4–6 mix them. */
const MIXES: Partial<Record<ColorId, [ColorId, ColorId]>> = {
  green: ["blue", "yellow"],
  orange: ["red", "yellow"],
  purple: ["red", "blue"],
};

/** `count` other colors for a step: the ones learned most recently first
    (spaced review), then ones still to come. */
function othersFor(color: ColorId, count: number): ColorId[] {
  const at = COLOR_ORDER.indexOf(color);
  const learned = COLOR_ORDER.slice(0, at).reverse();
  const coming = COLOR_ORDER.slice(at + 1);
  return [...learned, ...coming].slice(0, count);
}

/** Turns a list so the right one does not always sit in the same place. */
const turn = <T,>(items: T[], by: number): T[] => items.map((_, i) => items[(i + by) % items.length]);

/**
 * One color, one lesson (`edenic-plan.md` §5): watch its reel, meet it (its
 * pot, the word in its own color), spell it, paint two things with it, mix
 * it (the three made colors), pop its balloons, then find it in its picnic.
 * Every step is about this one color; the others are only there to choose
 * between.
 */
function colorLesson(color: ColorId, n: number): LessonDef {
  const mix = MIXES[color];
  const questions: Question[] = [
    { type: "word", ask: { key: "thisColor", vars: { color } }, word: color, color, picture: COLORS[color].pot },
    { type: "spell", ask: { key: "spell", vars: { word: color } }, word: color, color },
    {
      type: "paint",
      ask: { key: "paint" },
      rounds: OF[color].paint.map((thing): PaintRound => ({ color, ...thing })),
      pots: turn([color, ...othersFor(color, 2)], n),
    },
  ];
  if (mix) {
    const [a, b] = mix;
    questions.push({
      type: "pick",
      ask: { key: "mix", vars: { a, b } },
      show: [potFace(a), text("+"), potFace(b), text("="), text("?")],
      options: [color, ...othersFor(color, 9).filter((c) => !mix.includes(c)).slice(0, 2)].map(potFace),
      answer: 0,
    });
  }
  questions.push(
    { type: "pop", ask: { key: "popColor", vars: { color } }, color, others: othersFor(color, 5) },
    { type: "find", ask: { key: "findColor", vars: { color } }, target: { color }, scene: OF[color].scene },
  );
  return { reel: `/assets/learn/pinki/colors/reels/${n}.mp4`, cover: [COLORS[color].pot], questions };
}

/** One thing out of a picnic, for the review's boxes. */
function thing(scene: Scene, id: string): SceneItem {
  const item = scene.items.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`No ${id} in that scene`);
  return item;
}

/** Pinki · Colors. Titles live in `dict.lessons.colors.items`. The reels
    are placeholders until the real clips replace them under the same names
    (`/assets/learn/pinki/colors/reels/<n>.mp4`). */
export const pinkiColors: LessonDef[] = [
  ...COLOR_ORDER.map((color, i) => colorLesson(color, i + 1)),
  /* The review, no reel: things from the picnics into four color boxes,
     a color named by its word (plain letters — it must be read), then two
     colors spelled from the pot alone, with no word on screen. */
  {
    cover: [COLORS.red.pot, COLORS.yellow.pot, COLORS.green.pot, COLORS.purple.pot],
    questions: [
      {
        type: "sort",
        ask: { key: "sortColors" },
        bins: [colorBin("red"), colorBin("yellow"), colorBin("green"), colorBin("purple")],
        items: [
          thing(scenes.redThings, "apple"),
          thing(scenes.yellowThings, "banana"),
          thing(scenes.greenThings, "leaf"),
          thing(scenes.purpleThings, "grapes"),
          thing(scenes.redThings, "cherries"),
          thing(scenes.yellowThings, "star"),
          thing(scenes.greenThings, "frog"),
          thing(scenes.purpleThings, "eggplant"),
        ],
      },
      { type: "pick", ask: { key: "whichColor", vars: { color: "brown" } }, word: "brown", plain: true, options: [potFace("brown"), potFace("orange"), potFace("black"), potFace("pink")], answer: 0 },
      { type: "pick", ask: { key: "whichColor", vars: { color: "orange" } }, word: "orange", plain: true, options: [potFace("purple"), potFace("orange"), potFace("red"), potFace("yellow")], answer: 1 },
      { type: "spell", ask: { key: "spellColor" }, word: "green", picture: COLORS.green.pot },
      { type: "spell", ask: { key: "spellColor" }, word: "pink", picture: COLORS.pink.pot },
    ],
  },
];
