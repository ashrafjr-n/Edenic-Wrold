import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { BackRow, pageAccent } from "@/components/ui/back-button";
import { CLASSROOMS } from "@/data/classroom";
import { isLabStage } from "@/data/lab";
import { dirFor, format } from "@/lib/format-dict";
import { getDictionary } from "@/lib/locale";

export const metadata: Metadata = {
  title: "The Sleeping Lab — Edenic World",
};

interface LabStagePageProps {
  params: Promise<{ stage: string }>;
}

/**
 * One stage of the Sleeping Lab. The stages are built one at a time
 * (`edenic-plan.md`), so until a stage exists its cookie leads here: Pinki
 * saying it is on its way — the same card a Learn lesson shows before it is written.
 */
export default async function LabStagePage({ params }: LabStagePageProps) {
  const { stage } = await params;
  const value = Number(stage);
  if (!isLabStage(value)) notFound();
  const dict = await getDictionary();
  const dir = dirFor(dict.locale);

  return (
    <main className="flex flex-1 flex-col overflow-x-clip" style={pageAccent("var(--brand)", "var(--brand-dark)", "#fff")}>
      <BackRow href="/play" label={dict.lab.back} />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-8">
        <div className="card card-clay-white flex w-full flex-col items-center gap-4 px-6 py-8 text-center">
          <Image src={CLASSROOMS.pinki.cheer} alt="" sizes="160px" className="h-40 w-auto object-contain" />
          <h1 dir={dir} className="text-2xl font-bold text-[var(--color-ink)]">
            {format(dict.lab.stageLabel, { value })}
          </h1>
          <p dir={dir} className="text-base text-[var(--color-ink)]/60">
            {dict.lab.stageSoon}
          </p>
        </div>
      </div>
    </main>
  );
}
