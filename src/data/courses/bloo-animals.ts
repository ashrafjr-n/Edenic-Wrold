import type { StaticImageData } from "next/image";
import type { Animal, ColorId, LessonDef, SortBin, Thing } from "@/types/course";
import { COLORS } from "@/data/colors";
import cat from "../../../public/assets/learn/bloo/animals/things/cat.png";
import catGrey from "../../../public/assets/learn/bloo/animals/things/cat-grey.png";
import dog from "../../../public/assets/learn/bloo/animals/things/dog.png";
import dogSpotty from "../../../public/assets/learn/bloo/animals/things/dog-spotty.png";
import cow from "../../../public/assets/learn/bloo/animals/things/cow.png";
import cowBrown from "../../../public/assets/learn/bloo/animals/things/cow-brown.png";
import fish from "../../../public/assets/learn/bloo/animals/things/fish.png";
import fishBlue from "../../../public/assets/learn/bloo/animals/things/fish-blue.png";
import milk from "../../../public/assets/learn/bloo/animals/food/milk.png";
import bone from "../../../public/assets/learn/bloo/animals/food/bone.png";
import grass from "../../../public/assets/learn/bloo/animals/food/grass.png";
import pellets from "../../../public/assets/learn/bloo/animals/food/pellets.png";
import catHome from "../../../public/assets/learn/bloo/animals/homes/cat.png";
import dogHome from "../../../public/assets/learn/bloo/animals/homes/dog.png";
import cowHome from "../../../public/assets/learn/bloo/animals/homes/cow.png";
import fishHome from "../../../public/assets/learn/bloo/animals/homes/fish.png";

/** One animal to learn: its picture (the lesson's coat), a second coat for
    the review (a cat is a cat in any color), a bite of what it eats and
    where its mouth is on its picture (%, measured off the render's face
    mask) for the Feed step, where it lives, and that home's box color in
    the review. */
interface Pet {
  picture: StaticImageData;
  other: StaticImageData;
  food: StaticImageData;
  mouth: readonly [number, number];
  home: StaticImageData;
  box: ColorId;
}

/** In teaching order. */
const ANIMALS: Record<Animal, Pet> = {
  cat: { picture: cat, other: catGrey, food: milk, mouth: [39, 49], home: catHome, box: "purple" },
  dog: { picture: dog, other: dogSpotty, food: bone, mouth: [36, 53], home: dogHome, box: "orange" },
  cow: { picture: cow, other: cowBrown, food: grass, mouth: [38, 56], home: cowHome, box: "red" },
  fish: { picture: fish, other: fishBlue, food: pellets, mouth: [70, 76], home: fishHome, box: "blue" },
};
const ORDER = Object.keys(ANIMALS) as Animal[];

/**
 * Bloo's animals — one animal, one lesson, and every step about IT (the
 * Fruits rule: no choosing inside a one-thing lesson): meet it (its
 * picture, its word, its speaker) → build its word → feed it (its own
 * food, a bite at a time — something you DO with an animal). Telling the
 * four apart is the review's.
 */
function animalLesson(animal: Animal, i: number): LessonDef {
  const { picture, food, mouth } = ANIMALS[animal];
  return {
    reel: `/assets/learn/bloo/animals/reels/${i + 1}.mp4`,
    cover: [picture],
    questions: [
      { type: "word", ask: { key: "meetThing", vars: { thing: animal } }, word: animal, picture },
      { type: "spell", ask: { key: "spell", vars: { word: animal } }, word: animal },
      { type: "feed", ask: { key: "feedAnimal", vars: { thing: animal } }, word: animal, picture, food, mouth },
    ],
  };
}

/** The review's boxes: each animal's home, labelled with its word. */
const HOMES: SortBin[] = ORDER.map((animal) => {
  const { home, box } = ANIMALS[animal];
  const { face, edge, text } = COLORS[box];
  return { target: { group: animal }, word: animal, face: { kind: "picture", src: home, word: `${animal}'s home` }, tone: { face, edge, text } };
});

const thing = (animal: Animal, coat: "picture" | "other"): Thing => ({
  id: `${animal}-${coat}`,
  src: ANIMALS[animal][coat],
  word: animal,
  shape: null,
  group: animal,
});

/** Bloo · Animals. Titles live in `dict.lessons.animals.items`. The reels
    are placeholders until the real clips replace them under the same names
    (`/assets/learn/bloo/animals/reels/<n>.mp4`). */
export const blooAnimals: LessonDef[] = [
  ...ORDER.map(animalLesson),
  /* The review, no reel: the four animals in both coats into their homes
     (each box says whose it is), then two words spelled from the picture
     alone — in the coat the lessons did not show. */
  {
    cover: ORDER.map((animal) => ANIMALS[animal].picture),
    questions: [
      {
        type: "sort",
        ask: { key: "sortAnimals" },
        bins: HOMES,
        items: [
          thing("dog", "other"), thing("fish", "picture"), thing("cat", "other"), thing("cow", "picture"),
          thing("fish", "other"), thing("dog", "picture"), thing("cow", "other"), thing("cat", "picture"),
        ],
      },
      { type: "spell", ask: { key: "spellPicture" }, word: "dog", picture: dogSpotty },
      { type: "spell", ask: { key: "spellPicture" }, word: "fish", picture: fishBlue },
    ],
  },
];
