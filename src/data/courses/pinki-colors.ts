import type { ColorId, LessonDef, Question, Scene } from "@/types/course";
import { COLOR_ORDER, COLORS } from "@/data/colors";
import * as scenes from "@/data/color-scenes";
import { FOREST, FOREST_FIND } from "@/data/color-forest";

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
 * One color, one lesson (`edenic-plan.md` §5): watch its reel, meet it (the
 * word in its own color, under its splash on the forest's easel), spell it, mix it (the three made
 * colors), pop its balloons, then find it in its picnic — all in Pinki's
 * forest (2026-11-05: the course's world, `data/color-forest.ts`; the
 * picnic lies on the forest floor and the camera tilts down onto it).
 * Every step is about this one color; the others are only there to choose
 * between.
 */
function colorLesson(color: ColorId, n: number): LessonDef {
  const mix = MIXES[color];
  const questions: Question[] = [
    { type: "word", ask: { key: "thisColor", vars: { color } }, word: color, color },
    { type: "spell", ask: { key: "spell", vars: { word: color } }, word: color, color },
  ];
  if (mix) {
    const [a, b] = mix;
    questions.push({
      type: "mix",
      ask: { key: "mix", vars: { a, b } },
      a,
      b,
      color,
      others: othersFor(color, 9).filter((c) => !mix.includes(c)).slice(0, 2),
    });
  }
  questions.push(
    { type: "find", ask: { key: "findColor", vars: { color } }, target: { color }, scene: SCENES[color], world: FOREST_FIND[n] },
  );
  return { reel: `/assets/learn/pinki/colors/reels/${color}.mp4`, cover: [COLORS[color].dot], world: FOREST[n], questions };
}

/** Pinki · Colors. Titles live in `dict.lessons.colors.items`. The reels
    are the real clips, H.264 720p (`tools/reels/encode.sh`):
    `/assets/learn/pinki/colors/reels/<color>.mp4`. */
export const pinkiColors: LessonDef[] = [
  ...COLOR_ORDER.map((color, i) => colorLesson(color, i + 1)),
];
