import type { Metadata } from "next";
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
    /* No `pageAccent` here on purpose: this page has no colour of its own to
       claim yet (there is no trail section palette until the stages land),
       and `--page-accent-color`'s own default is the brand pink every back
       button wore before that variable existed. */
    <main className="relative flex flex-1 flex-col">
      {/* Twice the viewport, so the scroll behaviour and the cloud spread
          can both be judged now rather than after the path is drawn. */}
      <TrailSky palette={paletteFrom(sky)} className="min-h-[200svh]" />

      {/* Over the sky rather than in a chrome row above it — the sky is
          full-bleed and there is no row to sit in. `sticky` keeps it in
          reach down a two-viewport scroll without `fixed`'s habit of
          escaping to the viewport on a phone; `top` clears the header. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-full px-4 sm:px-8">
        <div className="sticky top-4 z-10 flex sm:top-6">
          <span className="pointer-events-auto">
            <BackButton
              href="/play"
              label={dict.activities.backToActivities}
            />
          </span>
        </div>
      </div>
    </main>
  );
}
