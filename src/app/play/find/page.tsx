import type { Metadata } from "next";
import { Camera } from "lucide-react";
import { FindAlbum, type AlbumSlot } from "@/components/activities/find/find-album";
import { BackRow, pageAccent } from "@/components/ui/back-button";
import { HEADING_CHIP_SHAPE, HeadingMark, type HeadingChip } from "@/components/ui/heading-mark";
import { FIND_STAGE_COUNT, findStage } from "@/data/find-stages";
import { getDictionary } from "@/lib/locale";

export const metadata: Metadata = {
  title: "Find — Edenic World",
  description: "Find what is hidden in Nova's kitchen and keep the photo in your album.",
};

/* The heading's mark: the other games' three chips, in Find's pink, one camera. */
const CHIPS: HeadingChip[] = HEADING_CHIP_SHAPE.map((shape) => ({ ...shape, face: "var(--accent)", edge: "var(--accent-dark)" }));

/** Every page of the album, built or not. */
const SLOTS: AlbumSlot[] = Array.from({ length: FIND_STAGE_COUNT }, (_, i) => {
  const stage = findStage(i + 1);
  return stage
    ? { n: stage.n, things: stage.things.map((word) => ({ word, pic: stage.art.landscape.things[word] })), photo: stage.art.photo, place: stage.art.place }
    : { n: i + 1 };
});

/**
 * Find's home: the photo album (`FindAlbum`) — its nine pages are the
 * stages. `?photo=<n>`: that stage's photo just came in (a stage's Next).
 */
export default async function FindPage({ searchParams }: { searchParams: Promise<{ photo?: string }> }) {
  const [dict, { photo }] = await Promise.all([getDictionary(), searchParams]);

  return (
    <main className="flex flex-1 flex-col overflow-x-clip pb-16 sm:pb-20" style={pageAccent("var(--accent)", "var(--accent-dark)", "#fff")}>
      <BackRow href="/play" label={dict.activities.backToGames} />
      <div className="anim-drop-in mt-2 flex flex-col items-center gap-3" style={{ animationDelay: "0.1s" }}>
        <HeadingMark chips={CHIPS} icon={Camera} />
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-ink)] sm:text-3xl">{dict.findGame.album}</h1>
      </div>
      <FindAlbum slots={SLOTS} words={dict.findGame} soon={dict.activities.findSoon} fresh={photo ? Number(photo) : undefined} />
    </main>
  );
}
