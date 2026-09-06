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
 * third game. Its aspect ratio is deliberately not fixed — the copy sets the
 * height, with a `min-h` floor, so a long Arabic or Kurdish line grows the
 * card instead of being clipped by a ratio tuned to English.
 *
 * **The art is a placeholder and is meant to be replaced.** There is no
 * painted scene for this feature, so the fill is a gradient of the three
 * characters' OWN tokens (`--color-pinki` → `--color-nova` → `--color-bloo`,
 * left to right in the order they stand) carrying the site's `--noise` grain,
 * with the three friends themselves standing on it. When real artwork
 * arrives it replaces the gradient and the row of renders together; nothing
 * else on the card has to move.
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
      className={`card relative isolate flex min-h-[19rem] cursor-default select-none flex-col justify-end overflow-hidden sm:min-h-[22rem] ${className}`}
      style={style}
    >
      {/* The placeholder fill. `.clay`'s own grain recipe, applied here by
          hand rather than by adding the class: `.clay` also sets the inflated
          inner highlight and shade, which belong on a button-sized object,
          not on a card this large. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: `var(--noise), linear-gradient(110deg, var(--color-pinki) 0%, var(--color-nova) 52%, var(--color-bloo) 100%)`,
          backgroundBlendMode: "overlay, normal",
        }}
      />

      {/* A dark wash at the bottom only, so white copy stays readable over
          whatever the eventual artwork turns out to be — the same job the two
          game cards' `linear-gradient` wash does, aimed at the text rather
          than at the whole card. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(to top, rgb(0 0 0 / 42%) 0%, rgb(0 0 0 / 12%) 45%, transparent 75%)",
        }}
      />

      {/* The three friends, standing on the card's own bottom edge in the
          order their colours run. `-z-10` keeps them under the copy; they are
          decoration, and the `role="img"` label above already says what the
          card is. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 flex items-end justify-center gap-2 opacity-95 sm:gap-6"
      >
        {characters.map((character, index) => (
          <div
            key={character.id}
            className="relative h-24 w-24 sm:h-36 sm:w-36"
            /* The middle friend stands higher than the two beside her, the
               same arc `FriendPod` uses on the home page — a flat row of
               three reads as a lineup, not as a group. */
            style={{ marginBottom: index === 1 ? "1.75rem" : "0.5rem" }}
          >
            <Image
              src={character.image}
              alt=""
              fill
              sizes="(min-width: 640px) 9rem, 6rem"
              className="object-contain drop-shadow-[0_10px_18px_rgb(0_0_0/22%)]"
            />
          </div>
        ))}
      </div>

      <div className="relative flex flex-col items-start gap-3 p-6 sm:p-9">
        <span
          className="card card-pill inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.1em] text-[var(--color-ink-fixed)] sm:text-sm"
        >
          <Sparkles
            className="h-3.5 w-3.5 text-[var(--color-gold)]"
            strokeWidth={2.5}
            fill="currentColor"
          />
          <span dir={dir}>{dict.worldTeaser.comingSoon}</span>
        </span>

        {/* Both lines carry `dir`: the title holds three Latin names inside
            an Arabic or Kurdish sentence, and the description ends on a
            bidi-neutral full stop — see `dirFor`'s own comment for why each
            of those needs a base direction of its own. */}
        <h2
          dir={dir}
          className="max-w-2xl text-2xl font-bold leading-tight text-white drop-shadow-[0_2px_10px_rgb(0_0_0/35%)] sm:text-4xl"
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
    </div>
  );
}
