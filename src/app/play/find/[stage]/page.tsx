import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FindPlay } from "@/components/activities/find/find-play";
import { pageAccent } from "@/components/ui/back-button";
import { FIND_STAGE_COUNT, FIND_STAGES, findStage, placeOf } from "@/data/find-stages";
import { dirFor } from "@/lib/format-dict";
import { getDictionary } from "@/lib/locale";

export const metadata: Metadata = {
  title: "Find — Edenic World",
  description: "Look round Nova's kitchen and find what is hidden there.",
};

export function generateStaticParams() {
  return FIND_STAGES.map((stage) => ({ stage: String(stage.n) }));
}

/** One stage of Find (`FindPlay`). A stage not built yet is a 404, as a
    puzzle that does not exist is; which are open lives in the store. */
export default async function FindStagePage({ params }: { params: Promise<{ stage: string }> }) {
  const { stage: id } = await params;
  const stage = findStage(Number(id));
  if (!stage) notFound();
  const dict = await getDictionary();

  return (
    <main className="flex flex-1 flex-col overflow-x-clip" style={pageAccent("var(--accent)", "var(--accent-dark)", "#fff")}>
      <FindPlay
        stage={stage}
        place={placeOf(stage)}
        total={FIND_STAGE_COUNT}
        words={dict.findGame}
        again={dict.activities.again}
        next={dict.activities.next}
        dir={dirFor(dict.locale)}
      />
      <h1 className="sr-only">{dict.activities.findCtaButton}</h1>
    </main>
  );
}
