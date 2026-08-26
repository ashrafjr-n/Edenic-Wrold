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
    <main
      className="hub-stage relative flex flex-1 flex-col pb-20 sm:pb-28"
      style={{ "--world": character.accent } as CSSProperties}
    >
      {/* You walk into this character's world: the band is their color at full
          strength, and the lesson cards below climb back up into it. */}
      <div
        className="relative overflow-hidden rounded-b-[2.5rem] px-4 pb-24 pt-5 sm:rounded-b-[4rem] sm:px-8 sm:pb-28"
        style={{
          backgroundImage: `linear-gradient(180deg, ${character.accentSoft} 0%, ${character.accent} 100%)`,
        }}
      >
        <Link
          href="/"
          className="anim-drop-in relative z-10 inline-flex w-fit items-center gap-1.5 self-start rounded-full bg-white/85 px-4 py-2 text-sm font-semibold text-[var(--color-ink)]/75 shadow-[0_3px_0_0_rgba(59,36,101,0.15)] backdrop-blur transition hover:bg-white hover:text-[var(--color-ink)]"
          style={{ animationDelay: "0.1s" }}
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
          Back
        </Link>

        <div className="relative z-10 mx-auto mt-2 flex max-w-3xl flex-col items-center text-center">
          <Image
            src={character.image}
            alt={character.name}
            width={475}
            height={539}
            priority
            className="anim-pop-in anim-breathe h-36 w-auto object-contain drop-shadow-[0_16px_20px_rgba(59,36,101,0.25)] sm:h-48"
            style={{ animationDelay: "0.2s" }}
          />
          <h1
            className="anim-drop-in mt-3 text-4xl font-bold leading-[1.05] tracking-tight text-white [text-shadow:0_3px_12px_rgba(59,36,101,0.3)] sm:text-6xl"
            style={{ animationDelay: "0.35s" }}
          >
            Learn With {character.name}
          </h1>
          <p
            className="anim-drop-in mt-3 max-w-md text-lg font-medium text-white/85"
            style={{ animationDelay: "0.5s" }}
          >
            Pick a lesson below to start your adventure!
          </p>
        </div>
      </div>

      <div className="relative z-10 mx-auto -mt-12 grid w-full max-w-5xl grid-cols-2 gap-x-5 gap-y-16 px-4 sm:gap-x-8 sm:px-8 lg:grid-cols-4">
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
