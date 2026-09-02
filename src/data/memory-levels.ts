import type { MemoryFace, MemoryLevel } from "@/types/memory";

/**
 * Every picture a card can wear, and the reason the last levels are harder
 * than the first ones by more than their size.
 *
 * The set splits in two on purpose:
 *
 * - **Plainly different things** — an apple, a dog, a cloud. Two of these
 *   side by side are told apart at a glance, which is what a child learning
 *   the game needs.
 * - **Things that look like each other** — the two balls (the same ball in
 *   two colours), the three letters (the same clay lettering), the three
 *   friends (the same silhouette in three colours). These are the ones that
 *   actually have to be REMEMBERED rather than recognised, and they only
 *   appear from level 7 on.
 *
 * All of them are renders the site already ships; nothing new was drawn for
 * this game.
 */
export const memoryFaces: Record<string, MemoryFace> = {
  apple: { id: "apple", src: "/assets/icons/apple.png", label: "Apple" },
  cat: { id: "cat", src: "/assets/icons/cat.png", label: "Cat" },
  dog: { id: "dog", src: "/assets/icons/dog.png", label: "Dog" },
  rabbit: { id: "rabbit", src: "/assets/icons/rabbit.png", label: "Rabbit" },
  giraffe: { id: "giraffe", src: "/assets/icons/giraffe.png", label: "Giraffe" },
  cloud: { id: "cloud", src: "/assets/icons/cloud.png", label: "Cloud" },
  car: { id: "car", src: "/assets/icons/car-toy.png", label: "Toy car" },
  numbers: { id: "numbers", src: "/assets/icons/123.png", label: "One two three" },
  star: { id: "star", src: "/assets/icons/yellow-star.png", label: "Star" },

  /* The look-alikes. */
  ball: { id: "ball", src: "/assets/icons/ball.png", label: "Pink ball" },
  blueBall: { id: "blueBall", src: "/assets/icons/blue-ball.png", label: "Blue ball" },
  a: { id: "a", src: "/assets/icons/A.png", label: "Letter A" },
  b: { id: "b", src: "/assets/icons/B.png", label: "Letter B" },
  c: { id: "c", src: "/assets/icons/C.png", label: "Letter C" },
  pinki: { id: "pinki", src: "/assets/friends/pinki.png", label: "Pinki" },
  nova: { id: "nova", src: "/assets/friends/nova.png", label: "Nova" },
  bloo: { id: "bloo", src: "/assets/friends/bloo.png", label: "Bloo" },
};

/**
 * The twelve levels.
 *
 * The card count climbs in five steps — 6, 8, 10, 12, 16 — but that is only
 * half of it. Three other things move with it:
 *
 * 1. **The pictures get harder to tell apart.** Levels 1–6 are all plainly
 *    different objects; the look-alikes start at 7 (two balls), reach the
 *    letters at 9, and by 12 the board is three friends, two balls and three
 *    letters with barely a distinct shape on it.
 * 2. **The layout changes.** 6 and 8 and 10 are two long rows; 12 and 16 are
 *    four columns and several rows, which is a different thing to hold in
 *    your head than a line.
 * 3. **The clock tightens.** Time per pair falls across each band — 13s a
 *    pair at level 1, under 10s by level 12 — so the target stays reachable
 *    while asking for a bit more each time.
 *
 * `seconds` is a TARGET, never a limit: passing it costs one star and the
 * child plays on. See `scoreLevel`.
 */
export const memoryLevels: MemoryLevel[] = [
  { value: 1, pairs: 2, cols: 2, seconds: 40, faces: ["apple", "cat"] },
  { value: 2, pairs: 3, cols: 3, seconds: 36, faces: ["dog", "giraffe", "cloud"] },
  {
    value: 3,
    pairs: 4,
    cols: 4,
    seconds: 32,
    faces: ["rabbit", "apple", "numbers", "car"],
  },
  {
    value: 4,
    pairs: 4,
    cols: 4,
    seconds: 30,
    faces: ["cat", "car", "giraffe", "star"],
  },

  {
    value: 5,
    pairs: 6,
    cols: 4,
    seconds: 45,
    faces: ["apple", "dog", "cloud", "rabbit", "numbers", "car"],
  },
  {
    value: 6,
    pairs: 6,
    cols: 4,
    seconds: 40,
    faces: ["numbers", "cat", "giraffe", "car", "star", "cloud"],
  },

  {
    value: 7,
    pairs: 6,
    cols: 4,
    seconds: 55,
    faces: ["apple", "dog", "rabbit", "cloud", "ball", "blueBall"],
  },
  {
    value: 8,
    pairs: 8,
    cols: 4,
    seconds: 50,
    faces: ["cat", "cloud", "giraffe", "car", "numbers", "star", "ball", "blueBall"],
  },

  {
    value: 9,
    pairs: 8,
    cols: 4,
    seconds: 65,
    faces: ["apple", "dog", "car", "star", "cloud", "a", "b", "c"],
  },
  {
    value: 10,
    pairs: 8,
    cols: 4,
    seconds: 60,
    faces: ["rabbit", "cloud", "ball", "blueBall", "a", "b", "pinki", "nova"],
  },

  {
    value: 11,
    pairs: 10,
    cols: 5,
    seconds: 85,
    faces: [
      "apple",
      "cat",
      "dog",
      "star",
      "numbers",
      "ball",
      "blueBall",
      "a",
      "b",
      "pinki",
    ],
  },
  {
    value: 12,
    pairs: 10,
    cols: 5,
    seconds: 75,
    faces: [
      "pinki",
      "nova",
      "bloo",
      "ball",
      "blueBall",
      "a",
      "b",
      "c",
      "apple",
      "cloud",
    ],
  },
];

export function findMemoryLevel(value: number): MemoryLevel | undefined {
  return memoryLevels.find((level) => level.value === value);
}
