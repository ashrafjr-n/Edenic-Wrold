import type { StaticImageData } from "next/image";
import type { Animal, ColorId, LessonDef, ShadowPair, SortBin, Thing } from "@/types/course";
import { COLORS } from "@/data/colors";
import cat from "../../../public/assets/learn/bloo/animals/things/cat.png";
import catGrey from "../../../public/assets/learn/bloo/animals/things/cat-grey.png";
import dog from "../../../public/assets/learn/bloo/animals/things/dog.png";
import dogGolden from "../../../public/assets/learn/bloo/animals/things/dog-golden.png";
import fish from "../../../public/assets/learn/bloo/animals/things/fish.png";
import fishBlue from "../../../public/assets/learn/bloo/animals/things/fish-blue.png";
import elephant from "../../../public/assets/learn/bloo/animals/things/elephant.png";
import mouse from "../../../public/assets/learn/bloo/animals/things/mouse.png";
import bird from "../../../public/assets/learn/bloo/animals/things/bird.png";
import parrot from "../../../public/assets/learn/bloo/animals/things/parrot.png";
import turtle from "../../../public/assets/learn/bloo/animals/things/turtle.png";
import gecko from "../../../public/assets/learn/bloo/animals/things/gecko.png";
import catShadow from "../../../public/assets/learn/bloo/animals/shadows/cat.png";
import dogShadow from "../../../public/assets/learn/bloo/animals/shadows/dog.png";
import fishShadow from "../../../public/assets/learn/bloo/animals/shadows/fish.png";
import elephantShadow from "../../../public/assets/learn/bloo/animals/shadows/elephant.png";
import mouseShadow from "../../../public/assets/learn/bloo/animals/shadows/mouse.png";
import birdShadow from "../../../public/assets/learn/bloo/animals/shadows/bird.png";
import parrotShadow from "../../../public/assets/learn/bloo/animals/shadows/parrot.png";
import turtleShadow from "../../../public/assets/learn/bloo/animals/shadows/turtle.png";
import geckoShadow from "../../../public/assets/learn/bloo/animals/shadows/gecko.png";
import catHome from "../../../public/assets/learn/bloo/animals/homes/cat.png";
import dogHome from "../../../public/assets/learn/bloo/animals/homes/dog.png";
import fishHome from "../../../public/assets/learn/bloo/animals/homes/fish.png";

/** One animal to learn: its picture (the lesson's coat — the animal on its
    own, no world behind it, direct request 2026-10-12; cut out of its
    video's still — an animal with no still has no lesson, the cow went
    2026-10-13), a second coat for
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
  fish: { picture: fish, other: fishBlue, home: fishHome, box: "blue" },
};
const ORDER = Object.keys(ANIMALS) as Animal[];

/** The videos' other animals (2026-10-13), cut out of their stills: a
    lesson each, after the three — not in the review's Sort (no home). */
const MORE: Record<string, StaticImageData> = { elephant, mouse, bird, parrot, turtle, gecko };

/** Every lesson's animal and picture, in teaching order. */
const TAUGHT: [string, StaticImageData][] = [...ORDER.map((animal): [string, StaticImageData] => [animal, ANIMALS[animal].picture]), ...Object.entries(MORE)];

/** Each animal's shadow (`crop.py shadows` — its picture, darkened). */
const SHADOWS: Record<string, StaticImageData> = {
  cat: catShadow,
  dog: dogShadow,
  fish: fishShadow,
  elephant: elephantShadow,
  mouse: mouseShadow,
  bird: birdShadow,
  parrot: parrotShadow,
  turtle: turtleShadow,
  gecko: geckoShadow,
};

/** Match the shadow: beside each animal's own shadow, three FAR unlike it
    — never the cat, dog and mouse together (round, eared, alike), never
    the bird beside the parrot, nor the dog beside the turtle or the
    elephant — so a 5-year-old matches shapes, not near twins. */
const UNLIKE: Record<string, readonly [string, string, string]> = {
  cat: ["fish", "elephant", "gecko"],
  dog: ["fish", "bird", "gecko"],
  fish: ["cat", "elephant", "parrot"],
  elephant: ["fish", "bird", "gecko"],
  mouse: ["fish", "parrot", "turtle"],
  bird: ["cat", "elephant", "turtle"],
  parrot: ["dog", "fish", "gecko"],
  turtle: ["cat", "fish", "parrot"],
  gecko: ["elephant", "fish", "bird"],
};

const PICTURES = Object.fromEntries(TAUGHT);
const pair = (animal: string): ShadowPair => ({ word: animal, picture: PICTURES[animal], shadow: SHADOWS[animal] });
/** The demo's animal: the first in teaching order that is not in the step. */
const outsider = (inStep: readonly string[]) => pair(TAUGHT.map(([animal]) => animal).find((animal) => !inStep.includes(animal)) ?? "cat");

/**
 * Bloo's animals — one animal, one lesson: meet it (its picture, its
 * word, its speaker) → build its word → match it and three far unlike it
 * to their shadows (the user's design, 2026-11-01 — choosing inside a
 * lesson is wanted since). (Feed it was removed 2026-10-12, Match the
 * footprints 2026-11-01.)
 */
function animalLesson([animal, picture]: [string, StaticImageData], i: number): LessonDef {
  return {
    reel: `/assets/learn/bloo/animals/reels/${i + 1}.mp4`,
    cover: [picture],
    questions: [
      { type: "word", ask: { key: "meetThing", vars: { thing: animal } }, word: animal, picture, tilt: true },
      { type: "spell", ask: { key: "spell", vars: { word: animal } }, word: animal },
      { type: "shadows", ask: { key: "matchShadows" }, word: animal, animals: [animal, ...UNLIKE[animal]].map(pair), demo: outsider([animal, ...UNLIKE[animal]]) },
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
  ...TAUGHT.map(animalLesson),
  /* The review, no reel: the three animals in both coats into their homes
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
          thing("dog", "other"), thing("fish", "picture"), thing("cat", "other"),
          thing("fish", "other"), thing("dog", "picture"), thing("cat", "picture"),
        ],
      },
      { type: "spell", ask: { key: "spellPicture" }, word: "dog", picture: dogGolden },
      { type: "spell", ask: { key: "spellPicture" }, word: "fish", picture: fishBlue },
    ],
  },
];
