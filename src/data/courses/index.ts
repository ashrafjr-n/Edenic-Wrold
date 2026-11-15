import type { StaticImageData } from "next/image";
import type { LessonId } from "@/types/lesson";
import type { LessonDef } from "@/types/course";
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
