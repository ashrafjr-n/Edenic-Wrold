"use client";

import { ViewTransition, type CSSProperties, type ReactNode } from "react";
import { useSelectedLayoutSegments } from "next/navigation";
import type { StaticImageData } from "next/image";
import { BackRow } from "@/components/ui/back-button";
import type { UpNextCourse } from "@/components/learn/up-next";
import { COURSE_STOPS } from "@/data/course-stops";
import type { Framed } from "@/types/course";
import type { LessonId } from "@/types/lesson";
import { ClassroomBackdrop } from "./classroom-backdrop";
import { Chalkboard } from "./chalkboard";
import { ClassroomTeacher } from "./classroom-teacher";

interface ClassroomShellProps {
  characterId: string;
  /** The page's accent and chalk colours (`characterAccent`, `classroomStyle`). */
  style: CSSProperties;
  room: { wall: Framed; desk: Framed; teacher: StaticImageData; cheer: StaticImageData };
  courses: readonly Pick<UpNextCourse, "id" | "titles">[];
  labels: {
    /** Back from the hub (to the friend picker) and from a course (to the hub). */
    backFromHub: string;
    backFromCourse: string;
    /** The friend's name, for their button. */
    friend: string;
  };
  /** The page: what is written on the board — the hub's course sheets, or
      a course's lessons. */
  children: ReactNode;
}

/**
 * A friend's classroom, held by the `learn/[character]` LAYOUT (2026-11-04,
 * on request: "going in to a course should only zoom a little and change
 * what is on the board — not build the page again"). Layouts persist
 * across navigations, so the wall, the chairs, the board and the friend
 * are mounted once for the hub and every course page; a page only writes
 * on the board. Going in to a course sets `.class-page--course`: the
 * camera comes closer, the board changes size (up close on a wide screen,
 * a touch bigger on a phone), the friend and the chairs step back or come
 * closer — each a view transition animating its `update`.
 *
 * A lesson (`[lesson]/[item]`), a course with a world of stops
 * (`CourseWorld`) and anything that is not one of the friend's courses (a
 * 404) are not in the classroom: the page alone.
 */
export function ClassroomShell({ characterId, style, room, courses, labels, children }: ClassroomShellProps) {
  const segments = useSelectedLayoutSegments();
  if (segments.length > 1 || (segments.length === 1 && (!courses.some((course) => course.id === segments[0]) || COURSE_STOPS[segments[0] as LessonId]))) return children;
  const course = segments.length === 1;
  return (
    <main className={`class-page relative flex flex-1 flex-col ${course ? "class-page--course" : ""}`} style={style}>
      <ClassroomBackdrop wall={room.wall} desk={room.desk} />
      {/* Its own transition group, so the zooming wall never covers it. */}
      <ViewTransition name="class-back">
        <BackRow
          href={course ? `/learn/${characterId}` : "/learn"}
          label={course ? labels.backFromCourse : labels.backFromHub}
        />
      </ViewTransition>
      <div className={course ? "class-course" : "class-hub"}>
        <div className={course ? "class-course-stage" : "class-stage"}>
          <Chalkboard size={course ? "course" : "hub"} className="class-board">
            {children}
          </Chalkboard>
          <ClassroomTeacher
            characterId={characterId}
            teacher={room.teacher}
            cheer={room.cheer}
            courses={courses}
            label={labels.friend}
          />
        </div>
      </div>
    </main>
  );
}
