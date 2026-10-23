import { ViewTransition } from "react";
import { notFound, redirect } from "next/navigation";
import { characters } from "@/data/characters";
import { lessonsByCharacter } from "@/data/lessons";
import { courseCovers } from "@/data/courses";
import { BackRow, characterAccent } from "@/components/ui/back-button";
import type { UpNextCourse } from "@/components/learn/up-next";
import { ClassroomBackdrop } from "@/components/learn/classroom/classroom-backdrop";
import { FriendClassroom } from "@/components/learn/classroom/friend-classroom";
import { CLASSROOMS, classroomModels, classroomStyle } from "@/data/classroom";
import { getDictionary } from "@/lib/locale";
import { dirFor } from "@/lib/format-dict";

export function generateStaticParams() {
  return characters.map((character) => ({ character: character.id }));
}

interface CharacterLearnPageProps {
  params: Promise<{ character: string }>;
}

export default async function CharacterLearnPage({
  params,
}: CharacterLearnPageProps) {
  const { character: characterId } = await params;
  const character = characters.find((entry) => entry.id === characterId);

  if (!character) notFound();
  /* Back to the friend picker, not the marketing home — a child who lands on a
     locked friend should end up somewhere they can actually choose again. */
  if (character.locked) redirect("/learn");

  const dict = await getDictionary();
  const dir = dirFor(dict.locale);
  const lessons = lessonsByCharacter[character.id];
  const upNextCourses: UpNextCourse[] = lessons
    .filter((lesson) => !lesson.locked)
    .map((lesson) => ({
      id: lesson.id,
      name: dict.lessons[lesson.id].name,
      titles: dict.lessons[lesson.id].items,
    }));

  /* Every friend's hub is their classroom (Pinki's 2026-10-14, Nova's and
     Bloo's 2026-10-23): their board with a square sheet per course, the
     friend beside it with their pointer. */
  const room = CLASSROOMS[character.id];
  return (
    <main className="class-page relative flex flex-1 flex-col" style={{ ...characterAccent(character), ...classroomStyle(room) }}>
      <ClassroomBackdrop wall={room.wall} desk={room.desk} />
      {/* Its own transition group, so the zooming wall never covers it. */}
      <ViewTransition name="class-back">
        <BackRow href="/learn" label={dict.characterHub.backToLearn} />
      </ViewTransition>
      <FriendClassroom
        characterId={character.id}
        teacher={room.teacher}
        cheer={room.cheer}
        courses={lessons
          .filter((lesson) => !lesson.locked)
          .map((lesson, i) => ({
            ...upNextCourses[i],
            model: classroomModels[lesson.id] ?? courseCovers(lesson.id)[0],
          }))}
        labels={{
          lessons: dict.lessonPicker.lessonsCount,
          cheer: dict.characterHub.youCanDoIt,
          start: dict.lessonPicker.ctaStart,
          continue: dict.trail.ctaContinue,
          again: dict.lessonPlayer.playAgain,
          startCourse: dict.characterHub.startLesson,
          continueCourse: dict.characterHub.continueLesson,
          replayCourse: dict.characterHub.replayLesson,
          allDone: dict.characterHub.allDone,
          friend: character.name,
        }}
        dir={dir}
      />
    </main>
  );
}
