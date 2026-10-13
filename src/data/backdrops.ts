import type { StaticImageData } from "next/image";
import type { LessonId } from "@/types/lesson";
import circlePortrait from "../../public/assets/learn/pinki/shapes/backdrop/circle/portrait.jpg";
import circleLandscape from "../../public/assets/learn/pinki/shapes/backdrop/circle/landscape.jpg";
import squarePortrait from "../../public/assets/learn/pinki/shapes/backdrop/square/portrait.jpg";
import squareLandscape from "../../public/assets/learn/pinki/shapes/backdrop/square/landscape.jpg";
import trianglePortrait from "../../public/assets/learn/pinki/shapes/backdrop/triangle/portrait.jpg";
import triangleLandscape from "../../public/assets/learn/pinki/shapes/backdrop/triangle/landscape.jpg";
import rectanglePortrait from "../../public/assets/learn/pinki/shapes/backdrop/rectangle/portrait.jpg";
import rectangleLandscape from "../../public/assets/learn/pinki/shapes/backdrop/rectangle/landscape.jpg";
import reviewPortrait from "../../public/assets/learn/pinki/shapes/backdrop/review/portrait.jpg";
import reviewLandscape from "../../public/assets/learn/pinki/shapes/backdrop/review/landscape.jpg";

/** A lesson's world, one frame per screen orientation. */
export interface Backdrop {
  portrait: StaticImageData;
  landscape: StaticImageData;
}

/** Each course's world behind its lessons (2026-10-13), one per lesson in
    order: a clay render, blurred (`render.cjs backdrop` → `crop.py
    backdrop`). Shapes: the same picnic meadow, everything in it the
    lesson's shape (the review: all four). A course with none keeps the
    plain ground. */
export const BACKDROPS: Partial<Record<LessonId, Backdrop[]>> = {
  shapes: [
    { portrait: circlePortrait, landscape: circleLandscape },
    { portrait: squarePortrait, landscape: squareLandscape },
    { portrait: trianglePortrait, landscape: triangleLandscape },
    { portrait: rectanglePortrait, landscape: rectangleLandscape },
    { portrait: reviewPortrait, landscape: reviewLandscape },
  ],
};
