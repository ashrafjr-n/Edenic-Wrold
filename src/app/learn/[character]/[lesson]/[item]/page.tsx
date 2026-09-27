import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { characters } from "@/data/characters";
import { lessonsByCharacter } from "@/data/lessons";
import { resolveLessonRoute } from "@/lib/learn-route";
import { BackRow, pageAccent } from "@/components/ui/back-button";
import { getDictionary } from "@/lib/locale";
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
 * The lesson player (reel → 5 questions → done, see `edenic-plan.md`) is not
 * built yet, so a valid lesson shows Pinki saying it is on its way. Which
 * lessons are open lives in the client-side progress store, so the lock is
 * drawn on the lesson list, not enforced here.
 */
export default async function LessonItemPage({ params }: LessonItemPageProps) {
  const { character: characterId, lesson: lessonId, item } = await params;

  const route = resolveLessonRoute(characterId, lessonId);
  if (route.status === "missing") notFound();
  if (route.status === "locked") redirect(route.backHref);

  const { character, lesson } = route;
  const n = Number(item);
  if (!Number.isInteger(n) || n < 1 || n > lesson.totalItems) notFound();

  const dict = await getDictionary();
  const course = dict.lessons[lesson.id];
  const title = course.items[n - 1];

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
          <h1 dir={dirFor(dict.locale)} className="text-2xl font-bold text-[var(--color-ink)]">
            {title}
          </h1>
          <p dir={dirFor(dict.locale)} className="text-base text-[var(--color-ink)]/60">
            {dict.lessonPlayer.comingSoon}
          </p>
        </div>
      </div>
    </main>
  );
}
