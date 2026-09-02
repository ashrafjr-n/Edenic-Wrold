import Image from "next/image";
import { Play } from "lucide-react";
import { socialLinks } from "@/data/socials";
import { Button3D } from "@/components/ui/button-3d";
import friendsScene from "../../../public/hero.png";

/** The channel URL comes from `data/socials.ts`, never a second copy of the
    string — it is the same account the footer and the home page link to, and
    two hardcoded copies is one to forget when it changes. */
const YOUTUBE_HREF =
  socialLinks.find((link) => link.label === "YouTube")?.href ?? "/";

/**
 * Third card on the Activities page: the friends' videos.
 *
 * **This replaced `MascotYoutubeCta`, a small `fixed` widget in the bottom
 * right of the viewport** where Nova, Bloo and Pinki took 9.2s turns sliding
 * in with a "Watch Now" bubble. It was cut on direct request, and the reason
 * is worth keeping: it sat outside the page's card system entirely — no
 * frame, not the cards' size, in a corner nothing else occupied, changing
 * every few seconds — so it read as something that had landed on the page
 * rather than part of it. As a third card on the same recipe, the row of
 * three is regular and the empty space it used to fill is simply gone.
 *
 * Built to `PuzzleCta`'s recipe exactly — full-bleed `16:9` statically
 * imported picture, one `color-mix` wash of two EXISTING tokens over it, one
 * clay button centred on top — with **accent pink leading**, against the
 * puzzle's green and Memory Match's gold. Pink rather than a YouTube red:
 * red is not a colour this palette owns (`--color-miss` is reserved for the
 * one place the site marks something wrong), and pink is already one of the
 * two hero colours, so the three cards stay one family.
 *
 * The art is `hero.png`, the group shot of all three friends — it stands in
 * for the three separate mascot cut-outs the floating widget used, which were
 * deleted with it. Swap it for a video-specific scene when one exists.
 *
 * No progress badge: unlike the puzzles and Memory Match there is nothing
 * here to have finished, and a badge showing an invented number would be
 * worse than none.
 */
export function WatchLearnCta({ className = "" }: { className?: string }) {
  return (
    <div className={`card relative aspect-[16/9] overflow-hidden ${className}`}>
      <Image
        src={friendsScene}
        alt="Pinki, Nova and Bloo together in Edenic World"
        fill
        sizes="(min-width: 1024px) 27rem, 100vw"
        className="object-cover"
      />

      {/* Mixed from the same two-token recipe as the other cards, but at 38 /
          28 rather than their 55 / 45: this scene is ALREADY in the accent's
          own family (a pink pastel world), so at full strength the wash and
          the picture collapse into one flat pink and the friends disappear.
          The other two sit on a green and a cream picture and need the
          stronger veil to stay legible under white type. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(160deg, color-mix(in srgb, var(--accent) 38%, transparent) 0%, color-mix(in srgb, var(--brand) 28%, transparent) 100%)",
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <Button3D
          tone={{ face: "var(--accent)", edge: "var(--accent-dark)" }}
          href={YOUTUBE_HREF}
          target="_blank"
          rel="noreferrer noopener"
          className="px-6 py-3.5 text-base sm:px-8 sm:py-4 sm:text-lg"
        >
          <Play className="h-5 w-5 fill-current" strokeWidth={2} />
          Watch &amp; Learn
        </Button3D>
      </div>
    </div>
  );
}
