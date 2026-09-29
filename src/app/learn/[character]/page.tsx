import type { CSSProperties } from "react";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { characters } from "@/data/characters";
import { lessonsByCharacter } from "@/data/lessons";
import { BackRow, pageAccent } from "@/components/ui/back-button";
import { LessonCard } from "@/components/learn/lesson-card";
import { CourseCard } from "@/components/learn/course-card";
import pinkiSpeak from "../../../../public/assets/learn-with-pinki/pinki/pinki-speak.png";
import { getDictionary } from "@/lib/locale";
import { dirFor } from "@/lib/format-dict";
import { format } from "@/lib/format-dict";

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

  const dict = await getDictionary();
  const lessons = lessonsByCharacter[character.id];
  /* The lesson to lead with. Once the progress store lands this becomes the
     first unlocked *and unfinished* one; for now the first unlocked lesson is
     the same thing. `-1` (nothing unlocked) simply features nothing. */
  const featuredIndex = lessons.findIndex((lesson) => !lesson.locked);
  const cast = lessons.map((lesson, index) => ({
    lesson,
    index,
    featured: index === featuredIndex,
    /* What `LessonProgress` counts as done: the course's lessons, 1…n. */
    items: Array.from({ length: lesson.totalItems }, (_, i) => i + 1),
    previousName: lesson.locked
      ? lessons[index - 1] && dict.lessons[lessons[index - 1].id].name
      : undefined,
  }));

  /* This character owns the page, so the back button beneath reads the
     accent from here — Nova's and Bloo's hubs come out right by default
     rather than wearing Pinki's pink. */
  return (
    <main
      className="relative flex flex-1 flex-col pb-20 sm:pb-28"
      style={pageAccent(character.accent, character.accentDark)}
    >
      {/* Back on the left, the character chip on the right — in `BackRow`,
          the one row that puts the back button where every page has it.
          **The white achievements crown that used to close this row is
          DELETED**: nothing is awarded yet. */}
      <BackRow href="/learn" label={dict.characterHub.backToLearn}>
        {/* Whose world this is. The hero banner is phone-only now, so
            without this the desktop page would carry no trace of the
            character at all. **It sits at the RIGHT end of the row**, in
            the corner the achievements crown used to hold — it was centred
            between the two buttons, and with one of them gone a centred
            chip would have floated in the middle of an otherwise empty
            row. */}
        <div className="card card-pill hidden min-w-0 items-center gap-2.5 py-1.5 pl-1.5 pr-5 sm:flex sm:gap-3 sm:pr-6">
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
              width={64}
              height={73}
              preload
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
      </BackRow>

      {/* ================= Phone (< sm) =================
          Pinki says hello from a speech bubble, then each course is one big
          clay card in its own colour (`CourseCard`). Pinki's picture is
          hers alone for now: Nova's and Bloo's hubs are not reachable. */}
      <div className="flex flex-col px-6 sm:hidden">
        <div className="mt-2 flex items-end gap-1">
          <Image
            src={pinkiSpeak}
            alt=""
            sizes="104px"
            preload
            className="anim-pop-in w-26 shrink-0"
            style={{ animationDelay: "0.1s" }}
          />
          <div
            dir={dirFor(dict.locale)}
            className="hub-bubble card card-clay-white speech-clay anim-pop-in relative mb-5 min-w-0 flex-1 px-5 py-4"
            style={{ animationDelay: "0.2s" }}
          >
            <h1 className="text-xl font-bold leading-tight text-[var(--color-ink)]">
              {format(dict.characterHub.hello, { name: character.name })}
            </h1>
            <p className="mt-1 text-sm text-[var(--color-ink-soft)]">{dict.characterHub.askToday}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-5">
          {lessons.map((lesson, index) => (
            <CourseCard
              key={lesson.id}
              lesson={lesson}
              characterId={character.id}
              name={dict.lessons[lesson.id].name}
              description={dict.lessons[lesson.id].description}
              ariaLabel={format(dict.characterHub.startLesson, { name: dict.lessons[lesson.id].name })}
              dir={dirFor(dict.locale)}
              index={index}
            />
          ))}
        </div>
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
      <div className="hidden w-full sm:my-auto sm:block sm:pt-10">
        {/* The extra left padding below `sm` is the lane the phone progress
            rail lives in; from `sm` up the rail is gone and the padding goes
            back to matching the rest of the page.

            `--character-accent*` is the phone fallback the lesson hues
            switch back to below `sm`. */}
        <div
          className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 px-6 sm:gap-7 sm:px-8 md:max-w-2xl lg:max-w-7xl lg:grid-cols-3"
          style={
            {
              "--character-accent": character.accent,
              "--character-accent-dark": character.accentDark,
            } as CSSProperties
          }
        >
          {cast.map(({ lesson, index, featured, items, previousName }) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              name={dict.lessons[lesson.id].name}
              description={dict.lessons[lesson.id].description}
              items={items}
              character={character}
              previousLessonName={previousName}
              featured={featured}
              index={index}
              dict={dict.characterHub}
              dir={dirFor(dict.locale)}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
