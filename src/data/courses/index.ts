import type { LessonId } from "@/types/lesson";
import type { LessonDef } from "@/types/course";
import { pinkiShapes } from "./pinki-shapes";
import { pinkiAdding } from "./pinki-adding";

/** Every course's lessons, by course id. A course's `totalItems` is the
    length of its list here. */
export const courseLessons: Record<LessonId, LessonDef[]> = {
  shapes: pinkiShapes,
  adding: pinkiAdding,
};
