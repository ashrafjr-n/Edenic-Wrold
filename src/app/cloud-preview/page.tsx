import type { CSSProperties } from "react";
import { Cloud } from "@/components/ui/cloud";

/**
 * TEMPORARY review page for the cloud silhouette — not linked from anywhere,
 * not in `mainNav`, and **delete it (this whole folder) once the shape is
 * signed off**. It exists so the cloud can be judged on its own at review
 * size rather than at stage-node size inside the trail.
 *
 * Dark mode is a `data-theme="dark"` WRAPPER rather than the real toggle:
 * every dark rule in `globals.css` is a descendant selector
 * (`[data-theme="dark"] .cloud`), so a plain div reproduces them exactly and
 * both themes can sit on one screen.
 */
const REVIEW_WIDTH = { "--cloud-w": "300px" } as CSSProperties;

export default function CloudPreviewPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="flex flex-col items-center gap-6 bg-[var(--background)] px-6 py-14">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">
          Light
        </p>
        <Cloud variant={1} tint="white" style={REVIEW_WIDTH} />
      </section>

      <section
        data-theme="dark"
        className="flex flex-col items-center gap-6 bg-[var(--background)] px-6 py-14"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">
          Dark
        </p>
        <Cloud variant={1} tint="white" style={REVIEW_WIDTH} />
      </section>
    </main>
  );
}
