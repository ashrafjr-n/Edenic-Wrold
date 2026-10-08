import type { StaticImageData } from "next/image";
import type { Ask, ColorId, Face, Gesture, LessonDef, Question, SortBin, Thing, Weather } from "@/types/course";
import { COLORS } from "@/data/colors";
import { WEAR } from "@/data/bloo-wear";
import { WEATHER_MAKING } from "@/data/bloo-skies";
import sunny from "../../../public/assets/learn/bloo/weather/scenes/sunny.png";
import rainy from "../../../public/assets/learn/bloo/weather/scenes/rainy.png";
import windy from "../../../public/assets/learn/bloo/weather/scenes/windy.png";
import snowy from "../../../public/assets/learn/bloo/weather/scenes/snowy.png";

/** Each weather: its picture — Bloo's hill under it — and its review box's
    color. In teaching order. */
const WEATHERS: Record<Weather, { scene: StaticImageData; box: ColorId }> = {
  sunny: { scene: sunny, box: "yellow" },
  rainy: { scene: rainy, box: "blue" },
  windy: { scene: windy, box: "green" },
  snowy: { scene: snowy, box: "purple" },
};
const ORDER = Object.keys(WEATHERS) as Weather[];

const face = (weather: Weather): Face => ({ kind: "picture", src: WEATHERS[weather].scene, word: weather });

/** What to do to make each weather — the step's instruction. */
const MAKE_ASK: Record<Gesture, Ask["key"]> = { tap: "rainTap", push: "sunPush", swipe: "windSwipe", shake: "snowShake" };

/**
 * Bloo's weather — one weather, one lesson, and every step about IT (the
 * one-thing lesson rule): meet it (Bloo's hill under it, its word, its
 * speaker) → build its word → make it by hand on his hill, its own way
 * (tap the cloud, push the clouds off the sun, swipe the sky, shake the
 * cloud — direct request 2026-10-08). Telling the four apart is the
 * review's.
 */
function weatherLesson(weather: Weather, i: number): LessonDef {
  const { scene } = WEATHERS[weather];
  const { gesture, scene: making } = WEATHER_MAKING[weather];
  return {
    reel: `/assets/learn/bloo/weather/reels/${i + 1}.mp4`,
    cover: [scene],
    questions: [
      { type: "word", ask: { key: "thisWeather", vars: { weather } }, word: weather, picture: scene },
      { type: "spell", ask: { key: "spell", vars: { word: weather } }, word: weather },
      { type: "weather", ask: { key: MAKE_ASK[gesture], vars: { weather } }, word: weather, gesture, scene: making },
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
