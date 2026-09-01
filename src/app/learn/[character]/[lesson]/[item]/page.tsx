import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Crown } from "lucide-react";
import { characters } from "@/data/characters";
import { lessonsByCharacter } from "@/data/lessons";
import { findNumberItem, numberItems } from "@/data/number-items";
import { resolveLessonRoute } from "@/lib/learn-route";
import { Button3D } from "@/components/ui/button-3d";
import { JourneyProgress } from "@/components/learn/number/journey-progress";
import { NumberJourney } from "@/components/learn/number/number-journey";

export function generateStaticParams() {
  return characters.flatMap((character) =>
    lessonsByCharacter[character.id]
      .filter((lesson) => lesson.id === "numbers")
      .flatMap((lesson) =>
        numberItems.map((item) => ({
          character: character.id,
          lesson: lesson.id,
          item: String(item.value),
        })),
      ),
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
  /* Numbers is the only lesson with items built so far. The others are all
     locked, so this is a belt-and-braces guard rather than a live path. */
  if (lesson.id !== "numbers") notFound();

  const item = findNumberItem(Number(itemId));
  if (!item) notFound();

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
    <main className="relative flex flex-1 flex-col pb-16 pt-5 sm:pb-20">
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-8">
        <div
          className="anim-drop-in flex items-center justify-between gap-3"
          style={{ animationDelay: "0.1s" }}
        >
          {/* Out of the journey and back to the lesson list, not to the
              previous number — leaving is leaving. */}
          <Button3D
            tone={{ face: "var(--accent)", edge: "var(--accent-dark)" }}
            href={lessonPath}
            aria-label={`Back to ${lesson.name}`}
            className="h-12 w-12 shrink-0 sm:h-14 sm:w-14"
          >
            <ArrowLeft
              className="h-5 w-5 text-white sm:h-6 sm:w-6"
              strokeWidth={2.75}
            />
          </Button3D>

          <JourneyProgress
            position={index + 1}
            total={numberItems.length}
            accent={character.accent}
          />

          {/* Same presentation-only achievements button as the hub and the
              number list, in the same spot, instead of an empty balancing
              spacer — the back/crown pair reads identically everywhere under
              `/learn/[character]`. */}
          <div className="group/tip relative shrink-0">
            <Button3D
              variant="calm"
              tone={{ face: "var(--surface)" }}
              aria-label="Achievements"
              className="btn3d--clay-white h-12 w-12 sm:h-14 sm:w-14"
            >
              <Crown
                className="h-5 w-5 fill-current sm:h-6 sm:w-6"
                style={{ color: "var(--color-gold)" }}
                strokeWidth={1.5}
              />
            </Button3D>

            <span className="pointer-events-none absolute right-0 top-full z-10 mt-2 w-max rounded-xl bg-[var(--color-ink)] px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover/tip:opacity-100">
              Your achievements
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-6 py-8 sm:px-8 sm:py-10">
        <NumberJourney
          item={item}
          character={character}
          lessonId={lesson.id}
          nextHref={nextHref}
          nextValue={next?.value}
        />
      </div>
    </main>
  );
}
