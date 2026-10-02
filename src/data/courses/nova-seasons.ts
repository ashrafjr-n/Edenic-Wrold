import type { StaticImageData } from "next/image";
import type { ColorId, Face, Group, LessonDef, SceneItem, SortBin } from "@/types/course";
import { COLORS } from "@/data/colors";
import { seasonPicnic } from "@/data/nova-scenes";
import flower from "../../../public/assets/learn/art/flower.png";
import sun from "../../../public/assets/learn/art/sun.png";
import leaf from "../../../public/assets/learn/art/leaf-orange.png";
import snowman from "../../../public/assets/learn/pinki/colors/paint/snowman.png";

type Season = Extract<Group, "spring" | "summer" | "fall" | "winter">;

/** Each season's sign (its picture everywhere) and its clay color — the
    same colors as the bands on the Months calendars. In order. */
const SEASONS: Record<Season, { picture: StaticImageData; color: ColorId }> = {
  spring: { picture: flower, color: "green" },
  summer: { picture: sun, color: "yellow" },
  fall: { picture: leaf, color: "orange" },
  winter: { picture: snowman, color: "blue" },
};
const ORDER = Object.keys(SEASONS) as Season[];

const face = (season: Season): Face => ({ kind: "picture", src: SEASONS[season].picture, word: season });

/** Two other seasons to choose between: the one before, then the one after. */
const othersFor = (season: Season): Season[] => {
  const at = ORDER.indexOf(season);
  return [ORDER[(at + 3) % 4], ORDER[(at + 1) % 4]];
};

/**
 * One season, one lesson: watch its reel, meet it (its sign and word),
 * spell it, pick it by its word, then find everything that goes with it
 * in the picnic (three of each season's things are there).
 */
function seasonLesson(season: Season, n: number): LessonDef {
  const { picture } = SEASONS[season];
  return {
    reel: `/assets/learn/nova/seasons/reels/${n}.mp4`,
    cover: [picture],
    questions: [
      { type: "word", ask: { key: "thisSeason", vars: { season } }, word: season, picture },
      { type: "spell", ask: { key: "spell", vars: { word: season } }, word: season },
      { type: "pick", ask: { key: "whichSeason", vars: { season } }, word: season, options: [season, ...othersFor(season)].map(face), answer: 0 },
      { type: "find", ask: { key: "findSeason", vars: { season } }, target: { group: season }, scene: seasonPicnic },
    ],
  };
}

/** One thing out of the picnic, for the review's boxes. */
function thing(id: string): SceneItem {
  const item = seasonPicnic.items.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`No ${id} in the season picnic`);
  return item;
}

/** A box per season, in its own clay. */
const BOXES: SortBin[] = ORDER.map((season) => {
  const { face: fill, edge, text } = COLORS[SEASONS[season].color];
  return { target: { group: season }, word: season, face: face(season), tone: { face: fill, edge, text } };
});

/** Nova · The Seasons. Titles live in `dict.lessons.seasons.items`. The
    reels are placeholders until the real clips replace them under the same
    names (`/assets/learn/nova/seasons/reels/<n>.mp4`). */
export const novaSeasons: LessonDef[] = [
  ...ORDER.map((season, i) => seasonLesson(season, i + 1)),
  /* The review, no reel: things into their season's box, the four seasons
     put in order, then two spelled from their sign alone. */
  {
    cover: ORDER.map((season) => SEASONS[season].picture),
    questions: [
      {
        type: "sort",
        ask: { key: "sortSeasons" },
        bins: BOXES,
        items: [thing("snowman1"), thing("flower1"), thing("orangeleaf1"), thing("icecream1"), thing("flower2"), thing("snowman2"), thing("icecream2"), thing("orangeleaf2")],
      },
      { type: "order", ask: { key: "orderSeasons" }, items: ORDER.map(face) },
      { type: "spell", ask: { key: "spellPicture" }, word: "fall", picture: leaf },
      { type: "spell", ask: { key: "spellPicture" }, word: "winter", picture: snowman },
    ],
  },
];
