import { getDictionary } from "@/lib/locale";
import { LoadingCover } from "@/components/learn/lesson/loading-room";

/**
 * A lesson on its way: shown the moment a lesson is tapped (the route is
 * dynamic — without this the tap waited on the server with nothing to
 * show), then the lesson takes over with the same cover while its reel
 * loads (`ReelVideo` `cover`).
 */
export default async function LessonLoading() {
  const dict = await getDictionary();
  return (
    <main className="flex flex-1 flex-col">
      <LoadingCover label={dict.ui.loading} />
    </main>
  );
}
