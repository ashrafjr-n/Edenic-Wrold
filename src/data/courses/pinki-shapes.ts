import type { LessonDef, Scene, ShapeId } from "@/types/course";
import { picnic, rectangles, squares, triangles } from "@/data/scenes";
import { SHAPES } from "@/data/shapes";
import { GARDEN, GARDEN_FIND } from "@/data/shape-garden";
import donut from "../../../public/assets/learn/pinki/shapes/find/donut.png";

/** One shape, one lesson: watch its reel, meet its word, draw it, build its
    word from shuffled letters, then find it on its picnic — all in Pinki's
    shape garden (2026-11-02: the course's world, `data/shape-garden.ts`;
    each lesson in its shape's corner). The picnic lies on the lawn there
    and the camera tilts down onto it for the Find (2026-11-04, on
    request); the picnic's own render is the task button's demo. Its stop
    on the course path wears its shape's thing, unless a clearer one is
    given. */
function shapeLesson(n: number, shape: ShapeId, picnic: Scene, cover = SHAPES[shape].thing.src): LessonDef {
  return {
    reel: `/assets/learn/pinki/shapes/reels/${shape}.mp4`,
    cover: [cover],
    world: GARDEN[n],
    questions: [
      { type: "word", ask: { key: "thisIs", vars: { shape } }, word: shape, shape },
      { type: "trace", ask: { key: "draw", vars: { shape } }, shape },
      { type: "spell", ask: { key: "spell", vars: { word: shape } }, word: shape },
      { type: "find", ask: { key: "findAll", vars: { shape } }, target: { shape }, scene: picnic, world: GARDEN_FIND[n] },
    ],
  };
}

/** Pinki · Shapes. Titles live in `dict.lessons.shapes.items`. The reels
    are the real clips, H.264 720p (`tools/reels/encode.sh`):
    `/assets/learn/pinki/shapes/reels/<shape>.mp4`. */
export const pinkiShapes: LessonDef[] = [
  /* The see-through beach ball is lost at stop size; the donut reads round. */
  shapeLesson(1, "circle", picnic, donut),
  shapeLesson(2, "square", squares),
  shapeLesson(3, "triangle", triangles),
  shapeLesson(4, "rectangle", rectangles),
];
