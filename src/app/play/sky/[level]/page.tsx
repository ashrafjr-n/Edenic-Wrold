import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SkyLevelPlay } from "@/components/activities/sky/sky-level-play";
import { SKY_LEVELS, findSkyLevel } from "@/data/sky-levels";
import { getDictionary } from "@/lib/locale";

export const metadata: Metadata = {
  title: "Sky Trail — Edenic World",
  description: "A level of the Sky Trail: short games on a cloud.",
};

export function generateStaticParams() {
  return SKY_LEVELS.map((level) => ({ level: String(level.value) }));
}

interface SkyLevelPageProps {
  params: Promise<{ level: string }>;
}

/**
 * One level of the Sky Trail. Which levels are open lives in the progress
 * store (client-side), so this route cannot gate on it — the lock is drawn
 * on the sky; a level that does not exist IS a 404, the games' own call. The
 * whole screen is `SkyLevelPlay`: its chrome shows live state.
 */
export default async function SkyLevelPage({ params }: SkyLevelPageProps) {
  const { level: levelId } = await params;
  const level = findSkyLevel(Number(levelId));
  if (!level) notFound();

  const dict = await getDictionary();
  /* Keyed by the level: Next goes straight to the next one, and no state may carry over. */
  return <SkyLevelPlay key={level.value} level={level} dict={dict} />;
}
