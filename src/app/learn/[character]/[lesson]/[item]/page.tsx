import { notFound, redirect } from "next/navigation";
import { characters } from "@/data/characters";
import { lessonsByCharacter } from "@/data/lessons";
import { findNumberItem, numberItems } from "@/data/number-items";
import { findLetterNode, letterNodes } from "@/data/letter-items";
import { resolveLessonRoute } from "@/lib/learn-route";
import { BackButton, pageAccent } from "@/components/ui/back-button";
import { JourneyProgress } from "@/components/learn/number/journey-progress";
import { NumberJourney } from "@/components/learn/number/number-journey";
import { LetterSession } from "@/components/learn/letter/letter-session";
import { getDictionary, getLocale } from "@/lib/locale";
import { format, dirFor } from "@/lib/format-dict";

export function generateStaticParams() {
  return characters.flatMap((character) =>
    lessonsByCharacter[character.id].flatMap((lesson) => {
      const items =
        lesson.id === "numbers"
          ? numberItems.map((item) => String(item.value))
          : lesson.id === "letters"
            ? letterNodes.map((node) => node.id)
            : [];
      return items.map((item) => ({ character: character.id, lesson: lesson.id, item }));
    }),
  );
}

interface NumberItemPageProps {
  params: Promise<{ character: string; lesson: string; item: string }>;
}

export default async function NumberItemPage({ params }: NumberItemPageProps) {
  const {
    character: characterId,
    lesson: lessonId,
    item: itemId,
  } = await params;

  const route = resolveLessonRoute(characterId, lessonId);
  if (route.status === "missing") notFound();
  if (route.status === "locked") redirect(route.backHref);

  const { character, lesson } = route;

  /* A Letters node — a letter or a unit's challenge — is a session, not a
     number journey. Like the numbers, which nodes are open lives in the
     client-side store, so the lock is drawn on the map, not enforced here. */
  if (lesson.id === "letters") {
    const node = findLetterNode(itemId);
    if (!node) notFound();
    const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);

    return (
      <main
        className="relative flex flex-1 flex-col overflow-x-hidden pb-6 pt-3 sm:pb-8 sm:pt-5"
        style={pageAccent(character.accent, character.accentDark)}
      >
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 sm:px-8">
          <LetterSession
            node={node}
            characterId={character.id}
            lessonId={lesson.id}
            theme={lesson.theme}
            dict={dict}
            locale={locale}
          />
        </div>
      </main>
    );
  }

  /* Colors has no items yet and is locked, so this is a belt-and-braces
     guard rather than a live path. */
  if (lesson.id !== "numbers") notFound();

  const item = findNumberItem(Number(itemId));
  if (!item) notFound();

  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const lessonName = dict.lessons[lesson.id].name;

  /* Which numbers are open lives in the progress store, which is
     client-side, so this route cannot gate on it — the lock is drawn on the
     number list instead. Nothing is lost: a child reaches these pages by
     tapping a numeral, not by typing a URL. */
  const lessonPath = `/learn/${character.id}/${lesson.id}`;

  const index = numberItems.indexOf(item);
  const next = numberItems[index + 1];
  /* After the last number the journey ends back at the list: it is where the
     child chose from, and there is no "you finished the lesson" screen yet. */
  const nextHref = next ? `${lessonPath}/${next.value}` : lessonPath;

  return (
    /* Plain site ground, matching the hub and the number list above it — the
       saturated pink page was reverted the same way theirs already had been. */
    <main
      /* **The phone padding is deliberately tight, and it is load-bearing.**
         Pinki leads most of these stages at roughly twice the size she used
         to be, and the point of that is to help — which she stops doing the
         moment she pushes the activity she is introducing off the bottom of
         the screen. Measured at 320x568: the fixed chrome (header, back row,
         this padding, the journey's own, the bottom nav) took ~400px of 568
         before a single stage rendered. `pb-16` here was the largest single
         piece of that and was already redundant — `body` reserves its own
         `pb-[calc(4rem+env(safe-area-inset-bottom))]` for the bottom nav, so
         this was a second clearance stacked on top of the first. Tablet and
         desktop keep the roomier spacing; they were never short of height. */
      /* `overflow-x-hidden` is for the journey's life-size Pinki, exactly as
         it is on the number picker: she is sized to break out past the
         column's right edge, and on a phone that edge is close enough to the
         viewport that she would otherwise widen the document — which on a
         phone does not merely add a scrollbar, it widens the LAYOUT VIEWPORT
         and zooms the whole page out. */
      className="relative flex flex-1 flex-col overflow-x-hidden pb-4 pt-3 sm:pb-20 sm:pt-5"
      style={pageAccent(character.accent, character.accentDark)}
    >
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-8">
        <div
          className="anim-drop-in flex items-center justify-between gap-3"
          style={{ animationDelay: "0.1s" }}
        >
          {/* Out of the journey and back to the lesson list, not to the
              previous number — leaving is leaving. */}
          <BackButton
            href={lessonPath}
            label={format(dict.journey.backTo, { lessonName })}
          />

          <JourneyProgress
            position={index + 1}
            total={numberItems.length}
            accent={character.accent}
            dict={dict.journey}
            dir={dirFor(locale)}
          />

          {/* An inert spacer, the size of the back button facing it. The
              achievements crown that stood here was cut on direct request —
              there is nothing to award yet — and it cannot simply be
              deleted: the row is `justify-between`, so without something of
              the back button's width on this side the progress bar stops being
              centred on the page and slides right. */}
          <div aria-hidden className="h-12 w-12 shrink-0 sm:h-14 sm:w-14" />
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-6 py-4 sm:px-8 sm:py-10">
        <NumberJourney
          item={item}
          character={character}
          lessonId={lesson.id}
          nextHref={nextHref}
          nextValue={next?.value}
          dict={dict}
          locale={locale}
        />
      </div>
    </main>
  );
}
