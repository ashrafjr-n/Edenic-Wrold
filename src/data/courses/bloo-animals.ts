import type { StaticImageData } from "next/image";
import type { Animal, ColorId, Food, LessonDef } from "@/types/course";
import { ANIMALS_FARM } from "@/data/animals-farm";
import cat from "../../../public/assets/learn/bloo/animals/things/cat-play.png";
import catGrey from "../../../public/assets/learn/bloo/animals/things/cat-play-grey.png";
import dog from "../../../public/assets/learn/bloo/animals/things/dog-play.png";
import dogGolden from "../../../public/assets/learn/bloo/animals/things/dog-play-golden.png";
import fish from "../../../public/assets/learn/bloo/animals/things/fish-play.png";
import fishBlue from "../../../public/assets/learn/bloo/animals/things/fish-play-blue.png";
import elephant from "../../../public/assets/learn/bloo/animals/things/elephant.png";
import mouse from "../../../public/assets/learn/bloo/animals/things/mouse-play.png";
import bird from "../../../public/assets/learn/bloo/animals/things/bird-play.png";
import parrot from "../../../public/assets/learn/bloo/animals/things/parrot-play.png";
import turtle from "../../../public/assets/learn/bloo/animals/things/turtle-play.png";
import gecko from "../../../public/assets/learn/bloo/animals/things/gecko-play.png";
import milk from "../../../public/assets/learn/bloo/animals/food/milk.png";
import bone from "../../../public/assets/learn/bloo/animals/food/bone.png";
import fishFood from "../../../public/assets/learn/bloo/animals/food/fish-food.png";
import banana from "../../../public/assets/learn/bloo/animals/food/banana.png";
import cheese from "../../../public/assets/learn/bloo/animals/food/cheese.png";
import worm from "../../../public/assets/learn/bloo/animals/food/worm.png";
import seeds from "../../../public/assets/learn/bloo/animals/food/seeds.png";
import lettuce from "../../../public/assets/learn/bloo/animals/food/lettuce.png";
import cricket from "../../../public/assets/learn/bloo/animals/food/cricket.png";
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

/** Feed the animal: what each eats (its English word and picture). */
const FOOD: Record<string, Food> = {
  milk: { word: "milk", src: milk },
  bone: { word: "bone", src: bone },
  fishFood: { word: "fish food", src: fishFood },
  banana: { word: "banana", src: banana },
  cheese: { word: "cheese", src: cheese },
  worm: { word: "worm", src: worm },
  seeds: { word: "seeds", src: seeds },
  lettuce: { word: "lettuce", src: lettuce },
  cricket: { word: "cricket", src: cricket },
};

/** Each animal's own food, then two it would never eat — no bone for a
    cat's milk, no fruit beside a parrot's seeds, nothing a 5-year-old
    could argue for — and where its mouth is (% of its picture). */
const MEALS: Record<string, { foods: readonly [string, string, string]; mouth: readonly [number, number] }> = {
  cat: { foods: ["milk", "banana", "seeds"], mouth: [34, 41] },
  dog: { foods: ["bone", "seeds", "lettuce"], mouth: [62, 50] },
  fish: { foods: ["fishFood", "bone", "banana"], mouth: [94, 40] },
  elephant: { foods: ["banana", "bone", "cricket"], mouth: [55, 44] },
  mouse: { foods: ["cheese", "bone", "worm"], mouth: [83, 40] },
  bird: { foods: ["worm", "bone", "milk"], mouth: [64, 26] },
  parrot: { foods: ["seeds", "bone", "milk"], mouth: [66, 32] },
  turtle: { foods: ["lettuce", "bone", "milk"], mouth: [88, 65] },
  gecko: { foods: ["cricket", "bone", "cheese"], mouth: [96, 15] },
};

const PICTURES = Object.fromEntries(TAUGHT);

/** The feed demo's animal: the first in teaching order whose food is not
    on the step's paper. */
const feedDemo = (animal: string) => {
  const other = TAUGHT.map(([name]) => name).find((name) => name !== animal && !MEALS[animal].foods.includes(MEALS[name].foods[0])) ?? "dog";
  return { picture: PICTURES[other], mouth: MEALS[other].mouth, food: FOOD[MEALS[other].foods[0]] };
};

/**
 * Bloo's animals — one animal, one lesson: meet it (its picture, its
 * word, its speaker) → build its word → feed it its own food, from three
 * (the user's design, 2026-11-01 — choosing inside a lesson is wanted
 * since). (The old Feed it, three bites and no choice, went 2026-10-12;
 * Match the footprints and Match the shadow 2026-11-01.)
 */
function animalLesson([animal, picture]: [string, StaticImageData], i: number): LessonDef {
  return {
    reel: `/assets/learn/bloo/animals/reels/${animal}.mp4`,
    cover: [picture],
    world: ANIMALS_FARM[i + 1],
    questions: [
      { type: "word", ask: { key: "meetThing", vars: { thing: animal } }, word: animal, picture, tilt: true },
      { type: "spell", ask: { key: "spell", vars: { word: animal } }, word: animal },
      { type: "feed", ask: { key: "feedAnimal", vars: { thing: animal } }, word: animal, picture, mouth: MEALS[animal].mouth, foods: MEALS[animal].foods.map((food) => FOOD[food]), demo: feedDemo(animal) },
    ],
  };
}

/** Bloo · Animals. Titles live in `dict.lessons.animals.items`. The reels
    are the real clips, H.264 720p (`tools/reels/encode.sh`):
    `/assets/learn/bloo/animals/reels/<animal>.mp4`. */
export const blooAnimals: LessonDef[] = [
  ...TAUGHT.map(animalLesson),
];
