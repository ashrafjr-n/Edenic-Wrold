import type { StaticImageData } from "next/image";
import type { ColorId, Face, LessonDef, Season, SortBin, Thing, Weather } from "@/types/course";
import { COLORS } from "@/data/colors";
import { WEAR } from "@/data/bloo-wear";
import { SEASONS_FARM } from "@/data/seasons-farm";
import spring from "../../../public/assets/learn/nova/seasons/scenes/spring.png";
import summer from "../../../public/assets/learn/nova/seasons/scenes/summer.png";
import fall from "../../../public/assets/learn/nova/seasons/scenes/fall.png";
import winter from "../../../public/assets/learn/nova/seasons/scenes/winter.png";
import sunny from "../../../public/assets/learn/bloo/weather/scenes/sunny.png";
import rainy from "../../../public/assets/learn/bloo/weather/scenes/rainy.png";
import windy from "../../../public/assets/learn/bloo/weather/scenes/windy.png";
import snowy from "../../../public/assets/learn/bloo/weather/scenes/snowy.png";
import tulip from "../../../public/assets/learn/nova/seasons/things/tulip.png";
import butterfly from "../../../public/assets/learn/nova/seasons/things/butterfly.png";
import sun from "../../../public/assets/learn/nova/seasons/things/sun.png";
import icecream from "../../../public/assets/learn/nova/seasons/things/icecream.png";
import leaf from "../../../public/assets/learn/nova/seasons/things/maple.png";
import pumpkin from "../../../public/assets/learn/nova/seasons/things/pumpkin.png";
import snowman from "../../../public/assets/learn/nova/seasons/things/snowman.png";
import snowflake from "../../../public/assets/learn/nova/seasons/things/snowflake.png";

/** Each season: its weather (the user's merge, 2026-11-08: summer → sunny,
    and so on), its picture (its island) and its clay color
    (the review's box). In teaching order. */
const SEASONS: Record<Season, { weather: Weather; picture: StaticImageData; box: ColorId }> = {
  spring: { weather: "rainy", picture: spring, box: "green" },
  summer: { weather: "sunny", picture: summer, box: "yellow" },
  fall: { weather: "windy", picture: fall, box: "orange" },
  winter: { weather: "snowy", picture: winter, box: "blue" },
};
const SEASON_ORDER = Object.keys(SEASONS) as Season[];

/** Each weather: its picture (Bloo's hill under it) and its review box's color. */
const WEATHERS: Record<Weather, { picture: StaticImageData; box: ColorId }> = {
  sunny: { picture: sunny, box: "yellow" },
  rainy: { picture: rainy, box: "blue" },
  windy: { picture: windy, box: "green" },
  snowy: { picture: snowy, box: "purple" },
};
const WEATHER_ORDER = Object.keys(WEATHERS) as Weather[];

const REELS = "/assets/learn/bloo/seasons-weather/reels";

const seasonFace = (season: Season): Face => ({ kind: "picture", src: SEASONS[season].picture, word: season });
const weatherFace = (weather: Weather): Face => ({ kind: "picture", src: WEATHERS[weather].picture, word: weather });

/**
 * One season and its weather, one lesson (reworked 2026-11-10 — no choosing, the
 * camera is cut, never walked): the season's reel → its word → spell it → the
 * weather's reel straight on → its word → spell it. The rain, snow and wind are
 * painted into the stills and move only in the reel — no live effect to weigh the
 * page down. On Bloo's island of the year (`data/seasons-farm.ts`): the season's
 * word written in the sky over it, then the weather's after its reel.
 */
function seasonLesson(season: Season, i: number): LessonDef {
  const { weather, picture } = SEASONS[season];
  return {
    reel: `${REELS}/${season}.mp4`,
    midReel: { src: `${REELS}/${weather}.mp4`, at: 2 },
    cover: [picture, WEATHERS[weather].picture],
    world: SEASONS_FARM[i + 1],
    questions: [
      { type: "word", ask: { key: "thisSeason", vars: { season } }, word: season, picture },
      { type: "spell", ask: { key: "spell", vars: { word: season } }, word: season },
      { type: "word", ask: { key: "thisWeather", vars: { weather } }, word: weather, picture: WEATHERS[weather].picture },
      { type: "spell", ask: { key: "spell", vars: { word: weather } }, word: weather },
    ],
  };
}

const bin = (word: Season | Weather, face: Face, color: ColorId): SortBin => {
  const { face: fill, edge, text } = COLORS[color];
  return { target: { group: word }, word, face, tone: { face: fill, edge, text } };
};

/** The review's things: one of a season, or something worn for a weather. */
const seasonThing = (word: string, src: StaticImageData, group: Season): Thing => ({ id: word, src, word, shape: null, group });
const wearThing = (weather: Weather, k: 0 | 1): Thing => {
  const { word, src } = WEAR[weather][k];
  return { id: word, src, word, shape: null, group: weather };
};

/** Bloo · Seasons and Weather (the course id stays `weather`). Titles live
    in `dict.lessons.weather.items`. Reels: `tools/reels/encode.sh`, by word. */
export const blooSeasonsWeather: LessonDef[] = [
  ...SEASON_ORDER.map(seasonLesson),
  /* The review, no reel, on the island in summer sun: things into their
     season's box, then what is worn into its weather's, then a season and
     a weather spelled from their picture alone. */
  {
    cover: SEASON_ORDER.map((season) => SEASONS[season].picture),
    world: SEASONS_FARM[SEASON_ORDER.length + 1],
    questions: [
      {
        type: "sort",
        ask: { key: "sortSeasons" },
        bins: SEASON_ORDER.map((season) => bin(season, seasonFace(season), SEASONS[season].box)),
        items: [
          seasonThing("snowman", snowman, "winter"),
          seasonThing("tulip", tulip, "spring"),
          seasonThing("leaf", leaf, "fall"),
          seasonThing("sun", sun, "summer"),
          seasonThing("butterfly", butterfly, "spring"),
          seasonThing("snowflake", snowflake, "winter"),
          seasonThing("ice cream", icecream, "summer"),
          seasonThing("pumpkin", pumpkin, "fall"),
        ],
      },
      {
        type: "sort",
        ask: { key: "sortWeather" },
        bins: WEATHER_ORDER.map((weather) => bin(weather, weatherFace(weather), WEATHERS[weather].box)),
        items: [wearThing("rainy", 0), wearThing("snowy", 1), wearThing("sunny", 0), wearThing("windy", 1), wearThing("snowy", 0), wearThing("sunny", 1), wearThing("windy", 0), wearThing("rainy", 1)],
      },
      { type: "spell", ask: { key: "spellPicture" }, word: "winter", picture: winter },
      { type: "spell", ask: { key: "spellPicture" }, word: "sunny", picture: sunny },
    ],
  },
];
