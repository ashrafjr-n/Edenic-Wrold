import type { StaticImageData } from "next/image";
import type { ColorId, Face, LessonDef, Season, SortBin, Thing, Weather, WindowView } from "@/types/course";
import { COLORS } from "@/data/colors";
import { WEAR } from "@/data/bloo-wear";
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
import springView from "../../../public/assets/learn/bloo/seasons-weather/window/spring.jpg";
import summerView from "../../../public/assets/learn/bloo/seasons-weather/window/summer.jpg";
import fallView from "../../../public/assets/learn/bloo/seasons-weather/window/fall.jpg";
import winterView from "../../../public/assets/learn/bloo/seasons-weather/window/winter.jpg";
import sunnyView from "../../../public/assets/learn/bloo/seasons-weather/window/sunny.jpg";
import rainyView from "../../../public/assets/learn/bloo/seasons-weather/window/rainy.jpg";
import windyView from "../../../public/assets/learn/bloo/seasons-weather/window/windy.jpg";
import snowyView from "../../../public/assets/learn/bloo/seasons-weather/window/snowy.jpg";

/** Each season: its weather (the user's merge, 2026-11-08: summer → sunny,
    and so on), the two other weathers on the question's circles, its
    picture (its island), its view out of Bloo's window and its clay color
    (the review's box). In teaching order. */
const SEASONS: Record<Season, { weather: Weather; others: [Weather, Weather]; picture: StaticImageData; view: WindowView; box: ColorId }> = {
  spring: { weather: "rainy", others: ["snowy", "sunny"], picture: spring, view: { src: springView, fx: "petals" }, box: "green" },
  summer: { weather: "sunny", others: ["snowy", "rainy"], picture: summer, view: { src: summerView, fx: "glow" }, box: "yellow" },
  fall: { weather: "windy", others: ["snowy", "sunny"], picture: fall, view: { src: fallView, fx: "leaves" }, box: "orange" },
  winter: { weather: "snowy", others: ["sunny", "rainy"], picture: winter, view: { src: winterView, fx: "snow" }, box: "blue" },
};
const SEASON_ORDER = Object.keys(SEASONS) as Season[];

/** Each weather: its picture (Bloo's hill under it), its view out of the
    window — the circles of the question too — and its review box's color. */
const WEATHERS: Record<Weather, { picture: StaticImageData; view: WindowView; box: ColorId }> = {
  sunny: { picture: sunny, view: { src: sunnyView, fx: "glow" }, box: "yellow" },
  rainy: { picture: rainy, view: { src: rainyView, fx: "rain" }, box: "blue" },
  windy: { picture: windy, view: { src: windyView, fx: "wind" }, box: "green" },
  snowy: { picture: snowy, view: { src: snowyView, fx: "snow" }, box: "purple" },
};
const WEATHER_ORDER = Object.keys(WEATHERS) as Weather[];

const REELS = "/assets/learn/bloo/seasons-weather/reels";

const seasonFace = (season: Season): Face => ({ kind: "picture", src: SEASONS[season].picture, word: season });
const weatherFace = (weather: Weather): Face => ({ kind: "picture", src: WEATHERS[weather].picture, word: weather });
/** A circle of the question: the weather's own view, filling it. */
const viewFace = (weather: Weather): Face => ({ kind: "picture", src: WEATHERS[weather].view.src, word: weather });

/**
 * One season and its weather, one lesson (the user's design, 2026-11-08):
 * the season's reel → its word → spell it → "what is the weather in
 * summer?", three round views (its weather + two others, the demo blind) →
 * the weather's reel → its word → spell it. No other activity. In Bloo's
 * round window: the season outside, then the weather after its reel.
 */
function seasonLesson(season: Season): LessonDef {
  const { weather, others, picture, view } = SEASONS[season];
  const options = [weather, ...others];
  return {
    reel: `${REELS}/${season}.mp4`,
    midReel: { src: `${REELS}/${weather}.mp4`, at: 3 },
    cover: [picture, WEATHERS[weather].picture],
    window: { views: [view, WEATHERS[weather].view] },
    questions: [
      { type: "word", ask: { key: "thisSeason", vars: { season } }, word: season, picture },
      { type: "spell", ask: { key: "spell", vars: { word: season } }, word: season },
      { type: "pick", ask: { key: "weatherIn", vars: { season } }, word: season, plain: true, options: options.map(viewFace), answer: 0, blind: true, round: true },
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
  /* The review, no reel, by the window on a summer sky: things into their
     season's box, then what is worn into its weather's, then a season and
     a weather spelled from their picture alone. */
  {
    cover: SEASON_ORDER.map((season) => SEASONS[season].picture),
    window: { views: [{ src: summerView }] },
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
