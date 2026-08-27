export type LessonId = "numbers" | "letters" | "colors" | "shapes";

/** A lesson's own color world, worn from `sm` up (see `.lesson-theme`).
    Deliberately independent of the character's accent: the hue says what
    the subject is, so the same four read the same way on every hub. */
export interface LessonTheme {
  accent: string;
  accentDark: string;
  /** The pale tint the lesson's icon tile sits on. */
  soft: string;
}

export interface Lesson {
  id: LessonId;
  name: string;
  /** One line under the lesson name on its card. */
  description: string;
  image: string;
  theme: LessonTheme;
  /** How many items this lesson actually contains — drives the "n / total"
      progress readout on its card. */
  totalItems: number;
  locked: boolean;
}
