import type { CSSProperties } from "react";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Crown } from "lucide-react";
import { characters } from "@/data/characters";
import { lessonsByCharacter } from "@/data/lessons";
import { Button3D } from "@/components/ui/button-3d";
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
  const cast = lessons.map((lesson, index) => ({
    lesson,
    index,
    previousName: lesson.locked ? lessons[index - 1]?.name : undefined,
  }));

  return (
    /* The character's own color, grained the same way `.clay` is, now
       covers the whole page — not just a boxed banner sitting on the site's
       pale ground. Every friend's hub reads as its own place. */
    <main
      className="relative flex flex-1 flex-col pb-20 pt-5 sm:pb-28"
      style={
        {
          backgroundColor: character.accent,
          backgroundImage: "var(--noise)",
          backgroundSize: "180px 180px",
          backgroundBlendMode: "overlay",
        } as CSSProperties
      }
    >
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-8">
        {/* Back and the (presentation-only, no achievements feature yet)
            trophy sit at the same level as the header's own icon chrome —
            same size and shape, just white instead of accent pink, since
            they're chrome on top of an already-saturated page. No heading
            text below them any more — the hero scene and the lesson list
            carry the page on their own. */}
        <div
          className="anim-drop-in flex items-center justify-between"
          style={{ animationDelay: "0.1s" }}
        >
          <Button3D
            variant="calm"
            tone={{ face: "var(--surface)" }}
            href="/learn"
            aria-label="Back to Learn"
            className="btn3d--clay-white h-12 w-12 shrink-0 sm:h-14 sm:w-14"
          >
            <ArrowLeft
              className="h-5 w-5 text-[var(--color-ink-soft)] sm:h-6 sm:w-6"
              strokeWidth={2.75}
            />
          </Button3D>

          <Button3D
            variant="calm"
            tone={{ face: "var(--surface)" }}
            aria-label="Achievements"
            className="btn3d--clay-white h-12 w-12 shrink-0 sm:h-14 sm:w-14"
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
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 px-6 sm:gap-7 sm:px-8 lg:grid-cols-2">
          {cast.map(({ lesson, index, previousName }) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              character={character}
              previousLessonName={previousName}
              index={index}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
