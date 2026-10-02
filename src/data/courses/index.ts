import type { StaticImageData } from "next/image";
import type { LessonId } from "@/types/lesson";
import type { LessonDef } from "@/types/course";
import apple from "../../../public/assets/icons/apple.png";
import blueBall from "../../../public/assets/icons/blue-ball.png";
import cat from "../../../public/assets/icons/cat.png";
import cloud from "../../../public/assets/icons/cloud.png";
import numbers from "../../../public/assets/icons/123.png";
import rabbit from "../../../public/assets/icons/rabbit.png";
import star from "../../../public/assets/icons/yellow-star.png";
import { pinkiShapes } from "./pinki-shapes";

/** A course whose lessons are not written yet: `count` "coming soon"
    lessons, all wearing one placeholder icon until the course's own
    pictures arrive. Titles live in `dict.lessons[id].items`; what goes in
    each lesson is `edenic-plan.md` §5–§7. */
const comingSoon = (count: number, cover: StaticImageData): LessonDef[] =>
  Array.from({ length: count }, () => ({ cover: [cover], questions: [] }));

/** Every course's lessons, by course id. A course's `totalItems` is the
    length of its list here. */
export const courseLessons: Record<LessonId, LessonDef[]> = {
  shapes: pinkiShapes,
  colors: comingSoon(6, blueBall),
  family: comingSoon(5, star),
  fruits: comingSoon(6, apple),
  seasons: comingSoon(5, cloud),
  months: comingSoon(5, numbers),
  animals: comingSoon(6, cat),
  weather: comingSoon(5, cloud),
  body: comingSoon(5, rabbit),
};

/** A course's pictures, for its card and banner: every lesson's cover, each
    once, in lesson order. */
export function courseCovers(id: LessonId): StaticImageData[] {
  const bySrc = new Map(courseLessons[id].flatMap((lesson) => lesson.cover).map((c) => [c.src, c]));
  return [...bySrc.values()];
}
