import type { StaticImageData } from "next/image";
import type { LessonId } from "@/types/lesson";
import type { LessonDef, Question } from "@/types/course";
import { EMPTY_DOT } from "@/data/colors";
import { pinkiShapes } from "./pinki-shapes";
import { pinkiColors } from "./pinki-colors";
import { novaFruits } from "./nova-fruits";
import { novaGarden } from "./nova-garden";
import { blooAnimals } from "./bloo-animals";
import { blooSeasonsWeather } from "./bloo-seasons-weather";

/** Every course's lessons, by course id. A course's `totalItems` is the
    length of its list here. */
export const courseLessons: Record<LessonId, LessonDef[]> = {
  shapes: pinkiShapes,
  colors: pinkiColors,
  fruits: novaFruits,
  garden: novaGarden,
  animals: blooAnimals,
  weather: blooSeasonsWeather,
};

/** A course's pictures, for its card and banner: every lesson's cover, each
    once, in lesson order. */
export function courseCovers(id: LessonId): StaticImageData[] {
  const bySrc = new Map(courseLessons[id].flatMap((lesson) => lesson.cover).map((c) => [c.src, c]));
  return [...bySrc.values()];
}

/** One lesson as a cell on the friend's board (`BoardLessons`): its
    picture(s), and — for a lesson that meets one word — that word. `blank`
    is what a locked cell shows instead of its pictures (else they show
    greyed). */
export interface BoxStop {
  pictures: readonly StaticImageData[];
  blank?: StaticImageData;
  word?: string;
}

/** A course's lessons as box cells, read off each lesson's own "meet the
    word" step (its word card); a lesson with none, or with several (a season
    and its weather), is a plain cell under its title. A color still to learn
    is an empty pot. */
export function courseStops(id: LessonId): BoxStop[] {
  const blank = id === "colors" ? EMPTY_DOT : undefined;
  return courseLessons[id].map(({ cover, questions }) => {
    const meets = questions.filter((q): q is Extract<Question, { type: "word" }> => q.type === "word");
    return { pictures: cover, blank, word: meets.length === 1 ? meets[0].word : undefined };
  });
}
