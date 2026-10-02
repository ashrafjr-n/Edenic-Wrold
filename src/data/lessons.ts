import type { CharacterId } from "@/types/character";
import type { Lesson, LessonId } from "@/types/lesson";
import { courseLessons } from "./courses";

type Tone = "shapes" | "colors" | "numbers" | "letters" | "pinki" | "nova";

/** A course in one of the four subject colours — or, for Pinki's courses,
    Pinki's own pink, so her whole corner reads pink; for Nova's, gold (her
    "Learn With" button's colour, direct request 2026-10-02), with ink on
    it instead of white. Only Shapes has its own
    card art; every other course shows its friend until its art arrives
    (the image is the reel's poster). */
const course = (id: LessonId, tone: Tone, image: string): Lesson => ({
  id,
  image,
  theme:
    tone === "nova"
      ? { accent: "var(--color-gold)", accentDark: "var(--color-gold-dark)", ink: "var(--color-ink-fixed)" }
      : {
          accent: tone === "pinki" ? "var(--color-pinki)" : `var(--color-subject-${tone})`,
          accentDark: tone === "pinki" ? "var(--color-pinki-dark)" : `var(--color-subject-${tone}-dark)`,
          ink: "#fff",
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
    course("colors", "pinki", "/assets/friends/pinki.png"),
  ],
  nova: [
    course("fruits", "nova", "/assets/friends/nova.png"),
    course("seasons", "nova", "/assets/friends/nova.png"),
    course("months", "nova", "/assets/friends/nova.png"),
  ],
  bloo: [
    course("animals", "shapes", "/assets/friends/bloo.png"),
    course("weather", "colors", "/assets/friends/bloo.png"),
    course("body", "numbers", "/assets/friends/bloo.png"),
  ],
};
