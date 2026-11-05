import { SHAPE_STOPS } from "@/data/shape-stops";
import type { CourseStops } from "@/types/course";
import type { LessonId } from "@/types/lesson";

/** The courses that open as a world of stops (`CourseWorld`) instead of the
    friend's board — Shapes on trial (2026-11-05). */
export const COURSE_STOPS: Partial<Record<LessonId, CourseStops>> = {
  shapes: SHAPE_STOPS,
};
