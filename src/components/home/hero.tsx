import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button3D } from "@/components/ui/button-3d";

export function Hero() {
  return (
    /* No negative margin any more: the header is a solid white bar, so running
       the scene up behind it would just hide the top of the image. */
    <section className="relative isolate overflow-hidden pb-16 lg:pb-28 lg:pt-8">
      {/* Stacked above the copy on a phone; from `lg` it takes over the right
          side of the section and the copy sits in the space it leaves.

          `.hero-clip` cuts it to a wavy silhouette — a real edge, not a fade. */}
      <div className="hero-clip relative h-[240px] w-full sm:h-[360px] lg:absolute lg:inset-y-0 lg:right-0 lg:h-full lg:w-[70%]">
        <Image
          src="/hero.png"
          alt="The friends of Edenic World walking through a candy-coloured land"
          fill
          preload
          sizes="(max-width: 1024px) 100vw, 70vw"
          /* `hero.png` centers the trio, unlike the old crop — nudged left just
             enough to trim the empty castle side on the right without cutting
             off Bloo; all three friends stay inside the frame. */
          className="anim-hero-parallax object-cover object-[47%_46%]"
        />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col px-4 sm:px-8 lg:min-h-[32rem] lg:justify-center">
        <div className="max-w-xl text-center lg:-ml-16 lg:text-left">
          <h1 className="anim-drop-in text-5xl font-bold leading-[1.05] tracking-tight text-[var(--color-ink)] sm:text-6xl lg:text-7xl">
            Welcome to
            <br />
            <span className="text-[var(--color-head-play)]">Edenic</span>{" "}
            <span className="text-[var(--color-head-grow)]">World.</span>
          </h1>

          <p
            className="anim-drop-in mx-auto mt-5 max-w-md text-lg text-[var(--color-ink)]/65 sm:text-xl lg:mx-0"
            style={{ animationDelay: "0.2s" }}
          >
            Step into a whole world with Nova, Pinki and Bloo — an adventure in
            letters, numbers and shapes.
          </p>

          <div
            className="anim-fade-up mt-8 flex justify-center lg:justify-start"
            style={{ animationDelay: "0.35s" }}
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

          {/* Hand-drawn cue pointing at `FriendsSection` just below. The one
              deliberately sketchy element on the site — everywhere else is clean
              claymorphism, but a scroll nudge reads as an annotation, not chrome,
              so it earns the exception. */}
          <div
            className="anim-fade-up mt-6 flex flex-col items-start pl-4 sm:mt-8 sm:pl-10 lg:pl-16"
            style={{ animationDelay: "0.5s" }}
          >
            <span className="-rotate-2 text-lg font-semibold text-[var(--accent)] sm:text-xl">
              Meet Edenic Friends
            </span>
            <svg
              aria-hidden
              viewBox="0 0 90 150"
              className="anim-nudge-down -mt-1 h-24 w-16 text-[var(--accent)] sm:h-28 sm:w-20"
              fill="none"
            >
              <path
                d="M72 10 C40 8 12 40 14 78 C15 100 35 112 48 98 C56 90 50 78 38 82 C20 88 10 112 16 138"
                stroke="currentColor"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <path
                d="M6 120 L17 140 L34 126"
                stroke="currentColor"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
