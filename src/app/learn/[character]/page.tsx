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
      className="hub-stage relative flex flex-1 flex-col px-4 pb-20 pt-6 sm:px-8 sm:pb-28"
      style={{ "--world": character.accent } as CSSProperties}
    >
      <Link
        href="/"
        className="anim-drop-in relative z-10 inline-flex w-fit items-center gap-1.5 self-start rounded-full bg-white/75 px-4 py-2 text-sm font-semibold text-[var(--color-ink)]/70 shadow-[inset_0_0_0_1px_rgba(59,36,101,0.07),0_2px_8px_-3px_rgba(59,36,101,0.16)] backdrop-blur transition hover:bg-white hover:text-[var(--color-ink)] hover:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-gold)_55%,transparent),0_4px_12px_-4px_rgba(59,36,101,0.2)]"
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
          className="anim-pop-in h-32 w-auto object-contain drop-shadow-[0_10px_14px_rgba(59,36,101,0.14)] sm:h-40"
          style={{ animationDelay: "0.2s" }}
        />
        <h1
          className="anim-drop-in mt-2 text-4xl font-bold leading-tight text-[var(--color-ink)] sm:text-5xl"
          style={{ animationDelay: "0.35s" }}
        >
          Learn With{" "}
          <span style={{ color: character.accent }}>{character.name}</span>
        </h1>
        <p
          className="anim-drop-in mt-2 max-w-md text-lg text-[var(--color-ink)]/60"
          style={{ animationDelay: "0.5s" }}
        >
          Pick a lesson below to start your adventure!
        </p>
      </div>

      <div className="relative z-10 mx-auto mt-14 grid w-full max-w-5xl grid-cols-2 gap-x-5 gap-y-14 sm:gap-x-8 lg:grid-cols-4">
        {cast.map(({ lesson, index, previousName }) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            characterId={character.id}
            characterImage={character.image}
            characterName={character.name}
            previousLessonName={previousName}
            index={index}
          />
        ))}
      </div>
    </main>
  );
}
