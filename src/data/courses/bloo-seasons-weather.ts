import type { LessonDef, Season, Weather } from "@/types/course";
import { SEASONS_FARM } from "@/data/seasons-farm";

/** Each season and its weather (the user's merge, 2026-11-08: summer → sunny,
    and so on). In teaching order. */
const SEASONS: Record<Season, Weather> = {
  spring: "rainy",
  summer: "sunny",
  fall: "windy",
  winter: "snowy",
};
const SEASON_ORDER = Object.keys(SEASONS) as Season[];

const REELS = "/assets/learn/bloo/seasons-weather/reels";

/**
 * One season and its weather, one lesson, on Bloo's island of the year
 * (`data/seasons-farm.ts`, rebuilt 2026-11-20): the season's reel → its word
 * (written in the sky over the island) → spell it → the weather's reel → the
 * weather rolling in over the SAME island as the camera walks on → its word →
 * spell it. The weather's places stay alive (the rain falls on, `loops`).
 */
function seasonLesson(season: Season, i: number): LessonDef {
  const weather = SEASONS[season];
  const world = SEASONS_FARM[i + 1];
  return {
    reel: `${REELS}/${season}.mp4`,
    midReel: { src: `${REELS}/${weather}.mp4`, at: 2 },
    /* The lesson's two places in its world: the season's word, then the weather's. */
    cover: [world.stations[0].landscape, world.stations[2].landscape],
    world,
    questions: [
      { type: "word", ask: { key: "thisSeason", vars: { season } }, word: season },
      { type: "spell", ask: { key: "spell", vars: { word: season } }, word: season },
      { type: "word", ask: { key: "thisWeather", vars: { weather } }, word: weather },
      { type: "spell", ask: { key: "spell", vars: { word: weather } }, word: weather },
    ],
  };
}

/** Bloo · Seasons and Weather (the course id stays `weather`). Titles live
    in `dict.lessons.weather.items`. Reels: `tools/reels/encode.sh`, by word. */
export const blooSeasonsWeather: LessonDef[] = SEASON_ORDER.map(seasonLesson);
