import { LessonLoader } from "@/components/learn/lesson/lesson-loader";
import { getDictionary } from "@/lib/locale";
import { LoadingRoom } from "@/components/learn/lesson/loading-room";

/**
 * A lesson on its way: shown the moment a lesson is tapped (the route is
 * dynamic — without this the tap waited on the server with nothing to
 * show), then the lesson replaces it, its reel loading behind the same
 * loader.
 */
export default async function LessonLoading() {
  const dict = await getDictionary();
  return (
    <main className="relative isolate flex flex-1 flex-col items-center justify-center">
      <LoadingRoom />
      <LessonLoader label={dict.lessonPlayer.loading} />
    </main>
  );
}
