import type { StaticImageData } from "next/image";
import type { LessonId } from "@/types/lesson";
import shapesPortrait from "../../public/assets/learn/pinki/shapes/backdrop/portrait.jpg";
import shapesLandscape from "../../public/assets/learn/pinki/shapes/backdrop/landscape.jpg";

/** A course's world, one frame per screen orientation. */
export interface Backdrop {
  portrait: StaticImageData;
  landscape: StaticImageData;
}

/** Each course's world behind its lessons (2026-10-13): a clay render,
    blurred (`render.cjs backdrop` → `crop.py backdrop`). A course with none
    keeps the plain ground. */
export const BACKDROPS: Partial<Record<LessonId, Backdrop>> = {
  shapes: { portrait: shapesPortrait, landscape: shapesLandscape },
};
