import type { StaticImageData } from "next/image";
import type { ColorId, Face, LessonDef, Season, SortBin, Thing } from "@/types/course";
import { COLORS } from "@/data/colors";
import { SEASON_SCENES } from "@/data/nova-scenes";
import tulip from "../../../public/assets/learn/nova/seasons/things/tulip.png";
import butterfly from "../../../public/assets/learn/nova/seasons/things/butterfly.png";
import sun from "../../../public/assets/learn/nova/seasons/things/sun.png";
import icecream from "../../../public/assets/learn/nova/seasons/things/icecream.png";
import leaf from "../../../public/assets/learn/nova/seasons/things/maple.png";
import pumpkin from "../../../public/assets/learn/nova/seasons/things/pumpkin.png";
import snowman from "../../../public/assets/learn/nova/seasons/things/snowman.png";
import snowflake from "../../../public/assets/learn/nova/seasons/things/snowflake.png";

/** Each season's clay color — the band round its island, and the color of
    its months' wagons on Nova's year train. In order. */
const COLOR_OF: Record<Season, ColorId> = { spring: "green", summer: "yellow", fall: "orange", winter: "blue" };
const ORDER = Object.keys(COLOR_OF) as Season[];

/** A season's picture everywhere: its island with all of the season there. */
function picture(season: Season): StaticImageData {
  const { frames } = SEASON_SCENES[season];
  return frames[frames.length - 1];
}

const face = (season: Season): Face => ({ kind: "picture", src: picture(season), word: season });

/**
 * One season, one lesson — and every step about IT (the rule since Fruits:
 * no choosing between things inside a one-thing lesson): watch its reel,
 * meet it (its picture, its word, its speaker), build its word, then make
 * it come — tap by tap the season spreads over Nova's tree.
 */
function seasonLesson(season: Season, n: number): LessonDef {
  const full = picture(season);
  return {
    reel: `/assets/learn/nova/seasons/reels/${n}.mp4`,
    cover: [full],
    questions: [
      { type: "word", ask: { key: "thisSeason", vars: { season } }, word: season, picture: full },
      { type: "spell", ask: { key: "spell", vars: { word: season } }, word: season },
      { type: "change", ask: { key: "changeSeason", vars: { season } }, magic: "season", word: season, scene: SEASON_SCENES[season] },
    ],
  };
}

/** The review's things, each alone (`render.cjs thing`), and its season. */
const thing = (word: string, src: StaticImageData, group: Season): Thing => ({ id: word, src, word, shape: null, group });

/** A box per season, in its own clay, its island on it — the Seasons
    review's, and the Months review's. */
export const SEASON_BOXES: SortBin[] = ORDER.map((season) => {
  const { face: fill, edge, text } = COLORS[COLOR_OF[season]];
  return { target: { group: season }, word: season, face: face(season), tone: { face: fill, edge, text } };
});

/** Nova · The Seasons. Titles live in `dict.lessons.seasons.items`. The
    reels are placeholders until the real clips replace them under the same
    names (`/assets/learn/nova/seasons/reels/<n>.mp4`). */
export const novaSeasons: LessonDef[] = [
  ...ORDER.map((season, i) => seasonLesson(season, i + 1)),
  /* The review, no reel — its exam, where the seasons are told apart:
     things into their season's box, the four put in order, then two
     spelled from their picture alone. */
  {
    cover: ORDER.map(picture),
    questions: [
      {
        type: "sort",
        ask: { key: "sortSeasons" },
        bins: SEASON_BOXES,
        items: [
          thing("snowman", snowman, "winter"),
          thing("tulip", tulip, "spring"),
          thing("leaf", leaf, "fall"),
          thing("sun", sun, "summer"),
          thing("butterfly", butterfly, "spring"),
          thing("snowflake", snowflake, "winter"),
          thing("ice cream", icecream, "summer"),
          thing("pumpkin", pumpkin, "fall"),
        ],
      },
      { type: "order", ask: { key: "orderSeasons" }, items: ORDER.map(face) },
      { type: "spell", ask: { key: "spellPicture" }, word: "fall", picture: picture("fall") },
      { type: "spell", ask: { key: "spellPicture" }, word: "winter", picture: picture("winter") },
    ],
  },
];
