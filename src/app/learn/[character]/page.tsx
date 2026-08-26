import type { CSSProperties } from "react";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { characters } from "@/data/characters";
import { lessonsByCharacter } from "@/data/lessons";
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
  if (character.locked) redirect("/");

  const lessons = lessonsByCharacter[character.id];
  const cast = lessons.map((lesson, index) => ({
    lesson,
    index,
    previousName: lesson.locked ? lessons[index - 1]?.name : undefined,
  }));

  return (
    <main className="relative flex flex-1 flex-col px-4 pb-20 pt-5 sm:px-8 sm:pb-28">
      <div className="mx-auto w-full max-w-4xl">
        {/* Back is chrome: a plain white chip, the same material as a card. */}
        <Link
          href="/"
          className="card anim-drop-in inline-flex w-fit items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-[var(--color-ink-soft)] transition hover:text-[var(--color-ink)]"
          style={{ animationDelay: "0.1s" }}
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
          Back
        </Link>

        {/* The banner is the hero purple rather than the character's own color:
            purple is the one accent that repeats on every page, and the
            portrait already carries whose world this is. */}
        <div
          className="clay anim-fade-up relative mt-5 flex items-center justify-between gap-4 overflow-hidden rounded-[2rem] px-6 py-6 sm:px-10 sm:py-8"
          style={
            {
              backgroundColor: "var(--brand)",
              "--clay-edge": "var(--brand-dark)",
              animationDelay: "0.2s",
            } as CSSProperties
          }
        >
          <div className="min-w-0">
            <h1 className="text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl">
              Learn With {character.name}
            </h1>
            <p className="mt-2 max-w-sm text-sm text-white/85 sm:text-base">
              Pick a lesson below to start your adventure!
            </p>
          </div>

          <Image
            src={character.image}
            alt={character.name}
            width={475}
            height={539}
            priority
            className="anim-pop-in h-28 w-auto shrink-0 object-contain drop-shadow-[0_16px_20px_rgba(52,38,120,0.35)] sm:h-40"
            style={{ animationDelay: "0.3s" }}
          />
        </div>
      </div>

      <div className="mx-auto mt-6 grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
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
