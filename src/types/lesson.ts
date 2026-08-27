export type LessonId = "numbers" | "letters" | "colors" | "shapes";

export interface Lesson {
  id: LessonId;
  name: string;
  /** One line under the lesson name on its card. */
  description: string;
  image: string;
  /** How many items this lesson actually contains — drives the "n / total"
      progress readout on its card. */
  totalItems: number;
  locked: boolean;
}
