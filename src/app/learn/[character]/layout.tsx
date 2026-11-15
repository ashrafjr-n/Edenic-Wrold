import type { ReactNode } from "react";
import { characters } from "@/data/characters";
import { lessonsByCharacter } from "@/data/lessons";
import { characterAccent } from "@/components/ui/back-button";
import { ClassroomShell } from "@/components/learn/classroom/classroom-shell";
import { CLASSROOMS, classroomStyle } from "@/data/classroom";
import { getDictionary } from "@/lib/locale";

interface CharacterLayoutProps {
  children: ReactNode;
  params: Promise<{ character: string }>;
}

/**
 * A friend's classroom round their hub (`ClassroomShell`); a course's world,
 * a lesson and a 404 under it are the page alone. An unknown or locked
 * friend gets the page alone (it 404s or redirects).
 */
export default async function CharacterLayout({ children, params }: CharacterLayoutProps) {
  const { character: characterId } = await params;
  const character = characters.find((entry) => entry.id === characterId);
  if (!character || character.locked) return children;

  const dict = await getDictionary();
  const room = CLASSROOMS[character.id];
  const courses = lessonsByCharacter[character.id]
    .filter((lesson) => !lesson.locked)
    .map((lesson) => ({ id: lesson.id, titles: dict.lessons[lesson.id].items }));
  return (
    <ClassroomShell
      characterId={character.id}
      style={{ ...characterAccent(character), ...classroomStyle(room) }}
      room={{ wall: room.wall, desk: room.desk, teacher: room.teacher, cheer: room.cheer }}
      courses={courses}
      labels={{
        backFromHub: dict.characterHub.backToLearn,
        friend: character.name,
      }}
    >
      {children}
    </ClassroomShell>
  );
}
