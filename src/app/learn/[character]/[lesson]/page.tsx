import { notFound, redirect } from "next/navigation";
import { resolveLessonRoute } from "@/lib/learn-route";
import { courseCovers, courseStops } from "@/data/courses";
import { BoardLessons } from "@/components/learn/classroom/board-lessons";
import { CourseWorld } from "@/components/learn/course-world";
import { BackRow, characterAccent } from "@/components/ui/back-button";
import { COURSE_STOPS } from "@/data/course-stops";
import { BoardProgress } from "@/components/learn/classroom/board-progress";
import { classroomModels } from "@/data/classroom";
import Image from "next/image";
import { getDictionary } from "@/lib/locale";
import { dirFor, format } from "@/lib/format-dict";

interface LessonPageProps {
  params: Promise<{ character: string; lesson: string }>;
}

/**
 * A course's own page: what the friend's board shows for it — the course's
 * thing, name and progress, then its lessons (`BoardLessons`: the next one
 * big, every lesson in order under it). The classroom round it (the room,
 * the board, the friend) is the layout's (`ClassroomShell`), the same one
 * as the hub's: going in only brings the camera closer.
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

  /* A course with a world of stops (2026-11-05, Shapes first) has that
     instead of the friend's board (`ClassroomShell` lets it through). */
  const world = COURSE_STOPS[lesson.id];
  if (world) {
    /* A stop with no lesson (or a lesson with no stop) would put every link
       in the wrong place; say so while building. */
    if (process.env.NODE_ENV !== "production" && world.landscape.keys[0].length !== course.items.length) {
      throw new Error(`${lesson.id}: the world has ${world.landscape.keys[0].length} stops, the course ${course.items.length} lessons`);
    }
    return (
      <main className="relative flex flex-1 flex-col overflow-x-clip" style={characterAccent(character)}>
        <BackRow href={`/learn/${character.id}`} label={format(dict.lessonPicker.backTo, { characterName: character.name })} />
        <h1 className="sr-only">{course.name}</h1>
        <CourseWorld
          world={world}
          titles={course.items}
          characterId={character.id}
          lessonId={lesson.id}
          basePath={basePath}
          dict={dict.lessonPicker}
          dir={dir}
        />
      </main>
    );
  }

  return (
    <>
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
    </>
  );
}
