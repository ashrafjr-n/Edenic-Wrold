import { ANIMALS_STOPS } from "@/data/animals-stops";
import { COLOR_STOPS } from "@/data/color-stops";
import { GARDEN_STOPS } from "@/data/garden-stops";
import { SHAPE_STOPS } from "@/data/shape-stops";
import { VEG_STOPS } from "@/data/veg-stops";
import { WEATHER_STOPS } from "@/data/weather-stops";
import { CHEST_OPEN } from "@/data/chest-open";
import type { CourseStops } from "@/types/course";
import type { LessonId } from "@/types/lesson";

/** The courses that open as a world of stops (`CourseWorld`) instead of the
    friend's board — Shapes on trial (2026-11-05), Colors and Nova's
    Vegetables the same design (2026-11-06), Nova's My Garden and Bloo's Animals and Seasons and Weather (2026-11-08). */
export const COURSE_STOPS: Partial<Record<LessonId, CourseStops>> = {
  shapes: { ...SHAPE_STOPS, chest: CHEST_OPEN.shapes },
  colors: { ...COLOR_STOPS, chest: CHEST_OPEN.colors },
  fruits: { ...VEG_STOPS, chest: CHEST_OPEN.fruits },
  garden: { ...GARDEN_STOPS, chest: CHEST_OPEN.garden },
  animals: { ...ANIMALS_STOPS, chest: CHEST_OPEN.animals },
  weather: { ...WEATHER_STOPS, chest: CHEST_OPEN.weather },
};
