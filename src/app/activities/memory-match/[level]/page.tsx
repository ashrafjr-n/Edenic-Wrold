import { notFound } from "next/navigation";
import { findMemoryLevel, memoryLevels } from "@/data/memory-levels";
import { pageAccent } from "@/components/ui/back-button";
import { MemoryBoard } from "@/components/activities/memory/memory-board";

export function generateStaticParams() {
  return memoryLevels.map((level) => ({ level: String(level.value) }));
}

interface MemoryLevelPageProps {
  params: Promise<{ level: string }>;
}

export default async function MemoryLevelPage({ params }: MemoryLevelPageProps) {
  const { level: levelId } = await params;
  const level = findMemoryLevel(Number(levelId));

  /* Which levels are open lives in the progress store, which is client-side,
     so this route cannot gate on it — the lock is drawn on the grid instead.
     A level that doesn't exist IS a 404, the same call the puzzle route
     makes. */
  if (!level) notFound();

  const index = memoryLevels.indexOf(level);
  const next = memoryLevels[index + 1];
  const nextHref = next
    ? `/activities/memory-match/${next.value}`
    : "/activities/memory-match";

  return (
    <main
      className="relative flex flex-1 flex-col pb-16 pt-5 sm:pb-20"
      style={pageAccent(
        "var(--color-gold)",
        "var(--color-gold-dark)",
        "var(--color-ink)",
      )}
    >
      {/* The header shows live state (the clock), so the whole screen —
          back button included — lives inside the client component that has
          it. */}
      <MemoryBoard level={level} nextHref={nextHref} />
    </main>
  );
}
