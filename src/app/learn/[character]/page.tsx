import type { CSSProperties } from "react";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { characters } from "@/data/characters";
import { lessonsByCharacter } from "@/data/lessons";
import { BackButton, pageAccent } from "@/components/ui/back-button";
import { LessonCard } from "@/components/learn/lesson-card";
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
  const lastIndex = lessons.length - 1;
  const cast = lessons.map((lesson, index) => ({
    lesson,
    index,
    featured: index === featuredIndex,
    previousName: lesson.locked
      ? lessons[index - 1] && dict.lessons[lessons[index - 1].id].name
      : undefined,
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
        {/* Back on the left, the character chip on the right. **The white
            achievements crown that used to close this row is DELETED**, on
            direct request and for the reason the numbers pages' own crowns
            were cut before it: nothing is awarded yet, so it was chrome
            pointing at a screen that does not exist. Unlike those two rows,
            this one needed no spacer in its place — the chip simply moved
            into the corner it left, which is what `justify-between` gives
            for free. No heading text below them either; the hero scene and
            the lesson list carry the page on their own. */}
        <div
          className="anim-drop-in flex items-center justify-between gap-3"
          style={{ animationDelay: "0.1s" }}
        >
          {/* This character's own accent, handed down by the `<main>`
              above — Pinki's is pink, Nova's lavender, Bloo's blue. */}
          <BackButton href="/learn" label={dict.characterHub.backToLearn} />

          {/* Whose world this is. The hero banner is phone-only now, so
              without this the desktop page would carry no trace of the
              character at all. **It sits at the RIGHT end of the row**, in
              the corner the achievements crown used to hold — it was centred
              between the two buttons, and with one of them gone a centred
              chip would have floated in the middle of an otherwise empty
              row. */}
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
            {/* `dir` on the image itself: `alt` is Arabic with the character's
                Latin name spliced in, and it renders visually if the picture
                ever fails to load — the isolate marks `format()` adds keep the
                name from reordering, but only a base direction puts the run on
                the right side (see `dirFor`). */}
            <Image
              src={character.heroImage}
              alt={format(dict.characterHub.learningCorner, { name: character.name })}
              dir={dirFor(dict.locale)}
              fill
              /* The banner is `sm:hidden`, but a hidden image is still
                 fetched — at plain `100vw` a desktop asked for the 1920/3840
                 rendition of a picture it never shows. The first clause
                 makes the browser pick the smallest candidate there. */
              sizes="(min-width: 640px) 1px, 100vw"
              preload
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
          className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 px-6 pl-12 sm:gap-7 sm:px-8 md:max-w-2xl lg:max-w-7xl lg:grid-cols-3"
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
              name={dict.lessons[lesson.id].name}
              description={dict.lessons[lesson.id].description}
              character={character}
              previousLessonName={previousName}
              featured={featured}
              rail={rail}
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
