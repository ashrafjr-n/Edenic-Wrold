import type { CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import { homePaths } from "@/data/home-paths";
import { Button3D } from "@/components/ui/button-3d";

type ClayVars = CSSProperties & { "--clay-edge"?: string };

export function PathsSection() {
  return (
    <section
      className="anim-reveal px-4 pb-20 sm:px-8 lg:pb-28"
      aria-labelledby="paths-heading"
    >
      <div className="mx-auto max-w-7xl">
        <h2
          id="paths-heading"
          className="text-center text-4xl font-bold tracking-tight text-[var(--color-ink)] sm:text-5xl"
        >
          Where would you like to start?
        </h2>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:gap-8">
          {homePaths.map(
            ({ title, description, Icon, action, href, face, edge }) => (
              <article
                key={title}
                className="clay flex flex-col items-start rounded-[2rem] p-8 lg:p-10"
                style={
                  { backgroundColor: face, "--clay-edge": edge } as ClayVars
                }
              >
                {/* A white chip on the colored panel — the tile idea inverted,
                    because a pale pastel tile would vanish on this fill. */}
                <span className="card card-pill flex h-14 w-14 items-center justify-center text-[var(--color-ink)]">
                  <Icon className="h-7 w-7" strokeWidth={2.25} />
                </span>

                <h3 className="mt-6 text-3xl font-bold text-white">{title}</h3>

                <p className="mt-3 max-w-sm text-base leading-relaxed text-white/85">
                  {description}
                </p>

                {/* White button on a colored panel: the purple CTA that works
                    everywhere else would disappear into this one. */}
                <Button3D
                  tone={{ face: "var(--surface)", text: "var(--color-ink)" }}
                  variant="calm"
                  href={href}
                  disabled={!href}
                  className="mt-8 px-6 py-3 text-base"
                >
                  {action}
                  {href && <ArrowRight className="h-5 w-5" strokeWidth={2.75} />}
                </Button3D>
              </article>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
