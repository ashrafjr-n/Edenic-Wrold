import type { StaticImageData } from "next/image";
import type { Face, Group, LessonDef, Question, Thing, Wagon } from "@/types/course";
import { SEASON_BOXES } from "@/data/courses/nova-seasons";
import engine from "../../../public/assets/learn/nova/months/train/engine.png";
import plain from "../../../public/assets/learn/nova/months/train/wagon.png";
import m1 from "../../../public/assets/learn/nova/months/train/month-1.png";
import m2 from "../../../public/assets/learn/nova/months/train/month-2.png";
import m3 from "../../../public/assets/learn/nova/months/train/month-3.png";
import m4 from "../../../public/assets/learn/nova/months/train/month-4.png";
import m5 from "../../../public/assets/learn/nova/months/train/month-5.png";
import m6 from "../../../public/assets/learn/nova/months/train/month-6.png";
import m7 from "../../../public/assets/learn/nova/months/train/month-7.png";
import m8 from "../../../public/assets/learn/nova/months/train/month-8.png";
import m9 from "../../../public/assets/learn/nova/months/train/month-9.png";
import m10 from "../../../public/assets/learn/nova/months/train/month-10.png";
import m11 from "../../../public/assets/learn/nova/months/train/month-11.png";
import m12 from "../../../public/assets/learn/nova/months/train/month-12.png";

/** The twelve months, in order. */
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

/** Each month's wagon on Nova's year train: its number on its side, in its
    season's color, carrying that season's things (the Seasons course's). */
const WAGONS: StaticImageData[] = [m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12];

/** The season each month is in — its wagon's color. */
const SEASON_OF: Group[] = ["winter", "winter", "spring", "spring", "spring", "summer", "summer", "summer", "fall", "fall", "fall", "winter"];

const wagon = (i: number): Wagon => ({ word: MONTHS[i], src: WAGONS[i] });

/** The review's wagons are plain — no number, no season: the name is all
    there is to go by. */
const named = (i: number): Wagon => ({ word: MONTHS[i], src: plain });

/** A month to sort into its season, on a plain wagon, by its name. */
const monthThing = (i: number): Thing => ({ id: MONTHS[i], src: plain, word: MONTHS[i], shape: null, group: SEASON_OF[i], named: true });

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
 * Three months, one lesson: watch the reel, meet each month (its wagon and
 * its name), build the shortest name, then build the train — the three
 * wagons coupled on behind Nova's engine in their order (the order IS what
 * a month lesson teaches).
 */
function quarterLesson(q: number, spell: string): LessonDef {
  const first = q * 3;
  const months = [first, first + 1, first + 2];
  return {
    reel: `/assets/learn/nova/months/reels/${q + 1}.mp4`,
    cover: [WAGONS[first]],
    questions: [
      ...months.map((i): Question => ({ type: "word", ask: { key: "thisMonth", vars: { month: MONTHS[i] } }, word: MONTHS[i], picture: WAGONS[i] })),
      { type: "spell", ask: { key: "spell", vars: { word: spell } }, word: spell },
      { type: "train", ask: { key: "orderMonths" }, engine, wagons: months.map(wagon) },
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
  /* The review, no reel — its exam, on plain wagons (the name alone): one
     month from each lesson onto the train in order, four more into their
     season's island, what comes after December (the year goes round),
     then a name. */
  {
    cover: [m1, m4, m7, m10],
    questions: [
      { type: "train", ask: { key: "orderMonths" }, engine, wagons: [0, 3, 6, 9].map(named) },
      { type: "sort", ask: { key: "sortMonths" }, bins: SEASON_BOXES, items: [1, 4, 7, 10].map(monthThing) },
      after(11, [10, 5]),
      { type: "spell", ask: { key: "spell", vars: { word: "June" } }, word: "June" },
    ],
  },
];
