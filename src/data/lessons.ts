import type { CharacterId } from "@/types/character";
import type { Lesson } from "@/types/lesson";

/** Each character's courses. `name`/`description` and the lesson titles are
    translated content — see `dict.lessons` in the dictionaries, not this file.
    The two card images are placeholders (Pinki holding shapes / numbers) until
    the course art arrives; the new files replace them under the same names. */
export const lessonsByCharacter: Record<CharacterId, Lesson[]> = {
  pinki: [
    {
      id: "shapes",
      image: "/assets/learn/pinki/course-shapes.png",
      theme: {
        accent: "var(--color-subject-shapes)",
        accentDark: "var(--color-subject-shapes-dark)",
      },
      totalItems: 5,
      locked: false,
    },
    {
      id: "adding",
      image: "/assets/learn/pinki/course-adding.png",
      theme: {
        accent: "var(--color-subject-numbers)",
        accentDark: "var(--color-subject-numbers-dark)",
      },
      totalItems: 5,
      locked: false,
    },
  ],
  nova: [],
  bloo: [],
};
