import { notFound, redirect } from "next/navigation";
import { NUMBER_VALUES } from "@/data/number-items";
import { resolveLessonRoute } from "@/lib/learn-route";

interface LessonPageProps {
  params: Promise<{ character: string; lesson: string }>;
}

/**
 * A lesson has no page of its own — it is a sequence of items, so this hands
 * the child straight to the first one.
 *
 * It exists rather than pointing `LessonCard` at `/numbers/1` directly
 * because this is where "resume where they left off" belongs once the
 * progress store lands: the lesson's URL stays the way in, and only what it
 * forwards to changes.
 */
export default async function LessonPage({ params }: LessonPageProps) {
  const { character: characterId, lesson: lessonId } = await params;
  const route = resolveLessonRoute(characterId, lessonId);

  if (route.status === "missing") notFound();
  if (route.status === "locked") redirect(route.backHref);
  if (route.lesson.id !== "numbers") notFound();

  redirect(
    `/learn/${route.character.id}/${route.lesson.id}/${NUMBER_VALUES[0]}`,
  );
}
