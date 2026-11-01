import type { StaticImageData } from "next/image";
import type { ColorId, Face, LessonDef, Question, SortBin, Thing, Weather } from "@/types/course";
import { COLORS } from "@/data/colors";
import { WEAR } from "@/data/bloo-wear";
import sunny from "../../../public/assets/learn/bloo/weather/scenes/sunny.png";
import rainy from "../../../public/assets/learn/bloo/weather/scenes/rainy.png";
import windy from "../../../public/assets/learn/bloo/weather/scenes/windy.png";
import snowy from "../../../public/assets/learn/bloo/weather/scenes/snowy.png";
import sunnyBloo from "../../../public/assets/learn/bloo/weather/dressed/sunny.png";
import rainyBloo from "../../../public/assets/learn/bloo/weather/dressed/rainy.png";
import windyBloo from "../../../public/assets/learn/bloo/weather/dressed/windy.png";
import snowyBloo from "../../../public/assets/learn/bloo/weather/dressed/snowy.png";

/** Each weather: its picture — Bloo's hill under it — Bloo himself dressed
    for it (sunglasses, an umbrella, a kite, a woolly hat and scarf — 3D,
    `render.cjs thing bloo-<weather>=bloo:<weather>`) and its review box's
    color. In teaching order. */
const WEATHERS: Record<Weather, { scene: StaticImageData; bloo: StaticImageData; box: ColorId }> = {
  sunny: { scene: sunny, bloo: sunnyBloo, box: "yellow" },
  rainy: { scene: rainy, bloo: rainyBloo, box: "blue" },
  windy: { scene: windy, bloo: windyBloo, box: "green" },
  snowy: { scene: snowy, bloo: snowyBloo, box: "purple" },
};
const ORDER = Object.keys(WEATHERS) as Weather[];

const face = (weather: Weather): Face => ({ kind: "picture", src: WEATHERS[weather].scene, word: weather });
const dressed = (weather: Weather): Face => ({ kind: "picture", src: WEATHERS[weather].bloo, word: weather, full: true });

/**
 * Bloo's weather — one weather, one lesson: meet it (Bloo's hill under
 * it, its word, its speaker) → build its word → read it and pick the Bloo
 * dressed for it, of four (the user's design, 2026-11-01: sunglasses, an
 * umbrella, a kite, a woolly hat; its demo blind). (Make it by hand, the
 * third step from 2026-10-08, was removed 2026-11-01.)
 */
function weatherLesson(weather: Weather, i: number): LessonDef {
  const { scene } = WEATHERS[weather];
  return {
    reel: `/assets/learn/bloo/weather/reels/${i + 1}.mp4`,
    cover: [scene],
    questions: [
      { type: "word", ask: { key: "thisWeather", vars: { weather } }, word: weather, picture: scene },
      { type: "spell", ask: { key: "spell", vars: { word: weather } }, word: weather },
      { type: "pick", ask: { key: "whichWeather", vars: { weather } }, word: weather, plain: true, options: ORDER.map(dressed), answer: i, blind: true },
    ],
  };
}

/** The review's boxes: each weather, its picture on it, its word under. */
const BOXES: SortBin[] = ORDER.map((weather) => {
  const { face: fill, edge, text } = COLORS[WEATHERS[weather].box];
  return { target: { group: weather }, word: weather, face: face(weather), tone: { face: fill, edge, text } };
});

/** Something Bloo wore, to sort into the weather it is for. */
const thing = (weather: Weather, k: 0 | 1): Thing => {
  const { word, src } = WEAR[weather][k];
  return { id: word, src, word, shape: null, group: weather };
};

/** Read the weather's word (one plain ink — it must be read) and tap its
    picture. */
const pick = (weather: Weather): Question => ({
  type: "pick",
  ask: { key: "whichWeather", vars: { weather } },
  word: weather,
  plain: true,
  options: ORDER.map(face),
  answer: ORDER.indexOf(weather),
});

/** Bloo · The Weather. Titles live in `dict.lessons.weather.items`. The
    reels are placeholders until the real clips replace them under the same
    names (`/assets/learn/bloo/weather/reels/<n>.mp4`). */
export const blooWeather: LessonDef[] = [
  ...ORDER.map(weatherLesson),
  /* The review, no reel — its exam, where the weathers are told apart: all
     eight things Bloo wore into the four weathers' boxes (three are hats),
     two weathers picked from their word, two spelled from the picture. */
  {
    cover: ORDER.map((weather) => WEATHERS[weather].scene),
    questions: [
      {
        type: "sort",
        ask: { key: "sortWeather" },
        bins: BOXES,
        items: [thing("rainy", 0), thing("snowy", 1), thing("sunny", 0), thing("windy", 1), thing("snowy", 0), thing("sunny", 1), thing("windy", 0), thing("rainy", 1)],
      },
      pick("rainy"),
      pick("windy"),
      { type: "spell", ask: { key: "spellPicture" }, word: "sunny", picture: sunny },
      { type: "spell", ask: { key: "spellPicture" }, word: "snowy", picture: snowy },
    ],
  },
];
