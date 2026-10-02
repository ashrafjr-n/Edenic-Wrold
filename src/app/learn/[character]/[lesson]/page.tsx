import type { CSSProperties } from "react";
import { notFound, redirect } from "next/navigation";
import { resolveLessonRoute } from "@/lib/learn-route";
import { BackRow, pageAccent } from "@/components/ui/back-button";
import { ContinueButton } from "@/components/learn/continue-button";
import { LessonBox } from "@/components/learn/lesson-box";
import { CourseArt } from "@/components/learn/course-art";
import { CourseProgress } from "@/components/learn/course-progress";
import { courseCovers, courseStops } from "@/data/courses";
import { getDictionary } from "@/lib/locale";
import { format, dirFor } from "@/lib/format-dict";

interface LessonPageProps {
  params: Promise<{ character: string; lesson: string }>;
  /** `from` — the lesson just finished, sent by its "Next" button. */
  searchParams: Promise<{ from?: string }>;
}

/**
 * A course's own page: its lessons as a box of things (`LessonBox`) — every
 * course, written or still to come — in three layouts, one per screen size,
 * each its own JSX tree:
 *
 * - **Phone (< sm):** a course banner, the box two cells a row, a fixed
 *   Continue bar above the bottom nav.
 * - **Tablet (sm – lg):** the same, grown — a taller banner, the box at
 *   tablet size, the Continue bar at the bottom edge.
 * - **Desktop (lg+):** the height of the screen, no scrolling — the course
 *   in a tall banner on the left with Continue under it, the box filling a
 *   board tinted in the course colour on the right.
 *
 * `?from=n` (the lesson just finished) makes the box tick it and open the
 * next cell — see `useCourseWalk`.
 */
export default async function LessonPage({ params, searchParams }: LessonPageProps) {
  const { character: characterId, lesson: lessonId } = await params;
  const from = Number((await searchParams).from);
  const route = resolveLessonRoute(characterId, lessonId);

  if (route.status === "missing") notFound();
  if (route.status === "locked") redirect(route.backHref);

  const { character, lesson } = route;
  const dict = await getDictionary();
  const dir = dirFor(dict.locale);
  const course = dict.lessons[lesson.id];
  const basePath = `/learn/${character.id}/${lesson.id}`;
  const tone = { face: lesson.theme.accent, edge: lesson.theme.accentDark };
  const lessonsCount = format(dict.lessonPicker.lessonsCount, { n: lesson.totalItems });
  const advanceFrom = Number.isInteger(from) && from > 0 ? from : undefined;
  const stops = courseStops(lesson.id);
  /* The lessons themselves, one box per screen size. */
  const lessons = (size: "phone" | "tablet" | "wide") => (
    <LessonBox
      titles={course.items}
      stops={stops}
      characterId={character.id}
      lessonId={lesson.id}
      basePath={basePath}
      tone={tone}
      dict={dict.lessonPicker}
      advanceFrom={advanceFrom}
      size={size}
    />
  );

  return (
    <main
      /* `pb-[6.75rem]` (108px) on a phone matches the fixed Continue bar's
         own measured height exactly — it used to be `pb-36` (144px), 36px
         too much, which opened a bare gap of page background between the
         sheet's bottom row and the bar every time the page was scrolled all
         the way down. */
      className="relative flex flex-1 flex-col pb-[6.75rem] sm:pb-32 lg:pb-10"
      style={pageAccent(character.accent, character.accentDark)}
    >
      {/* ONE back row for every layout below — `BackRow` puts the button
          where it is on every page. */}
      <BackRow
        href={`/learn/${character.id}`}
        label={format(dict.lessonPicker.backTo, { characterName: character.name })}
      />

      {/* ================= Phone (< sm) =================
          The course as a banner in its own colour — title, progress, its
          things piled on the right — then its lessons as a box of things
          (`LessonBox`). */}
      <div className="flex w-full flex-1 flex-col px-6 sm:hidden">
        <section
          className="card clay anim-pop-in relative mt-6 flex items-center gap-2 py-5 pl-5 pr-2"
          style={
            {
              backgroundColor: tone.face,
              "--clay-edge": tone.edge,
              animationDelay: "0.1s",
            } as CSSProperties
          }
        >
          <div dir={dir} className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wide text-white/85">{lessonsCount}</p>
            <h1 className="clay-title mt-0.5 text-[1.625rem] font-bold leading-tight text-white">
              {course.name}
            </h1>
            <p className="mt-1 text-balance text-sm leading-snug text-white/90">
              {course.description}
            </p>
            <CourseProgress
              characterId={character.id}
              lessonId={lesson.id}
              total={lesson.totalItems}
              className="mt-3.5"
            />
          </div>
          <CourseArt images={courseCovers(lesson.id)} width={128} className="-my-6 h-32 w-32 shrink-0" />
        </section>

        <div className="mt-7">{lessons("phone")}</div>
      </div>

      {/* ================= Tablet (sm – lg) =================
          The phone's banner and box, grown: a taller banner with a bigger
          pile of things, the box at tablet size (`size="tablet"`). */}
      <div className="mx-auto hidden w-full max-w-3xl flex-1 flex-col px-8 sm:flex lg:hidden">
        <section
          className="card clay anim-pop-in relative mt-8 flex items-center gap-6 py-8 pl-8 pr-4"
          style={{ backgroundColor: tone.face, "--clay-edge": tone.edge, animationDelay: "0.1s" } as CSSProperties}
        >
          <div dir={dir} className="min-w-0 flex-1">
            <p className="text-sm font-bold uppercase tracking-wide text-white/85">{lessonsCount}</p>
            <h1 className="clay-title mt-1 text-4xl font-bold leading-tight text-white">{course.name}</h1>
            <p className="mt-2 text-balance text-lg leading-snug text-white/90">{course.description}</p>
            <CourseProgress characterId={character.id} lessonId={lesson.id} total={lesson.totalItems} className="mt-5" />
          </div>
          <CourseArt images={courseCovers(lesson.id)} width={224} className="-my-12 h-56 w-56 shrink-0" />
        </section>

        <div className="mt-4">
          {lessons("tablet")}
        </div>
      </div>

      {/* Continue — a fixed bar above the phone's `BottomNav` (at the bottom
          edge on a tablet). `lg:hidden`: the desktop puts its own under the
          banner. */}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 pb-4 pt-10 sm:bottom-0 sm:pb-6 lg:hidden"
        style={{ background: "linear-gradient(to top, var(--background) 55%, transparent)" }}
      >
        <div className="pointer-events-auto mx-auto w-full max-w-3xl px-6 sm:px-8">
          <ContinueButton
            count={lesson.totalItems}
            characterId={character.id}
            lessonId={lesson.id}
            basePath={basePath}
            tone={tone}
            dict={dict}
            className="w-full py-3.5 text-base sm:py-4 sm:text-lg"
          />
        </div>
      </div>

      {/* ================= Desktop (lg and up) =================
          The height of the screen, in two parts: the course on the left
          (its pile of things, name, progress, Continue), and the box on
          the right, filling a board tinted in the course colour
          (`size="wide"`) — every lesson in view at once, no scrolling. */}
      <div className="mx-auto hidden w-full max-w-7xl gap-8 px-8 pt-6 lg:flex lg:h-[calc(100svh-12.5rem)] lg:min-h-[30rem] xl:gap-10 xl:px-12">
        <aside className="flex w-[21rem] shrink-0 flex-col gap-5 xl:w-[24rem]">
          <section
            className="card clay anim-pop-in flex min-h-0 flex-1 flex-col p-7"
            style={{ backgroundColor: tone.face, "--clay-edge": tone.edge, animationDelay: "0.1s" } as CSSProperties}
          >
            <CourseArt images={courseCovers(lesson.id)} width={300} className="mx-auto min-h-0 w-full flex-1" />
            <div dir={dir} className="mt-4">
              <p className="text-sm font-bold uppercase tracking-wide text-white/85">{lessonsCount}</p>
              <h1 className="clay-title mt-1 text-4xl font-bold leading-tight text-white xl:text-5xl">{course.name}</h1>
              <p className="mt-2 text-lg leading-snug text-white/90">{course.description}</p>
            </div>
            <CourseProgress characterId={character.id} lessonId={lesson.id} total={lesson.totalItems} className="mt-5" />
          </section>
          <ContinueButton
            count={lesson.totalItems}
            characterId={character.id}
            lessonId={lesson.id}
            basePath={basePath}
            tone={tone}
            dict={dict}
            className="w-full py-4 text-lg"
          />
        </aside>

        <div
          className="card card-clay-white anim-fade-up min-w-0 flex-1 px-10 py-6"
          style={{ background: `color-mix(in srgb, ${tone.face} 14%, var(--surface))`, animationDelay: "0.2s" }}
        >
          {lessons("wide")}
        </div>
      </div>
    </main>
  );
}
