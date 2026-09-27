import apple from "../../../public/assets/icons/apple.png";
import ball from "../../../public/assets/icons/ball.png";
import type { Face, LessonDef } from "@/types/course";

const text = (value: string): Face => ({ kind: "text", text: value });
const many = (count: number, face: Face): Face[] => Array.from({ length: count }, () => face);

const appleFace: Face = { kind: "picture", src: apple, word: "apple" };
const ballFace: Face = { kind: "picture", src: ball, word: "ball" };

/** "2 🍎 + 1 🍎 = ?" as a row of faces. */
const sum = (a: number, b: number, face: Face): Face[] => [
  ...many(a, face),
  text("+"),
  ...many(b, face),
  text("="),
  text("?"),
];

/** Pinki · Adding (up to 10). Titles live in `dict.lessons.adding.items`; the
    plan for each lesson is `edenic-plan.md` §5. Reels are added as they
    arrive (`/assets/learn/pinki/adding/reels/<n>.mp4`). */
export const pinkiAdding: LessonDef[] = [
  {
    questions: [
      { type: "count", ask: { key: "putIn", vars: { n: 3, item: "apples" } }, item: { src: apple, word: "apple" }, target: 3 },
      { type: "count", ask: { key: "putIn", vars: { n: 4, item: "balls" } }, item: { src: ball, word: "ball" }, target: 4 },
      { type: "pick", ask: { key: "howMany" }, show: sum(2, 1, appleFace), options: [text("2"), text("3"), text("4")], answer: 1 },
      { type: "pick", ask: { key: "howMany" }, show: sum(2, 2, ballFace), options: [text("3"), text("4"), text("5")], answer: 1 },
      { type: "pick", ask: { key: "howMany" }, show: sum(3, 1, appleFace), options: [text("5"), text("4"), text("2")], answer: 1 },
    ],
  },
  { questions: [] },
  { questions: [] },
  { questions: [] },
  { questions: [] },
];
