import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { characters } from "@/data/characters";
import { lessonsByCharacter } from "@/data/lessons";
import { courseLessons } from "@/data/courses";
import { resolveLessonRoute } from "@/lib/learn-route";
import { BackRow, pageAccent } from "@/components/ui/back-button";
import { LessonPlayer } from "@/components/learn/lesson/lesson-player";
import { getDictionary, getLocale } from "@/lib/locale";
import { format, dirFor } from "@/lib/format-dict";

export function generateStaticParams() {
  return characters.flatMap((character) =>
    lessonsByCharacter[character.id].flatMap((lesson) =>
      Array.from({ length: lesson.totalItems }, (_, i) => ({
        character: character.id,
        lesson: lesson.id,
        item: String(i + 1),
      })),
    ),
  );
}

interface LessonItemPageProps {
  params: Promise<{ character: string; lesson: string; item: string }>;
}

/**
 * One lesson: `/learn/pinki/shapes/1`.
 *
 * A written lesson plays in `LessonPlayer` (reel → 5 questions → done, see
 * `edenic-plan.md`); one whose questions are not written yet shows Pinki
 * saying it is on its way. Which lessons are open lives in the client-side
 * progress store, so the lock is drawn on the lesson list, not enforced here.
 */
export default async function LessonItemPage({ params }: LessonItemPageProps) {
  const { character: characterId, lesson: lessonId, item } = await params;

  const route = resolveLessonRoute(characterId, lessonId);
  if (route.status === "missing") notFound();
  if (route.status === "locked") redirect(route.backHref);

  const { character, lesson } = route;
  const n = Number(item);
  if (!Number.isInteger(n) || n < 1 || n > lesson.totalItems) notFound();

  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const course = dict.lessons[lesson.id];
  const title = course.items[n - 1];
  const def = courseLessons[lesson.id][n - 1];
  const dir = dirFor(locale);

  if (def.questions.length > 0) {
    return (
      /* `overflow-x-clip`, never `-hidden`: `hidden` makes `<main>` a scroll
         container and breaks the back row's `sticky`. */
      <main
        className="relative flex flex-1 flex-col overflow-x-clip pb-4"
        style={pageAccent(character.accent, character.accentDark)}
      >
        <LessonPlayer
          lesson={def}
          characterId={character.id}
          courseId={lesson.id}
          n={n}
          courseName={course.name}
          title={title}
          nextTitle={course.items[n]}
          nextIsShape={courseLessons[lesson.id][n]?.questions.some((q) => q.type === "word" && q.shape !== undefined)}
          image={lesson.image}
          tone={{ face: character.accent, edge: character.accentDark }}
          courseTone={{ face: lesson.theme.accent, edge: lesson.theme.accentDark }}
          dict={dict}
          dir={dir}
        />
      </main>
    );
  }

  return (
    <main
      className="relative flex flex-1 flex-col overflow-x-clip pb-4 sm:pb-20"
      style={pageAccent(character.accent, character.accentDark)}
    >
      <BackRow
        href={`/learn/${character.id}/${lesson.id}`}
        label={format(dict.lessonPlayer.backTo, { lessonName: course.name })}
      />

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-8">
        <div className="card card-clay-white flex w-full flex-col items-center gap-4 px-6 py-8 text-center">
          <Image
            src="/assets/learn-with-pinki/pinki/pinki-with-pen.png"
            alt=""
            width={141}
            height={160}
            className="h-40 w-auto object-contain"
          />
          <h1 dir={dir} className="text-2xl font-bold text-[var(--color-ink)]">
            {title}
          </h1>
          <p dir={dir} className="text-base text-[var(--color-ink)]/60">
            {dict.lessonPlayer.comingSoon}
          </p>
        </div>
      </div>
    </main>
  );
}
