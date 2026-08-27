import type { CSSProperties } from "react";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Trophy } from "lucide-react";
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
            className="h-11 w-11 shrink-0"
          >
            <ArrowLeft className="h-5 w-5 text-[var(--color-ink-soft)]" strokeWidth={2.5} />
          </Button3D>

          <Button3D
            variant="calm"
            tone={{ face: "var(--surface)" }}
            aria-label="Achievements"
            className="h-11 w-11 shrink-0"
          >
            {/* Filled, not outlined — a thin stroke trophy read as flimsy
                next to the site's chunky clay characters and buttons. */}
            <Trophy
              className="h-5 w-5 fill-current"
              style={{ color: "var(--color-gold)" }}
              strokeWidth={1.5}
            />
          </Button3D>
        </div>

        {/* The hero scene replaces the old portrait — it already puts
            {character.name} front and center, so a separate floating
            portrait next to a heading would just be redundant now. Only
            Pinki has one produced; the other two skip this card entirely
            until their own scene exists. Wide and short on purpose — a
            panoramic banner, not a tall photo. */}
        {character.heroImage && (
          <div
            className="card anim-pop-in relative mt-5 aspect-[2/1] w-full overflow-hidden sm:mt-6"
            style={{ animationDelay: "0.2s" }}
          >
            <Image
              src={character.heroImage}
              alt={`${character.name}'s learning corner`}
              fill
              sizes="(min-width: 1280px) 1216px, 100vw"
              priority
              className="object-cover"
            />
          </div>
        )}
      </div>

      <div className="mx-auto mt-8 grid w-full max-w-7xl grid-cols-1 gap-5 px-6 sm:mt-10 sm:gap-6 sm:px-8 lg:grid-cols-2">
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
    </main>
  );
}
