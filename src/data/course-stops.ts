import { COLOR_STOPS } from "@/data/color-stops";
import { GARDEN_STOPS } from "@/data/garden-stops";
import { SHAPE_STOPS } from "@/data/shape-stops";
import { VEG_STOPS } from "@/data/veg-stops";
import type { CourseStops } from "@/types/course";
import type { LessonId } from "@/types/lesson";

/** The courses that open as a world of stops (`CourseWorld`) instead of the
    friend's board — Shapes on trial (2026-11-05), Colors and Nova's
    Vegetables the same design (2026-11-06), Nova's My Garden (2026-11-08). */
export const COURSE_STOPS: Partial<Record<LessonId, CourseStops>> = {
  shapes: SHAPE_STOPS,
  colors: COLOR_STOPS,
  fruits: VEG_STOPS,
  garden: GARDEN_STOPS,
};
