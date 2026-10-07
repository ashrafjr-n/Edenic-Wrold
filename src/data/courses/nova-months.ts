import type { Face, LessonDef, Question, Season, Thing } from "@/types/course";
import { SEASON_BOXES } from "@/data/courses/nova-seasons";
import { WHEEL_MARK, WHEEL_ONLY, WHEEL_SPOTS, WHEEL_UPTO } from "@/data/nova-wheel";

/** The twelve months, in order. */
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

/** The season each month is in — its slice's color on the wheel. */
const SEASON_OF: Season[] = ["winter", "winter", "spring", "spring", "spring", "summer", "summer", "summer", "fall", "fall", "fall", "winter"];

/** A month to sort into its season: its slice marked on the wheel, its
    name under it — no season color to go by. */
const monthThing = (i: number): Thing => ({ id: MONTHS[i], src: WHEEL_MARK[i + 1], word: MONTHS[i], shape: null, group: SEASON_OF[i], named: true });

/** A month as a tile: its name, to be READ. */
const name = (i: number): Face => ({ kind: "text", text: MONTHS[i] });

/** "What comes after {month}?" — the next month and two others, the
    answer first (the tiles are dealt). */
function after(i: number, others: [number, number]): Question {
  return {
    type: "pick",
    ask: { key: "afterMonth", vars: { month: MONTHS[i] } },
    word: MONTHS[i],
    options: [name((i + 1) % 12), name(others[0]), name(others[1])],
    answer: 0,
  };
}

/**
 * Three months, one lesson, on Nova's year wheel (direct request
 * 2026-10-07 — the train was "all bad"): watch the reel, meet each month
 * (its slice alone on the wheel, its name), build the shortest name, then
 * add the three to the year — each tap fills the next slice in its
 * season's color. The wheel keeps the earlier lessons' months, so by the
 * fourth lesson the whole year is round, and December runs into January.
 */
function quarterLesson(q: number, spell: string): LessonDef {
  const first = q * 3;
  const months = [first, first + 1, first + 2];
  return {
    reel: `/assets/learn/nova/months/reels/${q + 1}.mp4`,
    cover: [WHEEL_ONLY[first]],
    questions: [
      ...months.map((i): Question => ({ type: "word", ask: { key: "thisMonth", vars: { month: MONTHS[i] } }, word: MONTHS[i], picture: WHEEL_ONLY[i] })),
      { type: "spell", ask: { key: "spell", vars: { word: spell } }, word: spell },
      {
        type: "change",
        ask: { key: "addMonths" },
        magic: "year",
        word: MONTHS[first + 2],
        words: months.map((i) => MONTHS[i]),
        scene: { frames: WHEEL_UPTO.slice(first, first + 4), spots: WHEEL_SPOTS.slice(first, first + 3) },
      },
    ],
  };
}

/** Nova · Months of the Year. Titles live in `dict.lessons.months.items`.
    The reels are placeholders until the real clips replace them under the
    same names (`/assets/learn/nova/months/reels/<n>.mp4`). */
export const novaMonths: LessonDef[] = [
  quarterLesson(0, "March"),
  quarterLesson(1, "May"),
  quarterLesson(2, "July"),
  quarterLesson(3, "October"),
  /* The review, no reel — its exam: one month from each lesson in order
     (the names alone), four more into their season's island (each marked
     on a plain wheel, so its place in the year is the clue, not a color),
     what comes after December (the year goes round), then a name — with
     its word shown: a slice alone is too small a picture to spell from. */
  {
    cover: [WHEEL_UPTO[12]],
    questions: [
      { type: "order", ask: { key: "orderMonths" }, items: [0, 3, 6, 9].map(name) },
      { type: "sort", ask: { key: "sortMonths" }, bins: SEASON_BOXES, items: [1, 4, 7, 10].map(monthThing) },
      after(11, [10, 5]),
      { type: "spell", ask: { key: "spell", vars: { word: "June" } }, word: "June" },
    ],
  },
];
