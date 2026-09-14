import type { CSSProperties } from "react";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { Hash } from "lucide-react";
import { numberItems } from "@/data/number-items";
import { resolveLessonRoute } from "@/lib/learn-route";
import { BackButton, pageAccent } from "@/components/ui/back-button";
import { NumberList } from "@/components/learn/number/number-list";
import { getDictionary } from "@/lib/locale";
import { format, dirFor } from "@/lib/format-dict";

interface LessonPageProps {
  params: Promise<{ character: string; lesson: string }>;
}

type AvatarVars = CSSProperties & { "--tile-tint"?: string };

/**
 * The lesson's own page: pick a number.
 *
 * **Reworked to a hero-then-list layout on direct request** — the old
 * design (a plain "Learn Numbers" chip in the header row, then one big
 * white card holding a 3x3 grid of number tiles) was called out as
 * unfinished and out of step with the rest of the site. This follows the
 * order and rhythm of a reference lesson-list screen instead: a hero
 * (Pinki, the back button), an overlapping white sheet carrying the
 * character/subject identity and a short description, then the nine
 * numbers as list rows (`NumberList`) — not the reference's own colours,
 * just its arrangement, kept in this site's own clay language.
 *
 * **Pinki is `sticky`, not a boxed panel** — a direct correction after the
 * first pass: no tinted background, no decorative clouds, just her render
 * pinned under the header while the white sheet (and the list inside it)
 * scrolls up and over her, exactly the effect the reference's photo-under-
 * sheet composition has. `top` is the header's own rendered height so she
 * sticks flush beneath it rather than under it. `NumberList` renders its
 * own `Button3D` as a SEPARATE `fixed` bar pinned to the viewport bottom
 * (above the phone's `BottomNav`), so it never scrolls out of reach.
 *
 * **The back button is back in the standard header row, above the hero —
 * it was floating over Pinki and that was flagged as the wrong spot.**
 * Every other route puts it in its own row at the very top (see "Locked,
 * and back buttons" in CLAUDE.md); this page now matches. The "9 Numbers"
 * count moved out of `NumberList` and into the white sheet's own eyebrow
 * row, opposite the character chip — it needs no progress-store read
 * (`numberItems.length` is static), so it belongs here, server-rendered,
 * not in the client list.
 *
 * **The white sheet runs edge-to-edge on a phone** (`px-0` on the column,
 * restored at `sm`) — a direct correction, it used to carry the same
 * side margin as the rest of the page and left visible gutters either
 * side of it. The back-button row keeps its own `px-6` so IT doesn't
 * follow the sheet to the edge.
 */
export default async function LessonPage({ params }: LessonPageProps) {
  const { character: characterId, lesson: lessonId } = await params;
  const route = resolveLessonRoute(characterId, lessonId);

  if (route.status === "missing") notFound();
  if (route.status === "locked") redirect(route.backHref);

  const { character, lesson } = route;
  /* Numbers is the only lesson with items built so far. The others are all
     locked, so this is a belt-and-braces guard rather than a live path. */
  if (lesson.id !== "numbers") notFound();

  const dict = await getDictionary();
  const dir = dirFor(dict.locale);

  return (
    <main
      className="relative flex flex-1 flex-col pb-36 sm:pb-28"
      style={pageAccent(character.accent, character.accentDark)}
    >
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-0 sm:px-8 md:max-w-[35rem] lg:max-w-[37rem]">
        {/* The header row — back button, same place and same entrance
            timing every other route uses. Its own `px-6` compensates for
            the column losing its padding below `sm`, for the sheet's sake. */}
        <div
          className="anim-drop-in mt-5 flex items-center px-6 sm:px-0"
          style={{ animationDelay: "0.1s" }}
        >
          <BackButton
            href={`/learn/${character.id}`}
            label={format(dict.lessonPicker.backTo, { characterName: character.name })}
          />
        </div>

        {/* The hero: just Pinki, `sticky` under the header (`z-0`, so the
            header's own `z-30` still wins) — no panel, no tint, no clouds
            behind her, on direct request. The white sheet below is what
            scrolls up and covers her. */}
        <div className="sticky top-[4.25rem] z-0 flex h-[34svh] min-h-[12rem] w-full shrink-0 items-end justify-center sm:top-[4.75rem] sm:h-[30svh] lg:top-[5.5rem]">
          <Image
            src="/assets/learn-with-pinki/pinki/pinki-learn-numbers.png"
            alt=""
            width={340}
            height={379}
            sizes="(min-width: 640px) 340px, 300px"
            className="pointer-events-none h-full w-auto max-w-none object-contain"
          />
        </div>

        {/* The overlapping white sheet: who this is (Pinki), what it is
            (Numbers), and why (the lesson's own description) — the
            reference's "Science" / "Dinosaur World" pairing, mapped onto
            content this page actually has instead of two copies of the
            same word. Opaque and `z-10`, above the sticky hero, so it
            covers her as the page scrolls. Edge-to-edge on a phone. */}
        <div className="card card-clay-white relative z-10 -mt-6 w-full px-5 py-6 sm:px-8 sm:py-8">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className="tile tile-round relative h-8 w-8 shrink-0 overflow-hidden"
                style={{ "--tile-tint": `color-mix(in srgb, ${character.accent} 22%, white)` } as AvatarVars}
              >
                <Image
                  src={character.image}
                  alt=""
                  width={64}
                  height={73}
                  className="absolute left-1/2 top-1/2 h-[132%] w-auto max-w-none -translate-x-[46%] -translate-y-[36%] object-contain"
                />
              </span>
              <span
                className="text-xs font-bold uppercase tracking-wide sm:text-sm"
                style={{ color: character.accent }}
              >
                {character.name}
              </span>
            </div>

            {/* The numbers count, moved here from `NumberList` — a real
                clay pill (grain + inset shading, not a flat tinted tile),
                opposite the character chip. Static data (`numberItems.
                length`), so it costs no client read. */}
            <span
              className="clay inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-white sm:px-3.5 sm:py-2 sm:text-sm"
              style={
                {
                  backgroundColor: lesson.theme.accent,
                  "--clay-edge": lesson.theme.accentDark,
                } as CSSProperties
              }
            >
              <Hash className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.75} />
              {numberItems.length} {dict.lessonPicker.numbersLabel}
            </span>
          </div>

          <h1 className="mt-2 text-2xl font-bold text-[var(--color-ink)] sm:text-3xl">
            {dict.lessonPicker.numbersLabel}
          </h1>
          <p dir={dir} className="mt-1.5 text-sm text-[var(--color-ink)]/60 sm:text-base">
            {dict.lessons.numbers.description}
          </p>

          <NumberList
            items={numberItems}
            characterId={character.id}
            lessonId={lesson.id}
            basePath={`/learn/${character.id}/${lesson.id}`}
            tone={{ face: lesson.theme.accent, edge: lesson.theme.accentDark }}
            dict={dict}
          />
        </div>
      </div>
    </main>
  );
}
