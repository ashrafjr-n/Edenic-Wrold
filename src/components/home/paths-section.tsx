import type { CSSProperties } from "react";
import Image from "next/image";
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
            ({ title, description, art, action, href, face, edge }) => (
              <article
                key={title}
                /* `isolate` keeps the art's negative z-index inside the panel:
                   it drops behind the text but stays above the panel's own
                   fill, which is the only place it can read as bedded in. */
                className="clay group relative isolate flex min-h-[19rem] flex-col items-start overflow-hidden rounded-[2rem] p-8 lg:p-10"
                style={
                  { backgroundColor: face, "--clay-edge": edge } as ClayVars
                }
              >
                <div className="panel-art pointer-events-none absolute inset-y-0 right-0 -z-10 w-[62%]">
                  <Image
                    src={art.src}
                    /* Decorative — the panel's heading already names it. */
                    alt=""
                    fill
                    sizes="(max-width: 768px) 62vw, 31vw"
                    className={`transition-transform duration-500 ease-out group-hover:scale-110 ${
                      art.fit === "cover"
                        ? "object-cover object-center opacity-85"
                        : "object-contain object-bottom opacity-95"
                    }`}
                  />
                </div>

                <h3 className="text-3xl font-bold text-white">{title}</h3>

                <p className="mt-3 max-w-[17rem] text-base leading-relaxed text-white/85">
                  {description}
                </p>

                {/* White button on a colored panel: the purple CTA that works
                    everywhere else would disappear into this one.
                    `.btn3d--clay-white` gives it the real clay material
                    (inner top highlight, inner bottom shade, wide tinted drop
                    shadow) — `calm`'s flat chip reads as a sticker on a
                    saturated panel like this, same reasoning as the lesson
                    hub's back/achievements buttons. */}
                <Button3D
                  tone={{ face: "var(--surface)", text: "var(--color-ink)" }}
                  variant="calm"
                  href={href}
                  disabled={!href}
                  /* `home-path-btn` is a pure CSS hook — see the dark-mode
                     override in globals.css for why it needs its own class
                     rather than sharing `.btn3d--clay-white`'s dark styling
                     with every other white chip on the site. */
                  className="btn3d--clay-white home-path-btn mt-auto px-6 py-3 text-base"
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
