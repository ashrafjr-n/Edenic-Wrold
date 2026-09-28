import type { Face, LessonDef, Question, ShapeId } from "@/types/course";
import { picnic } from "@/data/scenes";

const circle: Face = { kind: "shape", shape: "circle" };
const square: Face = { kind: "shape", shape: "square" };
const triangle: Face = { kind: "shape", shape: "triangle" };
const rectangle: Face = { kind: "shape", shape: "rectangle" };

/** One shape, one lesson: watch its reel, meet its word, draw it, build its
    word from shuffled letters, then — where a scene has enough of the shape —
    find it in the world (`edenic-plan.md` §5). */
function shapeLesson(n: number, shape: ShapeId, find?: Question): LessonDef {
  return {
    reel: `/assets/learn/pinki/shapes/reels/${n}.mp4`,
    questions: [
      { type: "word", ask: { key: "thisIs", vars: { shape } }, word: shape, shape },
      { type: "trace", ask: { key: "draw", vars: { shape } }, shape },
      { type: "spell", ask: { key: "spell", vars: { word: shape } }, word: shape },
      ...(find ? [find] : []),
    ],
  };
}

/** Pinki · Shapes. Titles live in `dict.lessons.shapes.items`. The reels
    are placeholders until the company's clips replace them under the same
    names (`/assets/learn/pinki/shapes/reels/<n>.mp4`). */
export const pinkiShapes: LessonDef[] = [
  shapeLesson(1, "circle", {
    type: "find",
    ask: { key: "findAll", vars: { shape: "circle" } },
    shape: "circle",
    scene: picnic,
  }),
  shapeLesson(2, "square"),
  shapeLesson(3, "triangle"),
  shapeLesson(4, "rectangle"),
  {
    questions: [
      { type: "pick", ask: { key: "whichShape", vars: { shape: "circle" } }, options: [circle, square, triangle, rectangle], answer: 0 },
      { type: "pick", ask: { key: "whichShape", vars: { shape: "triangle" } }, options: [square, triangle, rectangle, circle], answer: 1 },
      { type: "pick", ask: { key: "whichShape", vars: { shape: "rectangle" } }, options: [circle, square, rectangle, triangle], answer: 2 },
      { type: "pick", ask: { key: "whichShape", vars: { shape: "square" } }, options: [triangle, rectangle, circle, square], answer: 3 },
    ],
  },
];
