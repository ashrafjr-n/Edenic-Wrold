export type LessonId = "numbers" | "letters" | "colors" | "shapes";

export interface Lesson {
  id: LessonId;
  name: string;
  image: string;
  locked: boolean;
}
