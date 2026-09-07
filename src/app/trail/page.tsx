import type { Metadata } from "next";
import { TrailIntro } from "@/components/trail/trail-intro";
import { TrailSky, type SkyPalette } from "@/components/trail/trail-sky";
import { BackButton } from "@/components/ui/back-button";
import { getDictionary } from "@/lib/locale";

export const metadata: Metadata = {
  title: "Edenic Trail — Edenic World",
  description: "The Edenic Trail adventure map.",
};

const PALETTES: SkyPalette[] = ["day", "dawn", "dream"];

function paletteFrom(value: string | string[] | undefined): SkyPalette {
  return PALETTES.find((palette) => palette === value) ?? "day";
}

/**
 * The Edenic Trail map — **the sky and nothing else, on purpose.** No path,
 * no stage nodes, no characters: this step exists to settle the background
 * before anything is built on top of it, so the next step drops the trail
 * into `TrailSky`'s `children` and changes nothing here.
 *
 * **`?sky=day|dawn|dream` is temporary scaffolding for choosing the
 * gradient**, not a feature. It's a search param rather than a toggle so it
 * stays a Server Component with no client JS at all, and an unknown value
 * falls back to `day` rather than throwing — it's untrusted input like any
 * other URL value. Delete `paletteFrom`, the `searchParams` prop and the
 * `PALETTES` list once the palette is picked; `TrailSky` keeps its own
 * default.
 *
 * The page is deliberately not in `mainNav` yet — there is nothing here for
 * a child to do, so nothing should route them to it. Wire it up when the
 * trail itself lands.
 */
export default async function TrailPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { sky } = await searchParams;
  const dict = await getDictionary();

  return (
    /* `trail-page` carries this route's back-button ink (`globals.css`):
       white in daylight, black at night. It has to be a class rather than a
       `pageAccent()` argument because the value CHANGES WITH THE THEME, and
       `pageAccent` takes fixed strings. The face itself is the default
       `--page-accent-color`, the brand pink every back button wore before
       that variable existed — this page has no section colour of its own to
       claim until the stages land. */
    <main className="trail-page relative flex flex-1 flex-col">
      {/* Twice the viewport, so the scroll behaviour and the cloud spread
          can both be judged now rather than after the path is drawn. */}
      <TrailSky palette={paletteFrom(sky)} className="min-h-[200svh]" />

      {/* **`fixed`, not `sticky`** — it has to stay exactly where it is for
          the whole two-viewport scroll, and the `sticky` version this
          replaced did not: it was pinned inside an absolutely-positioned
          wrapper, so it left with that wrapper instead of holding its spot.
          `fixed` is measured against the viewport and simply cannot drift.

          `top` clears the header with a real gap under it rather than
          sitting against it, and the whole thing stays below the header's
          own `z-20` (and below the transition veil's `z-10`, which is
          portalled to `body` and so paints after this at the same level). */}
      <div className="fixed left-4 top-[5.25rem] z-10 sm:left-8 sm:top-[7rem]">
        <BackButton href="/play" label={dict.activities.backToActivities} />
      </div>

      {/* Nova's welcome, over everything, waiting for the cloud transition
          to clear before she arrives — see the component. */}
      <TrailIntro dict={dict} />
    </main>
  );
}
