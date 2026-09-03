import type { CSSProperties } from "react";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { Crown } from "lucide-react";
import { characters } from "@/data/characters";
import { lessonsByCharacter } from "@/data/lessons";
import { Button3D } from "@/components/ui/button-3d";
import { BackButton, pageAccent } from "@/components/ui/back-button";
import { LessonCard } from "@/components/learn/lesson-card";

export function generateStaticParams() {
  return characters.map((character) => ({ character: character.id }));
}

interface CharacterLearnPageProps {
  params: Promise<{ character: string }>;
}

export default async function CharacterLearnPage({
  params,
}: CharacterLearnPageProps) {
  const { character: characterId } = await params;
  const character = characters.find((entry) => entry.id === characterId);

  if (!character) notFound();
  /* Back to the friend picker, not the marketing home — a child who lands on a
     locked friend should end up somewhere they can actually choose again. */
  if (character.locked) redirect("/learn");

  const lessons = lessonsByCharacter[character.id];
  /* The lesson to lead with. Once the progress store lands this becomes the
     first unlocked *and unfinished* one; for now the first unlocked lesson is
     the same thing. `-1` (nothing unlocked) simply features nothing. */
  const featuredIndex = lessons.findIndex((lesson) => !lesson.locked);
  const lastIndex = lessons.length - 1;
  const cast = lessons.map((lesson, index) => ({
    lesson,
    index,
    featured: index === featuredIndex,
    previousName: lesson.locked ? lessons[index - 1]?.name : undefined,
    /* The phone rail lights up as far as the child can actually reach: the
       segment into a node is lit when that lesson is open, and the segment
       out of it when the next one is. */
    rail: {
      isLast: index === lastIndex,
      aboveActive: !lesson.locked,
      belowActive: index < lastIndex && !lessons[index + 1].locked,
    },
  }));

  /* This character owns the page, so the back button beneath reads the
     accent from here — Nova's and Bloo's hubs come out right by default
     rather than wearing Pinki's pink. */
  return (
    <main
      className="relative flex flex-1 flex-col pb-20 pt-5 sm:pb-28"
      style={pageAccent(character.accent, character.accentDark)}
    >
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-8">
        {/* Back and the (presentation-only, no achievements feature yet)
            trophy sit at the same level as the header's own icon chrome —
            same size and shape, just white instead of accent pink, since
            they're chrome on top of an already-saturated page. No heading
            text below them any more — the hero scene and the lesson list
            carry the page on their own. */}
        <div
          className="anim-drop-in flex items-center justify-between gap-3"
          style={{ animationDelay: "0.1s" }}
        >
          {/* This character's own accent, handed down by the `<main>`
              above — Pinki's is pink, Nova's lavender, Bloo's blue. The crown
              beside it stays white on every page, which is what keeps "go
              back" and "chrome with no destination yet" from reading as the
              same control however this button is coloured. */}
          <BackButton href="/learn" label="Back to Learn" />

          {/* Whose world this is. The hero banner is phone-only now, so
              without this the desktop page carried no trace of the character
              at all — and this fills the dead span between the two buttons
              at the same time. */}
          <div className="card card-pill flex min-w-0 items-center gap-2.5 py-1.5 pl-1.5 pr-5 sm:gap-3 sm:pr-6">
            <div
              className="tile tile-round relative h-9 w-9 shrink-0 overflow-hidden sm:h-11 sm:w-11"
              style={
                {
                  "--tile-tint": `color-mix(in srgb, ${character.accent} 20%, #ffffff)`,
                } as CSSProperties
              }
            >
              <Image
                src={character.image}
                alt=""
                width={475}
                height={539}
                priority
                /* Scaled up and offset inside the circle so the crop lands on
                   the face — the source render is a full body, and the head
                   sits left of and above its center. Re-check this framing
                   if the character renders are ever replaced. */
                className="absolute left-1/2 top-1/2 h-[132%] w-auto max-w-none -translate-x-[46%] -translate-y-[36%] object-contain"
              />
            </div>
            <span className="truncate text-sm font-bold text-[var(--color-ink)] sm:text-base">
              {character.name}
            </span>
          </div>

          {/* Presentation only — there is no achievements screen yet. The
              tooltip is the same `group/*` hover pattern the locked lesson
              cards use, so an unexplained icon still says what it is. */}
          <div className="group/tip relative shrink-0">
            <Button3D
              variant="calm"
              tone={{ face: "var(--surface)" }}
              aria-label="Achievements"
              className="btn3d--clay-white h-12 w-12 sm:h-14 sm:w-14"
            >
              {/* A filled crown, not the outlined trophy that was here first —
                  a trophy's thin stem and handles break up at this size, while
                  a crown stays one chunky silhouette, which is what reads as
                  clay next to the character renders. */}
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

        {/* Phone only (`sm:hidden`). On a narrow screen the scene is what
            gives the page its warmth before the lesson list starts; from
            tablet up there is room for the lessons themselves to be the
            page, and the banner just pushed them below the fold. */}
        {character.heroImage && (
          <div
            className="card anim-pop-in relative mt-5 aspect-[2/1] w-full overflow-hidden sm:hidden"
            style={{ animationDelay: "0.2s" }}
          >
            <Image
              src={character.heroImage}
              alt={`${character.name}'s learning corner`}
              fill
              sizes="100vw"
              priority
              className="object-cover"
            />
          </div>
        )}
      </div>

      {/* `my-auto` on a wrapper rather than `justify-center` on the parent:
          it keeps the back/crown row pinned to the top while the lessons take
          the leftover height, and auto margins collapse to zero once there
          are enough lessons to fill the page — so it never pushes content
          off-screen the way `items-center` would. Same "space reads better
          distributed" call as the `/learn` picker.

          The gap above the grid is PADDING on this wrapper, not a margin on
          the grid: a `sm:mt-*` on the grid would out-rank `my-auto` in
          Tailwind's margin ordering and dump all the free space at the
          bottom, and a child margin could collapse straight back out. */}
      <div className="w-full pt-8 sm:my-auto sm:pt-10">
        {/* The extra left padding below `sm` is the lane the phone progress
            rail lives in; from `sm` up the rail is gone and the padding goes
            back to matching the rest of the page.

            `--character-accent*` is the phone fallback the lesson hues
            switch back to below `sm`. */}
        <div
          className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 px-6 pl-12 sm:gap-7 sm:px-8 lg:grid-cols-2"
          style={
            {
              "--character-accent": character.accent,
              "--character-accent-dark": character.accentDark,
            } as CSSProperties
          }
        >
          {cast.map(({ lesson, index, featured, previousName, rail }) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              character={character}
              previousLessonName={previousName}
              featured={featured}
              rail={rail}
              index={index}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
