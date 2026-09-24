import type { CSSProperties, ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Button3D } from "@/components/ui/button-3d";

interface BackButtonProps {
  href: string;
  /** Reads out as the destination — "Back to Pinki's lessons". The button
      carries no visible text, so this is the only thing announcing it. */
  label: string;
}

/** The three variables a route hands down to colour its own section. */
export type PageAccentVars = CSSProperties & {
  "--page-accent-color"?: string;
  "--page-accent-edge"?: string;
  "--page-accent-ink"?: string;
};

/**
 * Builds the style a route puts on its `<main>` to claim a colour for
 * everything section-coloured beneath it.
 *
 * `ink` is what sits ON the face and defaults to white — pass
 * `var(--color-ink)` for a face too pale to carry white type, which on this
 * site means gold.
 */
export function pageAccent(
  face: string,
  edge: string,
  ink?: string,
): PageAccentVars {
  return {
    "--page-accent-color": face,
    "--page-accent-edge": edge,
    ...(ink ? { "--page-accent-ink": ink } : {}),
  };
}

/**
 * The one back button on the site — the same chip on all seven pages that
 * have one, in **the colour of the section it is standing in**.
 *
 * It reads `--page-accent-color` / `--page-accent-edge` /
 * `--page-accent-ink` (`globals.css`) rather than naming a colour, and each
 * route sets those on its own `<main>` with `pageAccent()`. So the button is
 * green in the puzzles, gold in Memory Match, and each character's own accent
 * on their hub — the same thing the lesson cards already do, where a card
 * takes its character's colour instead of hardcoding Pinki's.
 *
 * **This replaced seven copies of the same JSX, every one of them hardcoding
 * `--accent`.** That pink was a deliberate choice once — it is what tells
 * "go back" apart from the white achievements crown sitting in the same row —
 * and that still holds, because the crown is white on every page whatever
 * colour this button takes. What it was NOT is a per-page decision: it was
 * Pinki's page copied outward, so the puzzles and Memory Match wore her pink
 * for no reason of their own.
 *
 * The arrow carries no colour class: it inherits `.btn3d`'s own
 * `--btn-text`, which is where `--page-accent-ink` arrives.
 */
export function BackButton({ href, label }: BackButtonProps) {
  return (
    <Button3D
      tone={{
        face: "var(--page-accent-color)",
        edge: "var(--page-accent-edge)",
        text: "var(--page-accent-ink)",
      }}
      href={href}
      aria-label={label}
      className="h-12 w-12 shrink-0 sm:h-14 sm:w-14"
    >
      <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.75} />
    </Button3D>
  );
}

/**
 * **Where a back button sits. One answer, for every page.**
 *
 * The button's spot is part of the site's chrome, not a per-page layout
 * choice, and it drifted every time a page placed it by hand (a narrower
 * container, a different top padding, a `sticky` offset measured from the
 * wrong box). So the numbers live here and nowhere else:
 *
 * - x: the left padding of the site's `max-w-7xl` container (24px on a
 *   phone, 32px from `sm`), whatever the page's own content width is;
 * - y: 20px under the header, at every width;
 * - it STAYS there for the whole scroll — the stuck offset is the resting
 *   offset (header height + 20px: 64 / 140 / 88px headers), so it never
 *   jumps when it sticks.
 *
 * `BACK_TOP` is the stuck offset. `BACK_FIXED` is the same spot for the
 * pages that cannot give the button a row of its own and pin a wrapper
 * instead (`/trail` over its full-bleed sky; the puzzle and Memory Match
 * grids, whose heading is centred on the page) — x there is the `max-w-7xl`
 * container's padding edge, computed from the viewport. Put it on a WRAPPER,
 * never on the button: `.btn3d` is unlayered and sets `position: relative`.
 */
export const BACK_TOP = "top-[5.25rem] sm:top-[10rem] lg:top-[6.75rem]";
export const BACK_FIXED =
  "fixed left-6 z-20 sm:left-8 lg:left-[max(2rem,calc(50%-38rem))] top-[5.25rem] sm:top-[10rem] lg:top-[6.75rem]";

interface BackRowProps extends BackButtonProps {
  /** Anything that shares the row with the button, to its right. */
  children?: ReactNode;
}

/**
 * The row every flow page opens with: the back button in its one fixed
 * spot, plus whatever sits beside it. Put it FIRST inside `<main>`, as a
 * direct child, with no top padding on `<main>` — the row brings its own
 * 20px. And never give that `<main>` `overflow-x: hidden`: it turns `<main>`
 * into a scroll container, so `sticky` measures from `<main>` instead of the
 * screen and the button lands 80px too low. Use `overflow-x-clip`.
 *
 * The row is `pointer-events-none` — it is full width and sticky, so it
 * would otherwise swallow taps on whatever scrolls under its empty middle.
 */
export function BackRow({ href, label, children }: BackRowProps) {
  return (
    <div
      className={`anim-drop-in pointer-events-none sticky z-20 mx-auto mt-5 flex w-full max-w-7xl items-center justify-between gap-3 px-6 sm:gap-6 sm:px-8 [&>*]:pointer-events-auto ${BACK_TOP}`}
      style={{ animationDelay: "0.1s" }}
    >
      <BackButton href={href} label={label} />
      {children}
    </div>
  );
}
