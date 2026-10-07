import type { RevealScene, Season } from "@/types/course";
import spring0 from "../../public/assets/learn/nova/seasons/spring/0.png";
import spring1 from "../../public/assets/learn/nova/seasons/spring/1.png";
import spring2 from "../../public/assets/learn/nova/seasons/spring/2.png";
import spring3 from "../../public/assets/learn/nova/seasons/spring/3.png";
import spring4 from "../../public/assets/learn/nova/seasons/spring/4.png";
import summer0 from "../../public/assets/learn/nova/seasons/summer/0.png";
import summer1 from "../../public/assets/learn/nova/seasons/summer/1.png";
import summer2 from "../../public/assets/learn/nova/seasons/summer/2.png";
import summer3 from "../../public/assets/learn/nova/seasons/summer/3.png";
import summer4 from "../../public/assets/learn/nova/seasons/summer/4.png";
import fall0 from "../../public/assets/learn/nova/seasons/fall/0.png";
import fall1 from "../../public/assets/learn/nova/seasons/fall/1.png";
import fall2 from "../../public/assets/learn/nova/seasons/fall/2.png";
import fall3 from "../../public/assets/learn/nova/seasons/fall/3.png";
import fall4 from "../../public/assets/learn/nova/seasons/fall/4.png";
import winter0 from "../../public/assets/learn/nova/seasons/winter/0.png";
import winter1 from "../../public/assets/learn/nova/seasons/winter/1.png";
import winter2 from "../../public/assets/learn/nova/seasons/winter/2.png";
import winter3 from "../../public/assets/learn/nova/seasons/winter/3.png";
import winter4 from "../../public/assets/learn/nova/seasons/winter/4.png";

/* Nova's Seasons — rendered by `tools/picnic-scene` (`render.cjs season`
   → `crop.py seasons`, which prints the spots): each season's island and
   its tree before the season comes, then one frame per step (the grass, the
   leaves, the snow…), each with everything before it. All four are cut on
   one box, so the four pictures match. */

/** Each season coming, step by step. */
export const SEASON_SCENES: Record<Season, RevealScene> = {
  spring: { frames: [spring0, spring1, spring2, spring3, spring4], spots: [[27.71, 79.22], [38.14, 33.35], [60.56, 13.4], [80.56, 62.71]] },
  summer: { frames: [summer0, summer1, summer2, summer3, summer4], spots: [[27.71, 79.22], [67.28, 33.35], [47, 21.63], [13.42, 15.03]] },
  fall: { frames: [fall0, fall1, fall2, fall3, fall4], spots: [[27.71, 79.22], [67.28, 33.35], [19.13, 42.31], [78.42, 72.71]] },
  winter: { frames: [winter0, winter1, winter2, winter3, winter4], spots: [[27.71, 76.89], [68.42, 32.2], [19.85, 35.5], [78.42, 59.31]] },
};
