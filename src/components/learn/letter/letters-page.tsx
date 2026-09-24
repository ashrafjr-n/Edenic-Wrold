import Image from "next/image";
import { BackRow, pageAccent } from "@/components/ui/back-button";
import { format, dirFor } from "@/lib/format-dict";
import type { Character } from "@/types/character";
import type { Lesson } from "@/types/lesson";
import type { Dictionary } from "@/lib/dictionaries/en";
import { LetterMap } from "./letter-map";
import { AlphabetBook } from "./alphabet-book";

interface LettersPageProps {
  character: Character;
  lesson: Lesson;
  dict: Dictionary;
}

/**
 * `/learn/pinki/letters` — the Letters map.
 *
 * Not the number picker's list: Letters is a PATH, A to Z in five units, the
 * way Duolingo lays out a course. A white intro card (Pinki holding ABC, the
 * title, the Alphabet Book) leads it; from `lg` that card becomes a sticky
 * sidebar beside the path, so the desktop is one composition, not a phone
 * stretched wide.
 *
 * **Everything here wears the CHARACTER's colour (Pinki's pink), not the
 * Letters subject violet** — on direct request: this is Pinki's section. The
 * violet stays on the hub's Letters card, where it tells the lessons apart.
 */
export function LettersPage({ character, lesson, dict }: LettersPageProps) {
  const dir = dirFor(dict.locale);
  const basePath = `/learn/${character.id}/${lesson.id}`;
  const tone = { face: character.accent, edge: character.accentDark };

  return (
    <main
      className="relative flex flex-1 flex-col overflow-x-clip pb-16 sm:pb-24"
      style={pageAccent(character.accent, character.accentDark)}
    >
      <BackRow
        href={`/learn/${character.id}`}
        label={format(dict.lessonPicker.backTo, { characterName: character.name })}
      />

      <div className="mx-auto mt-6 w-full max-w-5xl px-6 sm:px-8 lg:mt-8">
        <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[20rem_1fr] lg:items-start lg:gap-14">
          <div className="card card-clay-white anim-pop-in flex flex-col items-center gap-3 px-6 pb-6 pt-4 text-center lg:sticky lg:top-44">
            <Image
              src={lesson.image}
              alt=""
              width={180}
              height={192}
              sizes="180px"
              preload
              className="anim-breathe h-36 w-auto object-contain sm:h-44"
            />
            <h1 className="text-3xl font-bold text-[var(--color-ink)] sm:text-4xl">
              {dict.letters.title}
            </h1>
            <p dir={dir} className="text-sm font-semibold text-[var(--color-ink-soft)] sm:text-base">
              {dict.letters.subtitle}
            </p>
            <div className="mt-2 w-full">
              <AlphabetBook
                characterId={character.id}
                lessonId={lesson.id}
                tone={tone}
                dict={dict}
              />
            </div>
          </div>

          <LetterMap
            characterId={character.id}
            lessonId={lesson.id}
            basePath={basePath}
            tone={tone}
            dict={dict}
          />
        </div>
      </div>
    </main>
  );
}
