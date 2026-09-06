import { getDictionary, getLocale } from "@/lib/locale";
import { dirFor, isRtl } from "@/lib/format-dict";

/** Hand-drawn "Meet Edenic Friends" cue pointing down at `FriendsSection`.
    Static, by request — it used to idle-bob (`.anim-nudge-down`); that's gone.
    A sibling between the two sections, not a child of either — `Hero` has
    `overflow-hidden` (it has to, to contain the parallax image), which capped
    how far down this could sit while it lived inside that box. As its own
    element with a negative top margin, it overlaps the seam instead, sitting
    in the background gap between the hero's own bottom padding and the
    friends card's top padding, clear of both.

    The one deliberately sketchy element on the site — everywhere else is
    clean claymorphism, but a scroll nudge reads as an annotation, not chrome,
    so it earns the exception to "never hand-draw an SVG icon" (`vibe.md` §6)
    and to the rejected tilted-headline-word pattern. Don't reuse either
    exception elsewhere. */
export async function HeroScrollCue() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  /* The cue sits in the bottom corner the hero image does NOT occupy, and
     `Hero` mirrors that image to the left edge in a right-to-left locale
     (see its own comment) — so this has to mirror with it, or the label and
     the arrow land on top of the picture. Only at `lg`: below it the image
     is a full-width band stacked above, and the cue overlaps the seam under
     it the same way in every language. */
  const rtl = isRtl(locale);

  return (
    <div className="relative z-10 -mt-10 sm:-mt-14 lg:-mt-20">
      <div
        className={`mx-auto flex max-w-7xl justify-center px-4 sm:px-8 ${
          rtl ? "lg:justify-end" : "lg:justify-start"
        }`}
      >
        <div
          className={`anim-fade-up flex flex-col items-start pl-6 sm:pl-24 ${
            rtl ? "lg:items-end lg:pl-0 lg:pr-40" : "lg:pl-40"
          }`}
          style={{ animationDelay: "0.5s" }}
        >
          <span
            dir={dirFor(dict.locale)}
            className={`text-lg font-semibold text-[var(--accent)] sm:text-xl ${
              rtl ? "lg:rotate-2 -rotate-2" : "-rotate-2"
            }`}
          >
            {dict.home.scrollCue}
          </span>
          {/* NOT mirrored — a horizontal flip of a curling arrow reverses
              which way its hook reads, so `-scale-x-100` (the earlier
              approach) turned an arrow pointing down into one that read as
              pointing away/up instead of down. The fix is a rotation, not a
              flip: at `lg`, `rotate-[10deg]` replaces the base
              `-rotate-[30deg]` tilt — still leaning the opposite way to
              match the cue's mirrored corner, tuned back 20° counter-
              clockwise from the first pass's `rotate-[30deg]` on direct
              request. `lg:mr-14` (up from `lg:mr-8`) nudges the arrow
              further left off the right edge it's aligned to, same request. */}
          <svg
            aria-hidden
            viewBox="0 0 90 150"
            className={`mt-2 h-24 w-16 -rotate-[30deg] text-[var(--accent)] sm:h-28 sm:w-20 ${
              rtl ? "ml-8 lg:rotate-[10deg] lg:ml-0 lg:mr-14" : "ml-8"
            }`}
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
  );
}
