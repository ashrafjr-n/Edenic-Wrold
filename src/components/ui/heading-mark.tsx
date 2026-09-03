import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";

export interface HeadingChip {
  face: string;
  edge: string;
  tilt: string;
  size: string;
}

type ChipVars = CSSProperties & { "--clay-edge"?: string };

interface HeadingMarkProps {
  chips: HeadingChip[];
  /** One icon for the whole set — the same one on every chip. A mark that
      varies its icon per chip stops saying anything: three different symbols
      read as decoration, one repeated reads as a subject. */
  icon: LucideIcon;
  /** White by default. Pass `var(--color-ink)` on a gold set — gold is the
      one face on the site pale enough that white disappears on it. */
  ink?: string;
}

/**
 * The clay chips that stand in for a heading word at the top of an activity
 * page — the puzzles' three interlocking pieces, Memory Match's three cards.
 *
 * They lean into each other and are the same material as the cards below, so
 * the top of the page is a picture of the activity rather than a label for
 * it.
 *
 * **One component, because the two pages have to stay the same pattern.**
 * Memory Match's mark used to be its own thing entirely — a matched PAIR
 * (two hearts) either side of one face-down card (a star), in three
 * different treatments — and it was cut for saying nothing a child could
 * read: heart, star and heart do not add up to "memory". Being the puzzles'
 * shape exactly, with ONE repeated icon, is what makes it legible, and
 * sharing the component is what stops the two drifting apart again.
 *
 * `aria-hidden` throughout: the page's own `h1` is right underneath it.
 */
export function HeadingMark({ chips, icon: Icon, ink = "#fff" }: HeadingMarkProps) {
  return (
    <span className="flex items-center -space-x-2 sm:-space-x-2.5">
      {chips.map(({ face, edge, tilt, size }, index) => (
        <span
          key={index}
          aria-hidden
          className={`clay anim-pop-in flex items-center justify-center rounded-2xl ${size}`}
          style={
            {
              backgroundColor: face,
              "--clay-edge": edge,
              color: ink,
              rotate: tilt,
              animationDelay: `${0.15 + index * 0.08}s`,
            } as ChipVars
          }
        >
          <Icon className="h-1/2 w-1/2 fill-current" strokeWidth={2} />
        </span>
      ))}
    </span>
  );
}

/** The lean and the sizes, shared by both marks: the middle chip is the big
    one and the two beside it tip away from it. Only the colours and the icon
    change between pages. */
export const HEADING_CHIP_SHAPE = [
  { tilt: "-12deg", size: "h-11 w-11 sm:h-12 sm:w-12" },
  { tilt: "6deg", size: "h-14 w-14 sm:h-16 sm:w-16" },
  { tilt: "14deg", size: "h-11 w-11 sm:h-12 sm:w-12" },
] as const;
