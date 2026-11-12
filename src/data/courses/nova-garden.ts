import type { StaticImageData } from "next/image";
import type { GardenThing, LessonDef } from "@/types/course";
import { MY_GARDEN } from "@/data/my-garden";
import flower from "../../../public/assets/learn/nova/garden/things/garden-flower.png";
import tree from "../../../public/assets/learn/nova/garden/things/garden-tree.png";
import leaf from "../../../public/assets/learn/nova/garden/things/garden-leaf.png";
import grass from "../../../public/assets/learn/nova/garden/things/garden-grass.png";
import nest from "../../../public/assets/learn/nova/garden/things/garden-nest.png";
import bench from "../../../public/assets/learn/nova/garden/things/garden-bench.png";

/** Each thing's picture, in teaching order — the videos' look, `render.cjs
    thing garden-<thing>=garden:<thing>`. */
const THINGS: Record<GardenThing, StaticImageData> = { flower, tree, leaf, grass, nest, bench };
const ORDER = Object.keys(THINGS) as GardenThing[];

const REELS = "/assets/learn/nova/garden/reels";

/**
 * One garden thing, one lesson (the user, 2026-11-08), all in Nova's garden
 * (`data/my-garden.ts`, the videos' candy-pink garden): its reel → the word,
 * the thing itself big on a plinth on the lawn → spell it among letter blocks
 * (2026-11-09: the Find was removed — nothing comes after the spelling).
 */
function thingLesson(word: GardenThing, n: number): LessonDef {
  return {
    reel: `${REELS}/${word}.mp4`,
    cover: [THINGS[word]],
    world: MY_GARDEN[n],
    questions: [
      { type: "word", ask: { key: "meetThing", vars: { thing: word } }, word },
      { type: "spell", ask: { key: "spell", vars: { word } }, word },
    ],
  };
}

/** Nova · My Garden. Titles live in `dict.lessons.garden.items`. Reels:
    `tools/reels/encode.sh`, by word. */
export const novaGarden: LessonDef[] = ORDER.map((word, i) => thingLesson(word, i + 1));
