import type { ColorId, Face, LessonDef, PaintRound, Question, Scene, SceneItem } from "@/types/course";
import { COLORS, colorBin, potFace } from "@/data/colors";
import { pinkThings, purpleThings, redThings, whiteThings, yellowThings } from "@/data/color-scenes";
import apple from "../../../public/assets/learn/pinki/colors/paint/apple.png";
import appleBlank from "../../../public/assets/learn/pinki/colors/paint/apple-blank.png";
import fish from "../../../public/assets/learn/pinki/colors/paint/fish.png";
import fishBlank from "../../../public/assets/learn/pinki/colors/paint/fish-blank.png";
import duck from "../../../public/assets/learn/pinki/colors/paint/duck.png";
import duckBlank from "../../../public/assets/learn/pinki/colors/paint/duck-blank.png";
import frog from "../../../public/assets/learn/pinki/colors/paint/frog.png";
import frogBlank from "../../../public/assets/learn/pinki/colors/paint/frog-blank.png";
import pig from "../../../public/assets/learn/pinki/colors/paint/pig.png";
import pigBlank from "../../../public/assets/learn/pinki/colors/paint/pig-blank.png";
import teddy from "../../../public/assets/learn/pinki/colors/paint/teddy.png";
import teddyBlank from "../../../public/assets/learn/pinki/colors/paint/teddy-blank.png";
import hat from "../../../public/assets/learn/pinki/colors/paint/hat.png";
import hatBlank from "../../../public/assets/learn/pinki/colors/paint/hat-blank.png";
import snowman from "../../../public/assets/learn/pinki/colors/paint/snowman.png";
import snowmanBlank from "../../../public/assets/learn/pinki/colors/paint/snowman-blank.png";

const text = (value: string): Face => ({ kind: "text", text: value });

/** Meet a color (its pot and its word), then spell it straight away. */
const meet = (color: ColorId): Question[] => [
  { type: "word", ask: { key: "thisColor", vars: { color } }, word: color, picture: COLORS[color].pot },
  { type: "spell", ask: { key: "spell", vars: { word: color } }, word: color },
];

/** Read the word, tap its pot, paint the thing — one round per color. */
const paint = (rounds: PaintRound[], pots: ColorId[]): Question => ({ type: "paint", ask: { key: "paint" }, rounds, pots });

/** Find every thing of the color in its picnic. */
const find = (color: ColorId, scene: Scene): Question => ({
  type: "find",
  ask: { key: "findColor", vars: { color } },
  target: { color },
  scene,
});

/** Two pots and a "?": which pot do they make? The answer is listed first. */
const mix = (a: ColorId, b: ColorId, makes: ColorId, others: ColorId[]): Question => ({
  type: "pick",
  ask: { key: "mix", vars: { a, b } },
  show: [potFace(a), text("+"), potFace(b), text("="), text("?")],
  options: [potFace(makes), ...others.map(potFace)],
  answer: 0,
});

/** One thing out of a picnic, for the review's boxes. */
function thing(scene: Scene, id: string): SceneItem {
  const item = scene.items.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`No ${id} in that scene`);
  return item;
}

/** Two colors, one lesson: watch its reel, meet and spell each color, use
    them (paint, or mix), then hunt one of them in a picnic
    (`edenic-plan.md` §5). Its stop on the course path wears both pots. */
function colorLesson(n: number, colors: [ColorId, ColorId], use: Question[], hunt: Question): LessonDef {
  return {
    reel: `/assets/learn/pinki/colors/reels/${n}.mp4`,
    cover: colors.map((color) => COLORS[color].pot),
    questions: [...meet(colors[0]), ...meet(colors[1]), ...use, hunt],
  };
}

/** Pinki · Colors. Titles live in `dict.lessons.colors.items`. The reels
    are placeholders until the real clips replace them under the same names
    (`/assets/learn/pinki/colors/reels/<n>.mp4`). The colors come in the
    order children learn them: the primaries, then what they make. */
export const pinkiColors: LessonDef[] = [
  colorLesson(
    1,
    ["red", "blue"],
    [paint([{ color: "red", blank: appleBlank, painted: apple, word: "apple" }, { color: "blue", blank: fishBlank, painted: fish, word: "fish" }], ["red", "blue", "yellow"])],
    find("red", redThings),
  ),
  colorLesson(
    2,
    ["yellow", "green"],
    [paint([{ color: "yellow", blank: duckBlank, painted: duck, word: "duck" }, { color: "green", blank: frogBlank, painted: frog, word: "frog" }], ["yellow", "green", "red", "blue"])],
    find("yellow", yellowThings),
  ),
  /* Orange and purple are MADE: the primaries from lessons 1–2 mixed. */
  colorLesson(
    3,
    ["orange", "purple"],
    [mix("red", "yellow", "orange", ["green", "purple"]), mix("red", "blue", "purple", ["orange", "green"])],
    find("purple", purpleThings),
  ),
  colorLesson(
    4,
    ["pink", "brown"],
    [paint([{ color: "pink", blank: pigBlank, painted: pig, word: "pig" }, { color: "brown", blank: teddyBlank, painted: teddy, word: "teddy bear" }], ["pink", "brown", "red", "orange"])],
    find("pink", pinkThings),
  ),
  colorLesson(
    5,
    ["black", "white"],
    [paint([{ color: "black", blank: hatBlank, painted: hat, word: "hat" }, { color: "white", blank: snowmanBlank, painted: snowman, word: "snowman" }], ["black", "white", "brown", "blue"])],
    find("white", whiteThings),
  ),
  /* The review, no reel: things from the picnics into four color boxes,
     then a color named by its word, then two colors spelled from the pot
     alone — no word on screen, the spelling ladder's rung 4. */
  {
    cover: [COLORS.red.pot, COLORS.yellow.pot, COLORS.green.pot, COLORS.purple.pot],
    questions: [
      {
        type: "sort",
        ask: { key: "sortColors" },
        bins: [colorBin("red"), colorBin("yellow"), colorBin("green"), colorBin("purple")],
        items: [
          thing(redThings, "apple"),
          thing(yellowThings, "banana"),
          thing(redThings, "pear"),
          thing(purpleThings, "grapes"),
          thing(redThings, "cherries"),
          thing(yellowThings, "star"),
          thing(yellowThings, "frog"),
          thing(purpleThings, "eggplant"),
        ],
      },
      { type: "pick", ask: { key: "whichColor", vars: { color: "brown" } }, word: "brown", options: [potFace("brown"), potFace("orange"), potFace("black"), potFace("pink")], answer: 0 },
      { type: "pick", ask: { key: "whichColor", vars: { color: "orange" } }, word: "orange", options: [potFace("purple"), potFace("orange"), potFace("red"), potFace("yellow")], answer: 1 },
      { type: "spell", ask: { key: "spellColor" }, word: "green", picture: COLORS.green.pot },
      { type: "spell", ask: { key: "spellColor" }, word: "pink", picture: COLORS.pink.pot },
    ],
  },
];
