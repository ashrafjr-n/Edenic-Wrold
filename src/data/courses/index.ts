import type { StaticImageData } from "next/image";
import type { LessonId } from "@/types/lesson";
import type { LessonDef, Question } from "@/types/course";
import { COLORS, EMPTY_POT } from "@/data/colors";
import { SHAPES } from "@/data/shapes";
import { pinkiShapes } from "./pinki-shapes";
import { pinkiColors } from "./pinki-colors";
import { novaFruits } from "./nova-fruits";
import { novaSeasons } from "./nova-seasons";
import { blooAnimals } from "./bloo-animals";
import { blooWeather } from "./bloo-weather";

/** Every course's lessons, by course id. A course's `totalItems` is the
    length of its list here. */
export const courseLessons: Record<LessonId, LessonDef[]> = {
  shapes: pinkiShapes,
  colors: pinkiColors,
  fruits: novaFruits,
  seasons: novaSeasons,
  animals: blooAnimals,
  weather: blooWeather,
};

/** A course's pictures, for its card and banner: every lesson's cover, each
    once, in lesson order. */
export function courseCovers(id: LessonId): StaticImageData[] {
  const bySrc = new Map(courseLessons[id].flatMap((lesson) => lesson.cover).map((c) => [c.src, c]));
  return [...bySrc.values()];
}

/** One lesson as a cell of a course box (`LessonBox`): its picture(s), and
    — for a lesson that meets one word — that word, the color of the ring
    it wears when it is next, and its letters' tone. `blank` is what a
    locked cell shows instead of its pictures (else they show greyed). */
export interface BoxStop {
  pictures: readonly StaticImageData[];
  blank?: StaticImageData;
  /** A review — several covers, no word of its own — takes a full row. */
  review?: boolean;
  word?: string;
  ring?: string;
  letter?: { face: string; edge: string };
}

/** A course's lessons as box cells, read off each lesson's own "meet the
    word" step (its word card) — the review (no such step) wears its covers across a row;
    a lesson not written yet (no such step, one cover) is a plain cell
    under its title. A color still to learn is an empty pot. */
export function courseStops(id: LessonId): BoxStop[] {
  const blank = id === "colors" ? EMPTY_POT : undefined;
  return courseLessons[id].map(({ cover, questions }) => {
    const meets = questions.filter((q): q is Extract<Question, { type: "word" }> => q.type === "word");
    const meet = meets.length === 1 ? meets[0] : undefined;
    if (meet === undefined) return { pictures: cover, blank, review: meets.length === 0 && cover.length > 1 };
    const { word, color, shape } = meet;
    return {
      pictures: cover,
      blank,
      word,
      ring: color ? COLORS[color].face : shape ? SHAPES[shape].color : undefined,
      letter: color ? COLORS[color].letter : undefined,
    };
  });
}
