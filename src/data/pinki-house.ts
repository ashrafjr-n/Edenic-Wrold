import type { StaticImageData } from "next/image";
import type { LessonId } from "@/types/lesson";
import house from "../../public/assets/learn/pinki/house/house.png";
import shapes1 from "../../public/assets/learn/pinki/house/rewards/shapes-1.png";
import shapes1Ghost from "../../public/assets/learn/pinki/house/ghosts/shapes-1.png";
import shapes2 from "../../public/assets/learn/pinki/house/rewards/shapes-2.png";
import shapes2Ghost from "../../public/assets/learn/pinki/house/ghosts/shapes-2.png";
import shapes3 from "../../public/assets/learn/pinki/house/rewards/shapes-3.png";
import shapes3Ghost from "../../public/assets/learn/pinki/house/ghosts/shapes-3.png";
import shapes4 from "../../public/assets/learn/pinki/house/rewards/shapes-4.png";
import shapes4Ghost from "../../public/assets/learn/pinki/house/ghosts/shapes-4.png";
import shapes5 from "../../public/assets/learn/pinki/house/rewards/shapes-5.png";
import shapes5Ghost from "../../public/assets/learn/pinki/house/ghosts/shapes-5.png";
import colors1 from "../../public/assets/learn/pinki/house/rewards/colors-1.png";
import colors1Ghost from "../../public/assets/learn/pinki/house/ghosts/colors-1.png";
import colors2 from "../../public/assets/learn/pinki/house/rewards/colors-2.png";
import colors2Ghost from "../../public/assets/learn/pinki/house/ghosts/colors-2.png";
import colors3 from "../../public/assets/learn/pinki/house/rewards/colors-3.png";
import colors3Ghost from "../../public/assets/learn/pinki/house/ghosts/colors-3.png";
import colors4 from "../../public/assets/learn/pinki/house/rewards/colors-4.png";
import colors4Ghost from "../../public/assets/learn/pinki/house/ghosts/colors-4.png";
import colors5 from "../../public/assets/learn/pinki/house/rewards/colors-5.png";
import colors5Ghost from "../../public/assets/learn/pinki/house/ghosts/colors-5.png";
import colors6 from "../../public/assets/learn/pinki/house/rewards/colors-6.png";
import colors6Ghost from "../../public/assets/learn/pinki/house/ghosts/colors-6.png";
import colors7 from "../../public/assets/learn/pinki/house/rewards/colors-7.png";
import colors7Ghost from "../../public/assets/learn/pinki/house/ghosts/colors-7.png";
import colors8 from "../../public/assets/learn/pinki/house/rewards/colors-8.png";
import colors8Ghost from "../../public/assets/learn/pinki/house/ghosts/colors-8.png";
import colors9 from "../../public/assets/learn/pinki/house/rewards/colors-9.png";
import colors9Ghost from "../../public/assets/learn/pinki/house/ghosts/colors-9.png";
import colors10 from "../../public/assets/learn/pinki/house/rewards/colors-10.png";
import colors10Ghost from "../../public/assets/learn/pinki/house/ghosts/colors-10.png";
import colors11 from "../../public/assets/learn/pinki/house/rewards/colors-11.png";
import colors11Ghost from "../../public/assets/learn/pinki/house/ghosts/colors-11.png";

/** `[left, top, width, height]`, % of the house picture. */
export type HouseBox = readonly [number, number, number, number];

/** One lesson's reward: the patch of the house it changes once earned
    (the thing, its shadow and what is right round it — it lies over the
    house exactly), and the white ghost of the thing that marks its spot
    until then. */
export interface HouseReward {
  picture: StaticImageData;
  box: HouseBox;
  ghost: StaticImageData;
  ghostBox: HouseBox;
}

/** A course's room: its open front (the link), and one reward per lesson,
    lesson 1 first. */
export interface HouseRoom {
  course: LessonId;
  box: HouseBox;
  rewards: readonly HouseReward[];
}

/**
 * Pinki's house, her hub (2026-10-14): a clay dollhouse cut open at the
 * front — the Shapes workshop downstairs (a shape on the shelf per lesson,
 * the review's trophy), the Colors studio upstairs (a paint pot per color,
 * the review's rainbow on the easel) — and a yard on the left where she
 * stands. Rendered by `tools/picnic-scene` (`render.cjs house pinki`, then
 * `crop.py house pinki`, which prints the boxes below).
 */
export const pinkiHouse = {
  picture: house,
  rooms: [
    {
      course: "shapes",
      box: [33.34, 61.33, 56.34, 24.66],
      rewards: [
        { picture: shapes1, box: [49.25, 61.41, 7.53, 9.32], ghost: shapes1Ghost, ghostBox: [49.64, 61.82, 6.75, 8.44] },
        { picture: shapes2, box: [56.13, 61.41, 7.14, 9.08], ghost: shapes2Ghost, ghostBox: [56.52, 61.9, 6.36, 8.12] },
        { picture: shapes3, box: [62.17, 60.77, 8.18, 9.41], ghost: shapes3Ghost, ghostBox: [62.49, 60.93, 7.46, 8.76] },
        { picture: shapes4, box: [68.01, 61.82, 9.54, 8.04], ghost: shapes4Ghost, ghostBox: [68.4, 62.3, 8.76, 7.07] },
        { picture: shapes5, box: [37.44, 67.28, 16.29, 15.43], ghost: shapes5Ghost, ghostBox: [37.83, 67.77, 8.89, 11.41] },
      ],
    },
    {
      course: "colors",
      box: [33.14, 31.81, 56.91, 26.82],
      rewards: [
        { picture: colors1, box: [37.7, 32.23, 6.1, 6.19], ghost: colors1Ghost, ghostBox: [38.09, 32.72, 5.32, 5.23] },
        { picture: colors2, box: [43.48, 32.07, 6.1, 6.19], ghost: colors2Ghost, ghostBox: [43.87, 32.56, 5.32, 5.23] },
        { picture: colors3, box: [49.19, 31.99, 6.1, 6.11], ghost: colors3Ghost, ghostBox: [49.58, 32.48, 5.32, 5.14] },
        { picture: colors4, box: [54.83, 31.91, 6.04, 6.11], ghost: colors4Ghost, ghostBox: [55.22, 32.4, 5.26, 5.14] },
        { picture: colors5, box: [60.48, 31.75, 5.97, 6.11], ghost: colors5Ghost, ghostBox: [60.8, 32.23, 5.26, 5.14] },
        { picture: colors6, box: [37.77, 39.95, 6.1, 6.27], ghost: colors6Ghost, ghostBox: [38.16, 40.43, 5.32, 5.31] },
        { picture: colors7, box: [43.54, 39.79, 6.04, 6.27], ghost: colors7Ghost, ghostBox: [43.93, 40.27, 5.26, 5.31] },
        { picture: colors8, box: [49.19, 39.63, 6.04, 6.27], ghost: colors8Ghost, ghostBox: [49.58, 40.11, 5.26, 5.31] },
        { picture: colors9, box: [54.83, 39.47, 6.04, 6.19], ghost: colors9Ghost, ghostBox: [55.22, 39.95, 5.26, 5.23] },
        { picture: colors10, box: [60.42, 39.31, 5.97, 6.19], ghost: colors10Ghost, ghostBox: [60.8, 39.79, 5.19, 5.23] },
        { picture: colors11, box: [72.55, 38.67, 9.47, 6.51], ghost: colors11Ghost, ghostBox: [72.94, 39.15, 8.7, 5.55] },
      ],
    },
  ] satisfies readonly HouseRoom[],
};
