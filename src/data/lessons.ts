import type { CharacterId } from "@/types/character";
import type { Lesson, LessonId } from "@/types/lesson";
import { courseLessons } from "./courses";

/** A course in its friend's colour: for Pinki's courses, Pinki's own pink,
    so her whole corner reads pink; for Nova's, gold (her
    "Learn With" button's colour, direct request 2026-10-02), with ink on
    it instead of white; for Bloo's, Bloo's own blue. Only Shapes has its own
    card art; every other course shows its friend until its art arrives
    (the image is the reel's poster). */
const course = (id: LessonId, tone: CharacterId, image: string): Lesson => ({
  id,
  image,
  theme:
    tone === "nova"
      ? { accent: "var(--color-gold)", accentDark: "var(--color-gold-dark)", ink: "var(--color-ink-fixed)" }
      : { accent: `var(--color-${tone})`, accentDark: `var(--color-${tone}-dark)`, ink: "#fff" },
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
  ],
  bloo: [
    course("animals", "bloo", "/assets/friends/bloo.png"),
    course("weather", "bloo", "/assets/friends/bloo.png"),
  ],
};
