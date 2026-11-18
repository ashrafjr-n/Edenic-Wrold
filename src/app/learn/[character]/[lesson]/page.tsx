import { notFound, redirect } from "next/navigation";
import { resolveLessonRoute } from "@/lib/learn-route";
import { CourseWorld } from "@/components/learn/course-world";
import { BackRow, characterAccent } from "@/components/ui/back-button";
import { COURSE_STOPS } from "@/data/course-stops";
import { lessonsByCharacter } from "@/data/lessons";
import { StarPod } from "@/components/learn/star-pod";
import { getDictionary } from "@/lib/locale";
import { dirFor, format } from "@/lib/format-dict";
import chestStar from "../../../../../public/assets/learn/chest-star.png";

interface LessonPageProps {
  params: Promise<{ character: string; lesson: string }>;
}

/**
 * A course's own page: its world of stops (`CourseWorld`) — the camera
 * walks the lessons' path to the gold chest as the page scrolls. Every
 * course has one; the friend's classroom (`ClassroomShell`) lets it through.
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

  const world = COURSE_STOPS[lesson.id];
  /* A stop with no lesson (or a lesson with no stop) would put every link
     in the wrong place; say so while building. The last stop is the gold
     chest. */
  if (process.env.NODE_ENV !== "production" && world.landscape.keys[0].length !== course.items.length + 1) {
    throw new Error(`${lesson.id}: the world has ${world.landscape.keys[0].length} stops, the course ${course.items.length} lessons and a chest`);
  }
  return (
    <main className="relative flex flex-1 flex-col overflow-x-clip" style={characterAccent(character)}>
      <BackRow href={`/learn/${character.id}`} label={format(dict.lessonPicker.backTo, { characterName: character.name })} stay>
        <StarPod
          characterId={character.id}
          courses={lessonsByCharacter[character.id]
            .filter((entry) => !entry.locked)
            .map((entry) => ({ id: entry.id, name: dict.lessons[entry.id].name }))}
          labels={dict.characterHub}
        />
      </BackRow>
      <h1 className="sr-only">{course.name}</h1>
      <CourseWorld
        world={world}
        titles={course.items}
        characterId={character.id}
        lessonId={lesson.id}
        basePath={basePath}
        dict={dict.lessonPicker}
        dir={dir}
        star={chestStar}
      />
    </main>
  );
}
