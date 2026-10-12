import type { StaticImageData } from "next/image";
import type { Animal, ColorId, LessonDef, SortBin, Thing } from "@/types/course";
import { COLORS } from "@/data/colors";
import cat from "../../../public/assets/learn/bloo/animals/things/cat.png";
import catGrey from "../../../public/assets/learn/bloo/animals/things/cat-grey.png";
import dog from "../../../public/assets/learn/bloo/animals/things/dog.png";
import dogGolden from "../../../public/assets/learn/bloo/animals/things/dog-golden.png";
import cow from "../../../public/assets/learn/bloo/animals/things/cow.png";
import cowBrown from "../../../public/assets/learn/bloo/animals/things/cow-brown.png";
import fish from "../../../public/assets/learn/bloo/animals/things/fish.png";
import fishBlue from "../../../public/assets/learn/bloo/animals/things/fish-blue.png";
import catHome from "../../../public/assets/learn/bloo/animals/homes/cat.png";
import dogHome from "../../../public/assets/learn/bloo/animals/homes/dog.png";
import cowHome from "../../../public/assets/learn/bloo/animals/homes/cow.png";
import fishHome from "../../../public/assets/learn/bloo/animals/homes/fish.png";

/** One animal to learn: its picture (the lesson's coat — the animal on its
    own, no world behind it, direct request 2026-10-12), a second coat for
    the review (a cat is a cat in any color), where it lives, and that
    home's box color in the review. */
interface Pet {
  picture: StaticImageData;
  other: StaticImageData;
  home: StaticImageData;
  box: ColorId;
}

/** In teaching order. */
const ANIMALS: Record<Animal, Pet> = {
  cat: { picture: cat, other: catGrey, home: catHome, box: "purple" },
  dog: { picture: dog, other: dogGolden, home: dogHome, box: "orange" },
  cow: { picture: cow, other: cowBrown, home: cowHome, box: "red" },
  fish: { picture: fish, other: fishBlue, home: fishHome, box: "blue" },
};
const ORDER = Object.keys(ANIMALS) as Animal[];

/**
 * Bloo's animals — one animal, one lesson, and every step about IT (the
 * Fruits rule: no choosing inside a one-thing lesson): meet it (its
 * picture, its word, its speaker) → build its word. Telling the four
 * apart is the review's. (Feed it, the third step, was removed 2026-10-12.)
 */
function animalLesson(animal: Animal, i: number): LessonDef {
  const { picture } = ANIMALS[animal];
  return {
    reel: `/assets/learn/bloo/animals/reels/${i + 1}.mp4`,
    cover: [picture],
    questions: [
      { type: "word", ask: { key: "meetThing", vars: { thing: animal } }, word: animal, picture },
      { type: "spell", ask: { key: "spell", vars: { word: animal } }, word: animal },
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
      { type: "spell", ask: { key: "spellPicture" }, word: "dog", picture: dogGolden },
      { type: "spell", ask: { key: "spellPicture" }, word: "fish", picture: fishBlue },
    ],
  },
];
