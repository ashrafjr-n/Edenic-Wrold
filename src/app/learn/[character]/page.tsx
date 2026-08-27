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
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-8">
        {/* Back is chrome: a plain white chip, the same material as a card. */}
        <Link
          href="/learn"
          className="card anim-drop-in inline-flex w-fit items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-[var(--color-ink-soft)] transition hover:text-[var(--color-ink)]"
          style={{ animationDelay: "0.1s" }}
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
          Back
        </Link>

        <div
          className="anim-fade-up relative mt-6 flex items-center justify-between gap-4 sm:mt-8"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="min-w-0">
            <h1 className="text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl">
              Learn With {character.name}
            </h1>
            <p className="mt-2 max-w-sm text-sm text-white/85 sm:text-base">
              Pick a lesson below to start your adventure!
            </p>
          </div>

          <div
            className="anim-pop-in relative shrink-0"
            style={{ animationDelay: "0.3s" }}
          >
            {/* A soft, faintly transparent white disc standing behind the
                portrait — the one piece of "frame" left on this page, since
                a saturated render still needs somewhere to stand without a
                card underneath it. */}
            <div
              className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/25 sm:h-40 sm:w-40"
              aria-hidden
            />
            <Image
              src={character.image}
              alt={character.name}
              width={475}
              height={539}
              priority
              className="relative h-32 w-auto object-contain drop-shadow-[0_16px_20px_rgba(52,38,120,0.35)] sm:h-48"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 grid w-full max-w-4xl grid-cols-1 gap-4 px-4 sm:mt-10 sm:grid-cols-2 sm:px-8">
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
