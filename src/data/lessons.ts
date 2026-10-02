import type { CharacterId } from "@/types/character";
import type { Lesson, LessonId } from "@/types/lesson";
import { courseLessons } from "./courses";

type Tone = "shapes" | "colors" | "numbers" | "letters" | "pinki";

/** A course in one of the four subject colours — or, for Pinki's courses,
    Pinki's own pink, so her whole corner reads pink. Only Shapes has its own
    card art; every other course shows its friend until its art arrives
    (the image is the reel's poster). */
const course = (id: LessonId, tone: Tone, image: string, view?: Lesson["view"]): Lesson => ({
  id,
  view,
  image,
  theme: {
    accent: tone === "pinki" ? "var(--color-pinki)" : `var(--color-subject-${tone})`,
    accentDark: tone === "pinki" ? "var(--color-pinki-dark)" : `var(--color-subject-${tone}-dark)`,
  },
  totalItems: courseLessons[id].length,
  locked: false,
});

/** Each character's courses, in hub order. `name`/`description` and the
    lesson titles are translated content — see `dict.lessons` in the
    dictionaries, not this file. */
export const lessonsByCharacter: Record<CharacterId, Lesson[]> = {
  pinki: [
    course("shapes", "pinki", "/assets/learn/pinki/course-shapes.png"),
    course("colors", "pinki", "/assets/friends/pinki.png", "box"),
    course("family", "pinki", "/assets/friends/pinki.png"),
  ],
  nova: [
    course("fruits", "shapes", "/assets/friends/nova.png"),
    course("seasons", "letters", "/assets/friends/nova.png"),
    course("months", "colors", "/assets/friends/nova.png"),
  ],
  bloo: [
    course("animals", "shapes", "/assets/friends/bloo.png"),
    course("weather", "colors", "/assets/friends/bloo.png"),
    course("body", "numbers", "/assets/friends/bloo.png"),
  ],
};
