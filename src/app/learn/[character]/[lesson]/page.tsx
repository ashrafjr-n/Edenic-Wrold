import { ViewTransition } from "react";
import { notFound, redirect } from "next/navigation";
import { resolveLessonRoute } from "@/lib/learn-route";
import { BackRow, characterAccent } from "@/components/ui/back-button";
import { courseCovers, courseStops } from "@/data/courses";
import { ClassroomBackdrop } from "@/components/learn/classroom/classroom-backdrop";
import { Chalkboard } from "@/components/learn/classroom/chalkboard";
import { BoardLessons } from "@/components/learn/classroom/board-lessons";
import { BoardProgress } from "@/components/learn/classroom/board-progress";
import { CLASSROOMS, classroomModels, classroomStyle } from "@/data/classroom";
import Image from "next/image";
import { getDictionary } from "@/lib/locale";
import { format, dirFor } from "@/lib/format-dict";

interface LessonPageProps {
  params: Promise<{ character: string; lesson: string }>;
}

/**
 * A course's own page: the friend's board up close (`BoardLessons` — the
 * lessons learned small on top, the next one big, the rest small below),
 * the course's thing, name and progress over them, in their classroom.
 */
export default async function LessonPage({ params }: LessonPageProps) {
  const { character: characterId, lesson: lessonId } = await params;
  const route = resolveLessonRoute(characterId, lessonId);

  if (route.status === "missing") notFound();
  if (route.status === "locked") redirect(route.backHref);

  const { character, lesson } = route;
  const dict = await getDictionary();
  const dir = dirFor(dict.locale);
  const course = dict.lessons[lesson.id];
  const basePath = `/learn/${character.id}/${lesson.id}`;
  const stops = courseStops(lesson.id);

  /* A friend's course is their board, up close (Pinki's 2026-10-14): the
     hub's board zooms up to fill the screen with the course's lessons on it. */
  const room = CLASSROOMS[character.id];
  return (
    <main className="class-page relative flex flex-1 flex-col" style={{ ...characterAccent(character), ...classroomStyle(room) }}>
      <ClassroomBackdrop wall={room.wall} desk={room.desk} zoomed />
      <ViewTransition name="class-back">
        <BackRow
          href={`/learn/${character.id}`}
          label={format(dict.lessonPicker.backTo, { characterName: character.name })}
        />
      </ViewTransition>
      <div className="class-course">
        <Chalkboard size="course">
          <div className="board-head">
            {/* The thing the child tapped on the hub, carried over. */}
            <span className="board-head-model" aria-hidden>
              <Image src={classroomModels[lesson.id] ?? courseCovers(lesson.id)[0]} alt="" fill sizes="7rem" className="object-contain" />
            </span>
            <div dir={dir} className="min-w-0 flex-1">
              <h1 className="chalk-title">{course.name}</h1>
              <BoardProgress
                characterId={character.id}
                lessonId={lesson.id}
                total={lesson.totalItems}
                template={dict.characterHub.learnedOf}
                dir={dir}
              />
            </div>
          </div>
          {/* No Continue here: the next lesson's big sheet is the way on. */}
          <BoardLessons
            titles={course.items}
            stops={stops}
            characterId={character.id}
            lessonId={lesson.id}
            basePath={basePath}
            dict={dict.lessonPicker}
            allDone={dict.characterHub.allDone}
            dir={dir}
          />
        </Chalkboard>
      </div>
  </main>
  );
}
