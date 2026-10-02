import type { Face, LessonDef, Scene, SceneItem, ShapeId } from "@/types/course";
import { picnic, rectangles, squares, triangles } from "@/data/scenes";
import { SHAPE_BINS, SHAPES } from "@/data/shapes";
import donut from "../../../public/assets/learn/pinki/shapes/find/donut.png";

const circle: Face = { kind: "shape", shape: "circle" };
const square: Face = { kind: "shape", shape: "square" };
const triangle: Face = { kind: "shape", shape: "triangle" };
const rectangle: Face = { kind: "shape", shape: "rectangle" };

/** One shape, one lesson: watch its reel, meet its word, draw it, build its
    word from shuffled letters, then find it in the world — each shape in
    its own picnic (`edenic-plan.md` §5). Its stop on the course path wears
    the thing the traced shape turns into, unless a clearer one is given. */
function shapeLesson(n: number, shape: ShapeId, scene: Scene, cover = SHAPES[shape].thing.src): LessonDef {
  return {
    reel: `/assets/learn/pinki/shapes/reels/${n}.mp4`,
    cover: [cover],
    questions: [
      { type: "word", ask: { key: "thisIs", vars: { shape } }, word: shape, shape },
      { type: "trace", ask: { key: "draw", vars: { shape } }, shape },
      { type: "spell", ask: { key: "spell", vars: { word: shape } }, word: shape },
      { type: "find", ask: { key: "findAll", vars: { shape } }, target: { shape }, scene },
    ],
  };
}

/** One thing out of a Find scene, for the review's sorting boxes. */
function thing(scene: Scene, id: string): SceneItem {
  const item = scene.items.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`No ${id} in that scene`);
  return item;
}

/** Pinki · Shapes. Titles live in `dict.lessons.shapes.items`. The reels
    are placeholders until the company's clips replace them under the same
    names (`/assets/learn/pinki/shapes/reels/<n>.mp4`). */
export const pinkiShapes: LessonDef[] = [
  /* The see-through beach ball is lost at stop size; the donut reads round. */
  shapeLesson(1, "circle", picnic, donut),
  shapeLesson(2, "square", squares),
  shapeLesson(3, "triangle", triangles),
  shapeLesson(4, "rectangle", rectangles),
  /* The review, all four shapes together: sort things from the four
     picnics into their shapes' boxes, pick the shape a word names (square
     and rectangle — the pair children mix up), then draw one more. Every
     step SHOWS what it is about — nothing depends on hearing the question. */
  {
    cover: [donut, SHAPES.square.thing.src, SHAPES.triangle.thing.src, SHAPES.rectangle.thing.src],
    questions: [
      {
        type: "sort",
        ask: { key: "sortAll" },
        bins: SHAPE_BINS,
        items: [
          thing(picnic, "donut"),
          thing(squares, "gift"),
          thing(triangles, "pizza"),
          thing(rectangles, "chocolate"),
          thing(picnic, "ball"),
          thing(squares, "dice"),
          thing(triangles, "sandwich"),
          thing(rectangles, "juice"),
        ],
      },
      { type: "pick", ask: { key: "whichShape", vars: { shape: "square" } }, word: "square", options: [square, rectangle, circle, triangle], answer: 0 },
      { type: "pick", ask: { key: "whichShape", vars: { shape: "rectangle" } }, word: "rectangle", options: [square, rectangle, triangle, circle], answer: 1 },
      { type: "trace", ask: { key: "draw", vars: { shape: "triangle" } }, shape: "triangle" },
    ],
  },
];
