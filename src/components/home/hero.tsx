import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button3D } from "@/components/ui/button-3d";
import { getDictionary, getLocale } from "@/lib/locale";
import { dirFor, isRtl } from "@/lib/format-dict";

export async function Hero() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  /* The one deliberate layout change for a right-to-left locale (see
     CLAUDE.md's language switcher conventions): on desktop the hero scene
     mirrors from the right edge to the left, and the copy column mirrors with
     it — the two aren't independently positioned, the column's
     `-ml-16`/`justify-start` only make sense because the image sits on the
     opposite side. Keyed off DIRECTION, not off `"ar"`, so Badini Kurdish
     mirrors too without a second branch. */
  const rtl = isRtl(locale);

  return (
    /* No negative margin any more: the header is a solid white bar, so running
       the scene up behind it would just hide the top of the image. */
    <section className="relative isolate overflow-hidden pb-16 lg:pb-28 lg:pt-8">
      {/* Stacked above the copy on a phone; from `lg` it takes over the right
          (or, in Arabic, left) side of the section and the copy sits in the
          space it leaves.

          `.hero-clip` cuts it to a wavy silhouette — a real edge, not a fade. */}
      <div
        className={`hero-clip relative h-[240px] w-full sm:h-[360px] lg:absolute lg:inset-y-0 lg:h-full lg:w-[70%] ${
          rtl ? "hero-clip--rtl lg:left-0" : "lg:right-0"
        }`}
      >
        {/* `alt` is an Arabic sentence with "Edenic World" inside it and it
            renders visually when the picture fails to load, so it needs a
            base direction like any other mixed run (see `dirFor`). */}
        <Image
          src="/hero.webp"
          alt={dict.home.heroAlt}
          dir={dirFor(locale)}
          fill
          preload
          sizes="(max-width: 1024px) 100vw, 70vw"
          /* `hero.webp` centers the trio, unlike the old crop — nudged left just
             enough to trim the empty castle side on the right without cutting
             off Bloo; all three friends stay inside the frame. */
          className="anim-hero-parallax object-cover object-[47%_46%]"
        />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col px-4 sm:px-8 lg:min-h-[32rem] lg:justify-center">
        <div
          className={`max-w-xl text-center lg:text-left ${rtl ? "lg:-mr-16 lg:ml-auto lg:text-right" : "lg:-ml-16"}`}
        >
          <h1 className="anim-drop-in text-5xl font-bold leading-[1.05] tracking-tight text-[var(--color-ink)] sm:text-6xl lg:text-7xl">
            <span className="text-[var(--color-gold)]">{dict.home.heroWelcome}</span>
            <br />
            <span className="text-[var(--color-head-play)]">Edenic</span>{" "}
            <span className="text-[var(--color-head-grow)]">World.</span>
          </h1>

          {/* The full stop ending this sentence is a bidi-neutral, so without
              an explicit base direction it resolves to the LTR paragraph and
              lands on the WRONG end of the Arabic run — see `dirFor`. The
              `<h1>` above deliberately gets none: `<br>` splits it into two
              bidi paragraphs, the second being the Latin "Edenic World.",
              whose own period would move if the element went `rtl`. */}
          <p
            dir={dirFor(locale)}
            className="anim-drop-in mx-auto mt-5 max-w-md text-lg text-[var(--color-ink)]/65 sm:text-xl lg:mx-0"
            style={{ animationDelay: "0.2s" }}
          >
            {dict.home.heroSubtitle}
          </p>

          <div
            className={`anim-fade-up mt-8 flex justify-center ${rtl ? "lg:justify-end" : "lg:justify-start"}`}
            style={{ animationDelay: "0.35s" }}
          >
            <Button3D
              tone={{ face: "var(--brand)", edge: "var(--brand-dark)" }}
              href="/learn"
              className="px-8 py-4 text-lg"
            >
              {dict.home.heroCta}
              <ArrowRight className="h-5 w-5" strokeWidth={2.75} />
            </Button3D>
          </div>
        </div>
      </div>
    </section>
  );
}
