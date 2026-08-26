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
      {/* Back is chrome, so it's neumorphic — pressed out of the same ground
          as the page, like the header's language chip. */}
      <Link
        href="/"
        className="neu-soft anim-drop-in relative z-10 inline-flex w-fit items-center gap-1.5 self-start rounded-full px-4 py-2 text-sm font-semibold text-[var(--color-ink)]/75 transition hover:text-[var(--color-ink)]"
        style={{ animationDelay: "0.1s" }}
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
        Back
      </Link>

      <div className="relative z-10 mx-auto mt-2 flex max-w-3xl flex-col items-center text-center">
        {/* The character stands on a clay disc in their own color — the same
            "open world" cue the home page arch carries, scaled down. */}
        <div className="relative flex items-end justify-center">
          <div
            className="clay absolute bottom-0 left-1/2 h-24 w-40 -translate-x-1/2 rounded-[999px] sm:h-28 sm:w-52"
            style={
              {
                backgroundColor: `color-mix(in srgb, ${character.accent} 40%, #ffffff)`,
                "--clay-edge": character.accentDark,
              } as CSSProperties
            }
            aria-hidden
          />
          <Image
            src={character.image}
            alt={character.name}
            width={475}
            height={539}
            priority
            className="anim-pop-in relative h-36 w-auto object-contain drop-shadow-[0_16px_20px_rgba(59,36,101,0.2)] sm:h-48"
            style={{ animationDelay: "0.2s" }}
          />
        </div>

        <h1
          className="anim-drop-in mt-5 text-4xl font-bold leading-[1.05] tracking-tight text-[var(--color-ink)] sm:text-5xl"
          style={{ animationDelay: "0.35s" }}
        >
          Learn With{" "}
          <span style={{ color: character.accentDark }}>{character.name}</span>
        </h1>
        <p
          className="anim-drop-in mt-3 max-w-md text-lg text-[var(--color-ink)]/60"
          style={{ animationDelay: "0.5s" }}
        >
          Pick a lesson below to start your adventure!
        </p>
      </div>

      <div className="relative z-10 mx-auto mt-16 grid w-full max-w-5xl grid-cols-2 gap-x-5 gap-y-16 sm:gap-x-8 lg:grid-cols-4">
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
