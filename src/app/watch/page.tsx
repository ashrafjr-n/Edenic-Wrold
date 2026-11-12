import type { Metadata } from "next";
import { BackRow } from "@/components/ui/back-button";
import { WatchGrid } from "@/components/watch/watch-grid";
import { watchSections } from "@/data/watch";
import { dirFor } from "@/lib/format-dict";
import { getDictionary } from "@/lib/locale";

export const metadata: Metadata = {
  title: "Watch — Edenic World",
  description: "Watch the Edenic World videos with Pinki, Nova and Bloo.",
};

export default async function WatchPage() {
  const dict = await getDictionary();
  return (
    <main className="flex flex-1 flex-col overflow-x-clip">
      <BackRow href="/discover" label={dict.discover.backToDiscover} />
      <div className="px-4 pb-10 pt-6 sm:px-8">
        <h1 className="sr-only">{dict.discover.watchButton}</h1>
        <WatchGrid
          sections={watchSections(dict)}
          ariaTemplate={dict.discover.watchClipAria}
          closeLabel={dict.lessonPlayer.close}
          dir={dirFor(dict.locale)}
        />
      </div>
    </main>
  );
}
