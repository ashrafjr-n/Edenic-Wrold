import type { StaticImageData } from "next/image";
import type { LessonId } from "@/types/lesson";
import fruitsCarrotPortrait from "../../public/assets/learn/nova/fruits/backdrop/carrot/portrait.jpg";
import fruitsCarrotLandscape from "../../public/assets/learn/nova/fruits/backdrop/carrot/landscape.jpg";
import fruitsBroccoliPortrait from "../../public/assets/learn/nova/fruits/backdrop/broccoli/portrait.jpg";
import fruitsBroccoliLandscape from "../../public/assets/learn/nova/fruits/backdrop/broccoli/landscape.jpg";
import fruitsPotatoPortrait from "../../public/assets/learn/nova/fruits/backdrop/potato/portrait.jpg";
import fruitsPotatoLandscape from "../../public/assets/learn/nova/fruits/backdrop/potato/landscape.jpg";
import fruitsTomatoPortrait from "../../public/assets/learn/nova/fruits/backdrop/tomato/portrait.jpg";
import fruitsTomatoLandscape from "../../public/assets/learn/nova/fruits/backdrop/tomato/landscape.jpg";
import fruitsPepperPortrait from "../../public/assets/learn/nova/fruits/backdrop/pepper/portrait.jpg";
import fruitsPepperLandscape from "../../public/assets/learn/nova/fruits/backdrop/pepper/landscape.jpg";
import fruitsReviewPortrait from "../../public/assets/learn/nova/fruits/backdrop/review/portrait.jpg";
import fruitsReviewLandscape from "../../public/assets/learn/nova/fruits/backdrop/review/landscape.jpg";
import seasonsSpringPortrait from "../../public/assets/learn/nova/seasons/backdrop/spring/portrait.jpg";
import seasonsSpringLandscape from "../../public/assets/learn/nova/seasons/backdrop/spring/landscape.jpg";
import seasonsSummerPortrait from "../../public/assets/learn/nova/seasons/backdrop/summer/portrait.jpg";
import seasonsSummerLandscape from "../../public/assets/learn/nova/seasons/backdrop/summer/landscape.jpg";
import seasonsFallPortrait from "../../public/assets/learn/nova/seasons/backdrop/fall/portrait.jpg";
import seasonsFallLandscape from "../../public/assets/learn/nova/seasons/backdrop/fall/landscape.jpg";
import seasonsWinterPortrait from "../../public/assets/learn/nova/seasons/backdrop/winter/portrait.jpg";
import seasonsWinterLandscape from "../../public/assets/learn/nova/seasons/backdrop/winter/landscape.jpg";
import seasonsReviewPortrait from "../../public/assets/learn/nova/seasons/backdrop/review/portrait.jpg";
import seasonsReviewLandscape from "../../public/assets/learn/nova/seasons/backdrop/review/landscape.jpg";
import animalsCatPortrait from "../../public/assets/learn/bloo/animals/backdrop/cat/portrait.jpg";
import animalsCatLandscape from "../../public/assets/learn/bloo/animals/backdrop/cat/landscape.jpg";
import animalsDogPortrait from "../../public/assets/learn/bloo/animals/backdrop/dog/portrait.jpg";
import animalsDogLandscape from "../../public/assets/learn/bloo/animals/backdrop/dog/landscape.jpg";
import animalsFishPortrait from "../../public/assets/learn/bloo/animals/backdrop/fish/portrait.jpg";
import animalsFishLandscape from "../../public/assets/learn/bloo/animals/backdrop/fish/landscape.jpg";
import animalsElephantPortrait from "../../public/assets/learn/bloo/animals/backdrop/elephant/portrait.jpg";
import animalsElephantLandscape from "../../public/assets/learn/bloo/animals/backdrop/elephant/landscape.jpg";
import animalsMousePortrait from "../../public/assets/learn/bloo/animals/backdrop/mouse/portrait.jpg";
import animalsMouseLandscape from "../../public/assets/learn/bloo/animals/backdrop/mouse/landscape.jpg";
import animalsBirdPortrait from "../../public/assets/learn/bloo/animals/backdrop/bird/portrait.jpg";
import animalsBirdLandscape from "../../public/assets/learn/bloo/animals/backdrop/bird/landscape.jpg";
import animalsParrotPortrait from "../../public/assets/learn/bloo/animals/backdrop/parrot/portrait.jpg";
import animalsParrotLandscape from "../../public/assets/learn/bloo/animals/backdrop/parrot/landscape.jpg";
import animalsTurtlePortrait from "../../public/assets/learn/bloo/animals/backdrop/turtle/portrait.jpg";
import animalsTurtleLandscape from "../../public/assets/learn/bloo/animals/backdrop/turtle/landscape.jpg";
import animalsGeckoPortrait from "../../public/assets/learn/bloo/animals/backdrop/gecko/portrait.jpg";
import animalsGeckoLandscape from "../../public/assets/learn/bloo/animals/backdrop/gecko/landscape.jpg";
import animalsReviewPortrait from "../../public/assets/learn/bloo/animals/backdrop/review/portrait.jpg";
import animalsReviewLandscape from "../../public/assets/learn/bloo/animals/backdrop/review/landscape.jpg";
import weatherSunnyPortrait from "../../public/assets/learn/bloo/weather/backdrop/sunny/portrait.jpg";
import weatherSunnyLandscape from "../../public/assets/learn/bloo/weather/backdrop/sunny/landscape.jpg";
import weatherRainyPortrait from "../../public/assets/learn/bloo/weather/backdrop/rainy/portrait.jpg";
import weatherRainyLandscape from "../../public/assets/learn/bloo/weather/backdrop/rainy/landscape.jpg";
import weatherWindyPortrait from "../../public/assets/learn/bloo/weather/backdrop/windy/portrait.jpg";
import weatherWindyLandscape from "../../public/assets/learn/bloo/weather/backdrop/windy/landscape.jpg";
import weatherSnowyPortrait from "../../public/assets/learn/bloo/weather/backdrop/snowy/portrait.jpg";
import weatherSnowyLandscape from "../../public/assets/learn/bloo/weather/backdrop/snowy/landscape.jpg";
import weatherReviewPortrait from "../../public/assets/learn/bloo/weather/backdrop/review/portrait.jpg";
import weatherReviewLandscape from "../../public/assets/learn/bloo/weather/backdrop/review/landscape.jpg";

/** A lesson's world, one frame per screen orientation. */
export interface Backdrop {
  portrait: StaticImageData;
  landscape: StaticImageData;
}

/** Each course's world behind its lessons (2026-10-13), one per lesson in
    order: a clay render, blurred (`render.cjs backdrop` → `crop.py
    backdrop`). One world per course, and everything in it the lesson's own
    — Vegetables: Nova's garden
    growing the lesson's food; Seasons: the meadow in the season; Animals:
    the videos' pastel world with where the animal lives; Weather: the
    meadow under the weather. Each review: all of its course's. */
export const BACKDROPS: Record<LessonId, Backdrop[]> = {
  /* Pinki's lessons are in her classroom, on her board (2026-10-23). */
  shapes: [],
  colors: [],
  fruits: [
    { portrait: fruitsCarrotPortrait, landscape: fruitsCarrotLandscape },
    { portrait: fruitsBroccoliPortrait, landscape: fruitsBroccoliLandscape },
    { portrait: fruitsPotatoPortrait, landscape: fruitsPotatoLandscape },
    { portrait: fruitsTomatoPortrait, landscape: fruitsTomatoLandscape },
    { portrait: fruitsPepperPortrait, landscape: fruitsPepperLandscape },
    { portrait: fruitsReviewPortrait, landscape: fruitsReviewLandscape },
  ],
  seasons: [
    { portrait: seasonsSpringPortrait, landscape: seasonsSpringLandscape },
    { portrait: seasonsSummerPortrait, landscape: seasonsSummerLandscape },
    { portrait: seasonsFallPortrait, landscape: seasonsFallLandscape },
    { portrait: seasonsWinterPortrait, landscape: seasonsWinterLandscape },
    { portrait: seasonsReviewPortrait, landscape: seasonsReviewLandscape },
  ],
  animals: [
    { portrait: animalsCatPortrait, landscape: animalsCatLandscape },
    { portrait: animalsDogPortrait, landscape: animalsDogLandscape },
    { portrait: animalsFishPortrait, landscape: animalsFishLandscape },
    { portrait: animalsElephantPortrait, landscape: animalsElephantLandscape },
    { portrait: animalsMousePortrait, landscape: animalsMouseLandscape },
    { portrait: animalsBirdPortrait, landscape: animalsBirdLandscape },
    { portrait: animalsParrotPortrait, landscape: animalsParrotLandscape },
    { portrait: animalsTurtlePortrait, landscape: animalsTurtleLandscape },
    { portrait: animalsGeckoPortrait, landscape: animalsGeckoLandscape },
    { portrait: animalsReviewPortrait, landscape: animalsReviewLandscape },
  ],
  weather: [
    { portrait: weatherSunnyPortrait, landscape: weatherSunnyLandscape },
    { portrait: weatherRainyPortrait, landscape: weatherRainyLandscape },
    { portrait: weatherWindyPortrait, landscape: weatherWindyLandscape },
    { portrait: weatherSnowyPortrait, landscape: weatherSnowyLandscape },
    { portrait: weatherReviewPortrait, landscape: weatherReviewLandscape },
  ],
};
