import type { CSSProperties } from "react";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { numberItems } from "@/data/number-items";
import { resolveLessonRoute } from "@/lib/learn-route";
import { BackButton, pageAccent } from "@/components/ui/back-button";
import { Cloud } from "@/components/ui/cloud";
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
 * (Pinki, the back button, a couple of decorative clouds), an overlapping
 * white sheet carrying the character/subject identity and a short
 * description, a small stats row, then the nine numbers as list rows
 * (`NumberList`) closed by a "Continue" button — not the reference's own
 * colours, just its arrangement, kept in this site's own clay language.
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
      className="relative flex flex-1 flex-col pb-16 sm:pb-20 lg:pb-10"
      style={pageAccent(character.accent, character.accentDark)}
    >
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 sm:px-8 md:max-w-[35rem] lg:max-w-[37rem]">
        {/* The hero: Pinki, a couple of decorative clouds, and the back
            button floating over it — the reference's photo-then-sheet
            opening, in this site's own accent tint instead of a sky photo. */}
        <div
          className="anim-pop-in relative mt-5 h-[36svh] min-h-[13rem] w-full shrink-0 overflow-hidden rounded-[1.75rem] sm:h-[32svh]"
          style={{
            backgroundColor: `color-mix(in srgb, ${lesson.theme.accent} 16%, var(--surface))`,
          }}
        >
          <Cloud
            size="sm"
            variant={2}
            tint="sky"
            className="absolute left-[6%] top-[14%] opacity-70"
          />
          <Cloud
            size="md"
            variant={3}
            tint="white"
            className="absolute right-[-8%] top-[8%] opacity-80"
          />

          <div className="absolute left-4 top-4 z-10 sm:left-5 sm:top-5">
            <BackButton
              href={`/learn/${character.id}`}
              label={format(dict.lessonPicker.backTo, { characterName: character.name })}
            />
          </div>

          <Image
            src="/assets/learn-with-pinki/pinki/pinki-learn-numbers.png"
            alt=""
            width={340}
            height={379}
            sizes="(min-width: 640px) 340px, 300px"
            className="pointer-events-none absolute bottom-0 left-1/2 h-[90%] w-auto max-w-none -translate-x-1/2 object-contain"
          />
        </div>

        {/* The overlapping white sheet: who this is (Pinki), what it is
            (Numbers), and why (the lesson's own description) — the
            reference's "Science" / "Dinosaur World" pairing, mapped onto
            content this page actually has instead of two copies of the
            same word. */}
        <div className="card card-clay-white relative z-10 -mt-6 w-full px-5 py-6 sm:px-8 sm:py-8">
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
