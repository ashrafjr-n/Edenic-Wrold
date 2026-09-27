import type { Face, LessonDef } from "@/types/course";

const circle: Face = { kind: "shape", shape: "circle" };
const square: Face = { kind: "shape", shape: "square" };
const triangle: Face = { kind: "shape", shape: "triangle" };

/** Pinki · Shapes. Titles live in `dict.lessons.shapes.items`; the plan for
    each lesson is `edenic-plan.md` §5. Reels are added as they arrive
    (`/assets/learn/pinki/shapes/reels/<n>.mp4`). */
export const pinkiShapes: LessonDef[] = [
  {
    questions: [
      { type: "pick", ask: { key: "whichShape", vars: { shape: "circle" } }, options: [circle, square, triangle], answer: 0 },
      { type: "pick", ask: { key: "whichShape", vars: { shape: "square" } }, options: [square, circle, triangle], answer: 0 },
      { type: "pick", ask: { key: "whichShape", vars: { shape: "circle" } }, options: [triangle, circle, square], answer: 1 },
      { type: "trace", ask: { key: "draw", vars: { shape: "circle" } }, shape: "circle" },
      { type: "trace", ask: { key: "draw", vars: { shape: "square" } }, shape: "square" },
    ],
  },
  { questions: [] },
  { questions: [] },
  { questions: [] },
  { questions: [] },
];
