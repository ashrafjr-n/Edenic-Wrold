import type { StaticImageData } from "next/image";
import type { Face, GardenThing, LessonDef } from "@/types/course";
import { MY_GARDEN } from "@/data/my-garden";
import flower from "../../../public/assets/learn/nova/garden/things/garden-flower.png";
import tree from "../../../public/assets/learn/nova/garden/things/garden-tree.png";
import leaf from "../../../public/assets/learn/nova/garden/things/garden-leaf.png";
import grass from "../../../public/assets/learn/nova/garden/things/garden-grass.png";
import nest from "../../../public/assets/learn/nova/garden/things/garden-nest.png";
import bench from "../../../public/assets/learn/nova/garden/things/garden-bench.png";

/** Each thing, in teaching order: its plural ("Find all the trees!") and its
    picture — the videos' look, `render.cjs thing garden-<thing>=garden:<thing>`. */
const THINGS: Record<GardenThing, { things: string; picture: StaticImageData }> = {
  flower: { things: "flowers", picture: flower },
  tree: { things: "trees", picture: tree },
  leaf: { things: "leaves", picture: leaf },
  grass: { things: "grass", picture: grass },
  nest: { things: "nests", picture: nest },
  bench: { things: "benches", picture: bench },
};
const ORDER = Object.keys(THINGS) as GardenThing[];

const REELS = "/assets/learn/nova/garden/reels";

const face = (word: GardenThing): Face => ({ kind: "picture", src: THINGS[word].picture, word });

/**
 * One garden thing, one lesson (the user, 2026-11-08), all in Nova's garden
 * (`data/my-garden.ts`, the videos' candy-pink garden): its reel → the word,
 * the thing itself big on a plinth on the lawn → spell it among letter blocks
 * (2026-11-09: the Find was removed — nothing comes after the spelling).
 */
function thingLesson(word: GardenThing, n: number): LessonDef {
  return {
    reel: `${REELS}/${word}.mp4`,
    cover: [THINGS[word].picture],
    world: MY_GARDEN[n],
    questions: [
      { type: "word", ask: { key: "meetThing", vars: { thing: word } }, word },
      { type: "spell", ask: { key: "spell", vars: { word } }, word },
    ],
  };
}

/** Nova · My Garden. Titles live in `dict.lessons.garden.items`. Reels:
    `tools/reels/encode.sh`, by word. */
export const novaGarden: LessonDef[] = [
  ...ORDER.map((word, i) => thingLesson(word, i + 1)),
  /* The review, no reel, walking the garden: two things named by their word
     (it must be read), then two spelled from the picture alone. */
  {
    cover: [flower, tree, nest, bench],
    world: MY_GARDEN[7],
    questions: [
      { type: "pick", ask: { key: "whichThing", vars: { thing: "tree" } }, word: "tree", plain: true, options: (["leaf", "tree", "grass", "flower"] as const).map(face), answer: 1 },
      { type: "pick", ask: { key: "whichThing", vars: { thing: "nest" } }, word: "nest", plain: true, options: (["nest", "bench", "leaf", "tree"] as const).map(face), answer: 0 },
      { type: "spell", ask: { key: "spellPicture" }, word: "flower", picture: flower },
      { type: "spell", ask: { key: "spellPicture" }, word: "leaf", picture: leaf },
    ],
  },
];
