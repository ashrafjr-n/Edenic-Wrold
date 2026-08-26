import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button3D } from "@/components/ui/button-3d";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden pb-16 lg:-mt-24 lg:pb-28 lg:pt-24">
      {/* Stacked above the copy on a phone; from `lg` it takes over the right
          side of the section and the copy sits in the space it leaves.

          The feather mask is what makes this work: the photo has no edge of its
          own, it just dissolves into the lavender ground, so there is no frame,
          no card and no hard cut anywhere around it. */}
      <div className="hero-feather relative -mt-4 h-[240px] w-full sm:h-[360px] lg:absolute lg:inset-y-0 lg:right-0 lg:mt-0 lg:h-full lg:w-[64%]">
        <Image
          src="/hero.jpg"
          alt="The friends of Edenic World walking through a candy-coloured land"
          fill
          preload
          sizes="(max-width: 1024px) 100vw, 64vw"
          /* Framed off-centre so the three friends land in the visible part of
             the crop rather than behind the feathered left edge. */
          className="object-cover object-[58%_46%]"
        />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col px-4 sm:px-8 lg:min-h-[34rem] lg:justify-center">
        <div className="max-w-xl text-center lg:text-left">
          <span
            className="card card-pill anim-fade-up inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[var(--color-ink-soft)]"
            style={{ animationDelay: "0.1s" }}
          >
            <Sparkles
              className="h-4 w-4 text-[var(--accent)]"
              strokeWidth={2.5}
            />
            A magical world for little learners
          </span>

          <h1
            className="anim-drop-in mt-5 text-5xl font-bold leading-[1.05] tracking-tight text-[var(--color-ink)] sm:text-6xl lg:text-7xl"
            style={{ animationDelay: "0.2s" }}
          >
            Learn.{" "}
            <span className="text-[var(--color-head-play)]">Play.</span>{" "}
            <span className="text-[var(--color-head-grow)]">Grow.</span>
          </h1>

          <p
            className="anim-drop-in mx-auto mt-5 max-w-md text-lg text-[var(--color-ink)]/65 sm:text-xl lg:mx-0"
            style={{ animationDelay: "0.35s" }}
          >
            Three friends, one big adventure. Letters, numbers and shapes — told
            like a story, for children under ten.
          </p>

          <div
            className="anim-fade-up mt-8 flex justify-center lg:justify-start"
            style={{ animationDelay: "0.5s" }}
          >
            <Button3D
              tone={{ face: "var(--brand)", edge: "var(--brand-dark)" }}
              href="/learn"
              className="px-8 py-4 text-lg"
            >
              Start Now
              <ArrowRight className="h-5 w-5" strokeWidth={2.75} />
            </Button3D>
          </div>
        </div>
      </div>
    </section>
  );
}
