import type { CSSProperties } from "react";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { Crown } from "lucide-react";
import { numberItems } from "@/data/number-items";
import { numbersPickerScript } from "@/data/numbers-picker-script";
import { resolveLessonRoute } from "@/lib/learn-route";
import { Button3D } from "@/components/ui/button-3d";
import { BackButton, pageAccent } from "@/components/ui/back-button";
import { NumberGrid } from "@/components/learn/number/number-grid";
import { PinkiGuide } from "@/components/learn/number/pinki-guide";

interface LessonPageProps {
  params: Promise<{ character: string; lesson: string }>;
}

/**
 * The lesson's own page: pick a number.
 *
 * This used to redirect straight to number 1. It became a real page so a
 * child can see the whole journey laid out — one open number and eight still
 * to come — instead of being dropped into the middle of it.
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

  return (
    <main
      className="relative flex flex-1 flex-col pb-16 pt-5 sm:pb-20"
      style={pageAccent(character.accent, character.accentDark)}
    >
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-8">
        <div
          className="anim-drop-in flex items-center justify-between gap-3"
          style={{ animationDelay: "0.1s" }}
        >
          <BackButton
            href={`/learn/${character.id}`}
            label={`Back to ${character.name}'s lessons`}
          />

          {/* The lesson's own icon and subject color, not a plain text pill —
              the chip carries some identity instead of just repeating the
              back button's row with a label. Same shape as the character
              chip on the hub page, themed to the lesson instead. */}
          <div
            className="card card-pill flex min-w-0 items-center gap-2.5 py-1.5 pl-1.5 pr-5 sm:gap-3 sm:pr-6"
            style={
              {
                "--lesson-accent": lesson.theme.accent,
              } as CSSProperties
            }
          >
            <div
              className="tile tile-round relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden sm:h-11 sm:w-11"
              style={
                {
                  "--tile-tint":
                    "color-mix(in srgb, var(--lesson-accent) 22%, white)",
                } as CSSProperties
              }
            >
              <Image
                src={lesson.image}
                alt=""
                width={140}
                height={140}
                className="h-6 w-6 object-contain sm:h-7 sm:w-7"
              />
            </div>
            <span className="truncate text-sm font-bold text-[var(--color-ink)] sm:text-base">
              {lesson.name}
            </span>
          </div>

          {/* Same presentation-only achievements button as the character hub,
              in the same spot — this page's header row now matches that one
              exactly rather than faking the balance with empty space. */}
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

            <span className="pointer-events-none absolute right-0 top-full z-10 mt-2 w-max rounded-xl bg-[var(--color-ink-fixed)] px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover/tip:opacity-100">
              Your achievements
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-10 sm:px-8 sm:py-12">
        {/* Built here rather than inside the grid so `PinkiGuide` stays a
            Server Component — the grid is a Client Component only because
            unlocking depends on saved progress, and there is no reason for
            a static image and a line of text to be dragged into that
            bundle. The grid decides WHEN this is on screen (only for a
            child who has never finished a number); the page only decides
            what it says. */}
        <NumberGrid
          items={numberItems}
          characterId={character.id}
          lessonId={lesson.id}
          basePath={`/learn/${character.id}/${lesson.id}`}
          tone={{ face: lesson.theme.accent, edge: lesson.theme.accentDark }}
          intro={
            <PinkiGuide pose="stick" line={numbersPickerScript.notStarted} />
          }
        />
      </div>
    </main>
  );
}
