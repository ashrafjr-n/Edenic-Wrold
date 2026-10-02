import type { Scene } from "@/types/course";
import ground from "../../public/assets/learn/pinki/family/find/ground.jpg";
import grandpa from "../../public/assets/learn/pinki/family/find/grandpa.png";
import grandma from "../../public/assets/learn/pinki/family/find/grandma.png";
import dad from "../../public/assets/learn/pinki/family/find/dad.png";
import baby from "../../public/assets/learn/pinki/family/find/baby.png";
import mom from "../../public/assets/learn/pinki/family/find/mom.png";
import sister from "../../public/assets/learn/pinki/family/find/sister.png";
import brother from "../../public/assets/learn/pinki/family/find/brother.png";

/** My Family's Find: the whole family in their living room
    (`tools/picnic-scene`, `render.cjs family` → `crop.py family`) —
    grandparents at the back, Dad, Baby and Mom in the middle, Sister and
    Brother in front. Each lesson looks for one of them. Front rows come
    last, so their tap targets lie on top. */
export const familyRoom: Scene = {
  background: ground,
  items: [
    { id: "grandpa", src: grandpa, word: "grandpa", shape: null, person: "grandpa", box: [25.4, 23.6, 30.1, 24.08], hit: [26.0, 24.08, 20.9, 22.72] },
    { id: "grandma", src: grandma, word: "grandma", shape: null, person: "grandma", box: [54.7, 22.88, 29.0, 25.92], hit: [55.3, 23.36, 18.3, 23.44] },
    { id: "dad", src: dad, word: "dad", shape: null, person: "dad", box: [9.2, 41.04, 31.0, 25.84], hit: [9.8, 41.52, 19.4, 24.48] },
    { id: "baby", src: baby, word: "baby", shape: null, person: "baby", box: [38.2, 46.16, 30.1, 21.04], hit: [38.8, 46.64, 22.4, 19.12] },
    { id: "mom", src: mom, word: "mom", shape: null, person: "mom", box: [70.8, 42.08, 29.2, 25.68], hit: [71.4, 42.56, 18.3, 23.44] },
    { id: "sister", src: sister, word: "sister", shape: null, person: "sister", box: [21.6, 63.04, 34.0, 24.48], hit: [22.2, 63.52, 23.4, 21.68] },
    { id: "brother", src: brother, word: "brother", shape: null, person: "brother", box: [55.6, 62.48, 29.8, 23.68], hit: [56.2, 62.96, 19.9, 22.24] },
  ],
};
