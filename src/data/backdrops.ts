import type { StaticImageData } from "next/image";
import type { LessonId } from "@/types/lesson";
import shapesCirclePortrait from "../../public/assets/learn/pinki/shapes/backdrop/circle/portrait.jpg";
import shapesCircleLandscape from "../../public/assets/learn/pinki/shapes/backdrop/circle/landscape.jpg";
import shapesSquarePortrait from "../../public/assets/learn/pinki/shapes/backdrop/square/portrait.jpg";
import shapesSquareLandscape from "../../public/assets/learn/pinki/shapes/backdrop/square/landscape.jpg";
import shapesTrianglePortrait from "../../public/assets/learn/pinki/shapes/backdrop/triangle/portrait.jpg";
import shapesTriangleLandscape from "../../public/assets/learn/pinki/shapes/backdrop/triangle/landscape.jpg";
import shapesRectanglePortrait from "../../public/assets/learn/pinki/shapes/backdrop/rectangle/portrait.jpg";
import shapesRectangleLandscape from "../../public/assets/learn/pinki/shapes/backdrop/rectangle/landscape.jpg";
import shapesReviewPortrait from "../../public/assets/learn/pinki/shapes/backdrop/review/portrait.jpg";
import shapesReviewLandscape from "../../public/assets/learn/pinki/shapes/backdrop/review/landscape.jpg";
import colorsRedPortrait from "../../public/assets/learn/pinki/colors/backdrop/red/portrait.jpg";
import colorsRedLandscape from "../../public/assets/learn/pinki/colors/backdrop/red/landscape.jpg";
import colorsBluePortrait from "../../public/assets/learn/pinki/colors/backdrop/blue/portrait.jpg";
import colorsBlueLandscape from "../../public/assets/learn/pinki/colors/backdrop/blue/landscape.jpg";
import colorsYellowPortrait from "../../public/assets/learn/pinki/colors/backdrop/yellow/portrait.jpg";
import colorsYellowLandscape from "../../public/assets/learn/pinki/colors/backdrop/yellow/landscape.jpg";
import colorsGreenPortrait from "../../public/assets/learn/pinki/colors/backdrop/green/portrait.jpg";
import colorsGreenLandscape from "../../public/assets/learn/pinki/colors/backdrop/green/landscape.jpg";
import colorsOrangePortrait from "../../public/assets/learn/pinki/colors/backdrop/orange/portrait.jpg";
import colorsOrangeLandscape from "../../public/assets/learn/pinki/colors/backdrop/orange/landscape.jpg";
import colorsPurplePortrait from "../../public/assets/learn/pinki/colors/backdrop/purple/portrait.jpg";
import colorsPurpleLandscape from "../../public/assets/learn/pinki/colors/backdrop/purple/landscape.jpg";
import colorsPinkPortrait from "../../public/assets/learn/pinki/colors/backdrop/pink/portrait.jpg";
import colorsPinkLandscape from "../../public/assets/learn/pinki/colors/backdrop/pink/landscape.jpg";
import colorsBrownPortrait from "../../public/assets/learn/pinki/colors/backdrop/brown/portrait.jpg";
import colorsBrownLandscape from "../../public/assets/learn/pinki/colors/backdrop/brown/landscape.jpg";
import colorsBlackPortrait from "../../public/assets/learn/pinki/colors/backdrop/black/portrait.jpg";
import colorsBlackLandscape from "../../public/assets/learn/pinki/colors/backdrop/black/landscape.jpg";
import colorsWhitePortrait from "../../public/assets/learn/pinki/colors/backdrop/white/portrait.jpg";
import colorsWhiteLandscape from "../../public/assets/learn/pinki/colors/backdrop/white/landscape.jpg";
import colorsReviewPortrait from "../../public/assets/learn/pinki/colors/backdrop/review/portrait.jpg";
import colorsReviewLandscape from "../../public/assets/learn/pinki/colors/backdrop/review/landscape.jpg";
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
    — Shapes: Pinki's picnic meadow in the lesson's shape; Colors: her
    meadow and easel in the lesson's color; Vegetables: Nova's garden
    growing the lesson's food; Seasons: the meadow in the season; Animals:
    the videos' pastel world with where the animal lives; Weather: the
    meadow under the weather. Each review: all of its course's. */
export const BACKDROPS: Record<LessonId, Backdrop[]> = {
  shapes: [
    { portrait: shapesCirclePortrait, landscape: shapesCircleLandscape },
    { portrait: shapesSquarePortrait, landscape: shapesSquareLandscape },
    { portrait: shapesTrianglePortrait, landscape: shapesTriangleLandscape },
    { portrait: shapesRectanglePortrait, landscape: shapesRectangleLandscape },
    { portrait: shapesReviewPortrait, landscape: shapesReviewLandscape },
  ],
  colors: [
    { portrait: colorsRedPortrait, landscape: colorsRedLandscape },
    { portrait: colorsBluePortrait, landscape: colorsBlueLandscape },
    { portrait: colorsYellowPortrait, landscape: colorsYellowLandscape },
    { portrait: colorsGreenPortrait, landscape: colorsGreenLandscape },
    { portrait: colorsOrangePortrait, landscape: colorsOrangeLandscape },
    { portrait: colorsPurplePortrait, landscape: colorsPurpleLandscape },
    { portrait: colorsPinkPortrait, landscape: colorsPinkLandscape },
    { portrait: colorsBrownPortrait, landscape: colorsBrownLandscape },
    { portrait: colorsBlackPortrait, landscape: colorsBlackLandscape },
    { portrait: colorsWhitePortrait, landscape: colorsWhiteLandscape },
    { portrait: colorsReviewPortrait, landscape: colorsReviewLandscape },
  ],
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
