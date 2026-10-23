import type { ColorId, Face, LessonDef, Question, Scene, SceneItem } from "@/types/course";
import { COLOR_ORDER, COLORS, colorBin, potFace } from "@/data/colors";
import * as scenes from "@/data/color-scenes";

const text = (value: string): Face => ({ kind: "text", text: value });

/** Each color's picnic, where its lesson ends with Find. (Its two things
    to paint went with the Paint step — removed on direct request,
    2026-10-23.) */
const SCENES: Record<ColorId, Scene> = {
  red: scenes.redThings,
  blue: scenes.blueThings,
  yellow: scenes.yellowThings,
  green: scenes.greenThings,
  orange: scenes.orangeThings,
  purple: scenes.purpleThings,
  pink: scenes.pinkThings,
  brown: scenes.brownThings,
  black: scenes.blackThings,
  white: scenes.whiteThings,
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

/**
 * One color, one lesson (`edenic-plan.md` §5): watch its reel, meet it (its
 * pot, the word in its own color), spell it, mix it (the three made
 * colors), pop its balloons, then find it in its picnic.
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
