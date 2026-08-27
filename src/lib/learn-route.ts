import { characters } from "@/data/characters";
import { lessonsByCharacter } from "@/data/lessons";
import type { Character } from "@/types/character";
import type { Lesson } from "@/types/lesson";

/** `missing` is a 404 — nothing by that name exists. `locked` is not: the
    route is real, the child just cannot be there yet, and the answer is to
    send them somewhere they can choose again. Shared so the two rules can't
    drift apart across the routes under `/learn`. */
export type LessonRouteResult =
  | { status: "ok"; character: Character; lesson: Lesson }
  | { status: "missing" }
  | { status: "locked"; backHref: string };

export function resolveLessonRoute(
  characterId: string,
  lessonId: string,
): LessonRouteResult {
  const character = characters.find((entry) => entry.id === characterId);
  if (!character) return { status: "missing" };
  if (character.locked) return { status: "locked", backHref: "/learn" };

  const lesson = lessonsByCharacter[character.id].find(
    (entry) => entry.id === lessonId,
  );
  if (!lesson) return { status: "missing" };
  /* Back to the character's own hub rather than the picker — the child got
     here from there, and that is where the lesson that unlocks this one is. */
  if (lesson.locked) {
    return { status: "locked", backHref: `/learn/${character.id}` };
  }

  return { status: "ok", character, lesson };
}
