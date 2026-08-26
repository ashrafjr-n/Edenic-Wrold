/** Hand-drawn "Meet Edenic Friends" cue pointing down at `FriendsSection`.
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
export function HeroScrollCue() {
  return (
    <div className="relative z-10 -mt-10 sm:-mt-14 lg:-mt-20">
      <div className="mx-auto flex max-w-7xl justify-center px-4 sm:px-8 lg:justify-start">
        <div
          className="anim-fade-up flex flex-col items-start pl-6 sm:pl-24 lg:pl-40"
          style={{ animationDelay: "0.5s" }}
        >
          <span className="-rotate-2 text-lg font-semibold text-[var(--accent)] sm:text-xl">
            Meet Edenic Friends
          </span>
          <svg
            aria-hidden
            viewBox="0 0 90 150"
            className="anim-nudge-down -mt-1 ml-4 h-24 w-16 -rotate-12 text-[var(--accent)] sm:h-28 sm:w-20"
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
