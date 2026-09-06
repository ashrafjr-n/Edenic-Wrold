import type { CSSProperties } from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { characters } from "@/data/characters";
import type { Dictionary } from "@/lib/dictionaries/en";
import { dirFor } from "@/lib/format-dict";

/**
 * The Play page's third card: a teaser for the friend-world feature, which
 * does not exist yet.
 *
 * **It is not a control, and deliberately not a link.** There is nowhere for
 * it to go, so it is a plain `<div>` — no `href`, no handler, no `disabled`
 * state to fake, and no toast or tooltip: the "Coming Soon" badge is the
 * whole message, and a card that answers a tap with a message saying nothing
 * happens is worse than one that visibly never invited the tap. Same "chrome
 * with no destination is still shown" pattern as the header's "Join Edenic
 * World" and the bottom bar's Profile tab. It is also why nothing here needs
 * the browser — this stays a Server Component with no state of any kind.
 *
 * **Bigger than the two game cards on purpose.** They are `16:9` cells in a
 * two-column grid; this spans the whole width beneath them and is taller
 * than either, so it reads as a different WEIGHT of thing rather than a
 * third game. Its height is not a fixed ratio — the copy sets it, over a
 * `min-h` floor — so a long Arabic or Kurdish line grows the card instead of
 * being clipped by a ratio tuned to English.
 *
 * **The copy and the friends are FLEX SIBLINGS, not stacked layers.** An
 * earlier version floated the renders in the corner on `position: absolute`
 * and capped the copy's width to keep clear of them; that holds only for the
 * widths and the language it was measured at, and it collided at four of the
 * eight breakpoints checked — a translated title is a different length in
 * every locale, and the two boxes have no way to know about each other. As
 * siblings they cannot overlap at any width, in any language, however long
 * the line runs. They go side by side at `lg` — the same breakpoint the
 * page's own grid splits into two columns, and not before: between `sm` and
 * `lg` this card has the full width of a single-column page, and a row of
 * three renders there left the title about 130px to wrap in, which nearly
 * doubled the card's height.
 *
 * **The art is a placeholder and is meant to be replaced.** There is no
 * painted scene for this feature, so the fill is a gradient of the three
 * characters' OWN tokens (`--color-pinki` → `--color-nova` → `--color-bloo`,
 * in the order they stand) carrying the site's `--noise` grain, with the
 * three friends themselves standing on it. When real artwork arrives it
 * replaces the gradient and the row of renders together; nothing else on the
 * card has to move.
 */
export function FriendWorldTeaser({
  dict,
  className = "",
  style,
}: {
  dict: Dictionary;
  className?: string;
  style?: CSSProperties;
}) {
  const dir = dirFor(dict.locale);

  return (
    <div
      role="img"
      aria-label={`${dict.worldTeaser.ariaLabel} — ${dict.worldTeaser.description}`}
      /* `cursor-default`, because a card is not a button: the pointer must
         never suggest there is something here to press. */
      className={`card relative isolate flex min-h-[19rem] cursor-default select-none flex-col overflow-hidden sm:min-h-[20rem] lg:flex-row lg:items-end ${className}`}
      style={style}
    >
      {/* The placeholder fill. `.clay`'s own grain recipe, applied by hand
          rather than by adding the class: `.clay` also sets the inflated
          inner highlight and shade, which belong on a button-sized object,
          not on a card this large. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "var(--noise), linear-gradient(110deg, var(--color-pinki) 0%, var(--color-nova) 52%, var(--color-bloo) 100%)",
          backgroundBlendMode: "overlay, normal",
        }}
      />

      {/* A wash over the copy's own corner rather than the whole card — the
          two game cards tint everything because their button sits dead
          centre, but here the copy is in one corner and the art is in the
          other, and darkening all of it would only dull the placeholder. It
          runs left-to-right in every locale, like every other layout on the
          site: Arabic and Kurdish keep the LTR structure and change only the
          words. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(to top, rgb(0 0 0 / 34%) 0%, transparent 62%), linear-gradient(to right, rgb(0 0 0 / 30%) 0%, rgb(0 0 0 / 14%) 48%, transparent 78%)",
        }}
      />

      {/* Second in the DOM on a phone (`order`), so a screen reader still
          meets the badge and the title first at every width — the visual
          order puts the art on top there, but the reading order shouldn't
          follow it. */}
      <div className="order-2 flex flex-1 flex-col justify-end gap-3 p-6 sm:p-8 lg:order-1 lg:p-9">
        {/* `--color-ink`, NOT `--color-ink-fixed`: this badge's face is a
            `.card`, which is `--surface` and follows the theme, so its text
            has to follow with it — the rule under "Header conventions" in
            CLAUDE.md. The fixed token rendered dark-on-dark here and the
            badge vanished the moment dark mode was on. */}
        <span className="card card-pill inline-flex w-fit items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.1em] text-[var(--color-ink)] sm:text-sm">
          <Sparkles
            className="h-3.5 w-3.5 shrink-0 text-[var(--color-gold)]"
            strokeWidth={2.5}
            fill="currentColor"
          />
          <span dir={dir}>{dict.worldTeaser.comingSoon}</span>
        </span>

        {/* Both lines carry `dir`: the title holds three Latin names inside
            an Arabic or Kurdish sentence, and the description ends on a
            bidi-neutral full stop — see `dirFor` for why each of those needs
            a base direction of its own. */}
        <h2
          dir={dir}
          className="text-2xl font-bold leading-tight text-white drop-shadow-[0_2px_10px_rgb(0_0_0/35%)] sm:text-3xl lg:text-4xl"
        >
          {dict.worldTeaser.title}
        </h2>

        <p
          dir={dir}
          className="max-w-xl text-sm font-medium leading-relaxed text-white/90 drop-shadow-[0_1px_8px_rgb(0_0_0/45%)] sm:text-base"
        >
          {dict.worldTeaser.description}
        </p>
      </div>

      {/* The three friends, in the order their colours run in the gradient
          behind them. Decoration only — `aria-hidden`, empty `alt`; the
          card's own `role="img"` label already says what this is. The middle
          friend stands higher than the two beside her, the arc `FriendPod`
          uses on the home page: a flat row of three reads as a lineup, not
          as a group. */}
      <div
        aria-hidden
        className="order-1 flex shrink-0 items-end justify-end gap-1 px-4 pt-5 sm:gap-3 sm:px-6 sm:pt-7 lg:order-2 lg:gap-5 lg:px-0 lg:pr-8 lg:pt-0"
      >
        {characters.map((character, index) => (
          <div
            key={character.id}
            className="relative h-20 w-20 sm:h-28 sm:w-28 lg:h-36 lg:w-36"
            style={{ marginBottom: index === 1 ? "1.5rem" : "0.25rem" }}
          >
            <Image
              src={character.image}
              alt=""
              fill
              sizes="(min-width: 1024px) 9rem, (min-width: 640px) 7rem, 5rem"
              className="object-contain drop-shadow-[0_10px_18px_rgb(0_0_0/22%)]"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
