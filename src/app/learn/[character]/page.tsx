import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { characters } from "@/data/characters";
import { lessonsByCharacter } from "@/data/lessons";
import { courseLessons } from "@/data/courses";
import { BackRow, pageAccent } from "@/components/ui/back-button";
import { CourseCard } from "@/components/learn/course-card";
import { CourseCardWide } from "@/components/learn/course-card-wide";
import { UpNext, type UpNextCourse } from "@/components/learn/up-next";
import pinkiSpeak from "../../../../public/assets/learn-with-pinki/pinki/pinki-speak.png";
import nova from "../../../../public/assets/friends/nova.png";
import bloo from "../../../../public/assets/friends/bloo.png";
import { getDictionary } from "@/lib/locale";
import { dirFor } from "@/lib/format-dict";
import { format } from "@/lib/format-dict";

/** Who says hello on each hub. Only Pinki has a talking pose yet; Nova and
    Bloo wave from their portraits until theirs arrive. */
const hello = { pinki: pinkiSpeak, nova, bloo };

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
  const dir = dirFor(dict.locale);
  const lessons = lessonsByCharacter[character.id];
  const upNextCourses: UpNextCourse[] = lessons
    .filter((lesson) => !lesson.locked)
    .map((lesson) => ({
      id: lesson.id,
      name: dict.lessons[lesson.id].name,
      titles: dict.lessons[lesson.id].items,
      covers: courseLessons[lesson.id].map((def) => def.cover),
      tone: { face: lesson.theme.accent, edge: lesson.theme.accentDark },
    }));
  const upNext = (className: string) => (
    <UpNext
      characterId={character.id}
      courses={upNextCourses}
      labels={{
        upNext: dict.characterHub.nextUp,
        start: dict.lessonPicker.ctaStart,
        continue: dict.trail.ctaContinue,
      }}
      dir={dir}
      className={className}
    />
  );

  /* This character owns the page, so the back button beneath reads the
     accent from here — Nova's and Bloo's hubs come out right by default
     rather than wearing Pinki's pink. */
  return (
    <main
      className="relative flex flex-1 flex-col pb-20 sm:pb-10"
      style={pageAccent(character.accent, character.accentDark)}
    >
      {/* Back alone: Pinki herself says whose page this is, at every width. */}
      <BackRow href="/learn" label={dict.characterHub.backToLearn} />

      {/* ================= Phone (< sm) =================
          Pinki says hello from a speech bubble, then each course is one big
          clay card in its own colour (`CourseCard`). */}
      <div className="flex flex-col px-6 sm:hidden">
        <div className="mt-2 flex items-end gap-1">
          <Image
            src={hello[character.id]}
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

      {/* ================= Tablet + desktop (sm and up) =================
          The phone's pieces grown to fill a big screen. Tablet: Pinki and
          her bubble across the top, the two courses side by side as tall
          cards, "Up next" under them. Desktop: two columns the height of
          the screen — Pinki, her bubble and "Up next" on the left, the
          courses stacked on the right, each taking half the height. */}
      <div className="mx-auto hidden w-full max-w-7xl flex-1 flex-col px-8 pt-4 sm:flex lg:grid lg:h-[calc(100svh-13rem)] lg:min-h-[32rem] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:grid-rows-[1fr_auto] lg:gap-10 lg:pt-6 xl:gap-14 xl:px-12">
        <section className="flex items-end gap-5 lg:flex-col-reverse lg:items-center lg:justify-center lg:gap-3">
          <Image
            src={hello[character.id]}
            alt=""
            sizes="(min-width: 1024px) 18rem, 11rem"
            preload
            className="anim-pop-in w-44 shrink-0 lg:w-[min(18rem,32svh)]"
            style={{ animationDelay: "0.1s" }}
          />
          <div
            dir={dir}
            className="hub-bubble hub-bubble--wide card card-clay-white speech-clay anim-pop-in relative mb-8 min-w-0 flex-1 px-8 py-6 lg:mb-0 lg:w-full lg:flex-none lg:text-center"
            style={{ animationDelay: "0.2s" }}
          >
            <h1 className="text-3xl font-bold leading-tight text-[var(--color-ink)] xl:text-4xl">
              {format(dict.characterHub.hello, { name: character.name })}
            </h1>
            <p className="mt-1.5 text-lg text-[var(--color-ink-soft)] xl:text-xl">{dict.characterHub.askToday}</p>
          </div>
        </section>

        <div className="mt-8 grid flex-1 auto-rows-fr grid-cols-2 gap-6 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:grid-cols-1 xl:gap-8">
          {lessons.map((lesson, index) => (
            <CourseCardWide
              key={lesson.id}
              lesson={lesson}
              characterId={character.id}
              name={dict.lessons[lesson.id].name}
              description={dict.lessons[lesson.id].description}
              count={format(dict.lessonPicker.lessonsCount, { n: lesson.totalItems })}
              ariaLabel={format(dict.characterHub.startLesson, { name: dict.lessons[lesson.id].name })}
              dir={dir}
              index={index}
            />
          ))}
        </div>

        {upNext("anim-fade-up mt-6 lg:col-start-1 lg:row-start-2 lg:mt-0 lg:self-start")}
      </div>
    </main>
  );
}
