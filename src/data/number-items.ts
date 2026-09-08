import type { NumberItem } from "@/types/number-item";
import { numberStrokes } from "./number-strokes";

/** 1–9. The journey stops at 9 by design — this lesson is single digits. */
export const NUMBER_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

/** Only the shorts that actually exist. The rest of the numbers are still
    being produced, and an item with no entry here starts the child at the
    tracing step rather than showing an empty video frame. */
const videoIdByValue: Record<number, string> = {
  1: "ROgzR531dzc",
  2: "3OHq7f5UNWM",
  3: "JYlzOrXEki8",
  4: "SjFDQX225vk",
  5: "VjZGrSt9Dr0",
  6: "HF4CutRhKIw",
  7: "o7xHThfPVzc",
  8: "uxALVq9hiwU",
  9: "9eOrHh4bYns",
};

/** The two canvases the numeral renders were exported on. Measured off the
    files, not assumed — see `NumberItem.imageSize` for why anything reads
    this at all. */
const TALL_CANVAS = { width: 412, height: 606 };
const WIDE_CANVAS = { width: 426, height: 585 };

export const numberItems: NumberItem[] = NUMBER_VALUES.map((value) => ({
  value,
  image: `/assets/learn-with-pinki/learn-numbers/numbers/${value}.png`,
  imageSize: value <= 3 ? TALL_CANVAS : WIDE_CANVAS,
  videoId: videoIdByValue[value],
  strokes: numberStrokes[value],
}));

export function findNumberItem(value: number): NumberItem | undefined {
  return numberItems.find((item) => item.value === value);
}
