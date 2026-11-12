import type { StaticImageData } from "next/image";
import type { LessonDef, Season, Weather } from "@/types/course";
import { SEASONS_FARM } from "@/data/seasons-farm";
import spring from "../../../public/assets/learn/nova/seasons/scenes/spring.png";
import summer from "../../../public/assets/learn/nova/seasons/scenes/summer.png";
import fall from "../../../public/assets/learn/nova/seasons/scenes/fall.png";
import winter from "../../../public/assets/learn/nova/seasons/scenes/winter.png";
import sunny from "../../../public/assets/learn/bloo/weather/scenes/sunny.png";
import rainy from "../../../public/assets/learn/bloo/weather/scenes/rainy.png";
import windy from "../../../public/assets/learn/bloo/weather/scenes/windy.png";
import snowy from "../../../public/assets/learn/bloo/weather/scenes/snowy.png";

/** Each season: its weather (the user's merge, 2026-11-08: summer → sunny,
    and so on), and its picture (its island). In teaching order. */
const SEASONS: Record<Season, { weather: Weather; picture: StaticImageData }> = {
  spring: { weather: "rainy", picture: spring },
  summer: { weather: "sunny", picture: summer },
  fall: { weather: "windy", picture: fall },
  winter: { weather: "snowy", picture: winter },
};
const SEASON_ORDER = Object.keys(SEASONS) as Season[];

/** Each weather: its picture (Bloo's hill under it). */
const WEATHERS: Record<Weather, { picture: StaticImageData }> = {
  sunny: { picture: sunny },
  rainy: { picture: rainy },
  windy: { picture: windy },
  snowy: { picture: snowy },
};

const REELS = "/assets/learn/bloo/seasons-weather/reels";

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

/** Bloo · Seasons and Weather (the course id stays `weather`). Titles live
    in `dict.lessons.weather.items`. Reels: `tools/reels/encode.sh`, by word. */
export const blooSeasonsWeather: LessonDef[] = SEASON_ORDER.map(seasonLesson);
