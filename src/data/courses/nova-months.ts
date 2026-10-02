import type { StaticImageData } from "next/image";
import type { Face, LessonDef, Question } from "@/types/course";
import m1 from "../../../public/assets/learn/nova/months/things/month-1.png";
import m2 from "../../../public/assets/learn/nova/months/things/month-2.png";
import m3 from "../../../public/assets/learn/nova/months/things/month-3.png";
import m4 from "../../../public/assets/learn/nova/months/things/month-4.png";
import m5 from "../../../public/assets/learn/nova/months/things/month-5.png";
import m6 from "../../../public/assets/learn/nova/months/things/month-6.png";
import m7 from "../../../public/assets/learn/nova/months/things/month-7.png";
import m8 from "../../../public/assets/learn/nova/months/things/month-8.png";
import m9 from "../../../public/assets/learn/nova/months/things/month-9.png";
import m10 from "../../../public/assets/learn/nova/months/things/month-10.png";
import m11 from "../../../public/assets/learn/nova/months/things/month-11.png";
import m12 from "../../../public/assets/learn/nova/months/things/month-12.png";

/** The twelve months, in order, each with its calendar page — its number
    big in clay, the band in its season's color. */
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;
const PAGES: StaticImageData[] = [m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12];

/** A month as a tile: its name, to be READ — a month has no picture of
    its own, so the order is the thing learned (`edenic-plan.md` §6.4). */
const name = (i: number): Face => ({ kind: "text", text: MONTHS[i] });

/** "What comes after {month}?" — the next month and two others from
    nearby, the answer first (the tiles are dealt). */
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
 * Three months, one lesson: watch the reel, meet each month (its calendar
 * page and its name), put the three in order, say what comes after the
 * first, then build the shortest name.
 */
function quarterLesson(q: number, spell: string): LessonDef {
  const first = q * 3;
  const months = [first, first + 1, first + 2];
  return {
    reel: `/assets/learn/nova/months/reels/${q + 1}.mp4`,
    cover: [PAGES[first]],
    questions: [
      ...months.map((i): Question => ({ type: "word", ask: { key: "thisMonth", vars: { month: MONTHS[i] } }, word: MONTHS[i], picture: PAGES[i] })),
      { type: "order", ask: { key: "orderMonths" }, items: months.map(name) },
      after(first, [first + 2, (first + 3) % 12]),
      { type: "spell", ask: { key: "spell", vars: { word: spell } }, word: spell },
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
  /* The review, no reel: one month from each lesson put in order, what
     comes after two months (one across a lesson's edge), then a name. */
  {
    cover: [m1, m4, m7, m10],
    questions: [
      { type: "order", ask: { key: "orderMonths" }, items: [0, 3, 6, 9].map(name) },
      after(5, [4, 9]),
      after(10, [0, 9]),
      { type: "spell", ask: { key: "spell", vars: { word: "June" } }, word: "June" },
    ],
  },
];
