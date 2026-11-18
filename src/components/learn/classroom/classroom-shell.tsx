"use client";

import { ViewTransition, type ComponentProps, type CSSProperties, type ReactNode } from "react";
import { useSelectedLayoutSegments } from "next/navigation";
import type { StaticImageData } from "next/image";
import { BackRow } from "@/components/ui/back-button";
import type { UpNextCourse } from "@/components/learn/up-next";
import type { Framed } from "@/types/course";
import { StarPod } from "@/components/learn/star-pod";
import { ClassroomBackdrop } from "./classroom-backdrop";
import { Chalkboard } from "./chalkboard";
import { ClassroomTeacher } from "./classroom-teacher";

interface ClassroomShellProps {
  characterId: string;
  /** The page's accent and chalk colours (`characterAccent`, `classroomStyle`). */
  style: CSSProperties;
  room: { wall: Framed; desk: Framed; teacher: StaticImageData; cheer: StaticImageData };
  courses: readonly (Pick<UpNextCourse, "id" | "titles"> & { name: string })[];
  labels: {
    /** Back from the hub (to the friend picker). */
    backFromHub: string;
    /** The friend's name, for their button. */
    friend: string;
  };
  starLabels: ComponentProps<typeof StarPod>["labels"];
  /** The page: what is written on the board — the hub's course cards. */
  children: ReactNode;
}

/**
 * A friend's classroom, held by the `learn/[character]` LAYOUT: the wall,
 * the chairs, the board and the friend round the hub (`ClassCourses` writes
 * on the board). Everything under the hub — a course's world of stops
 * (`CourseWorld`), a lesson, a 404 — is the page alone.
 */
export function ClassroomShell({ characterId, style, room, courses, labels, starLabels, children }: ClassroomShellProps) {
  const segments = useSelectedLayoutSegments();
  if (segments.length > 0) return children;
  return (
    <main className="class-page relative flex flex-1 flex-col" style={style}>
      <ClassroomBackdrop wall={room.wall} desk={room.desk} />
      {/* Its own transition group, so the zooming wall never covers it. */}
      <ViewTransition name="class-back">
        <BackRow href="/learn" label={labels.backFromHub}>
          <StarPod characterId={characterId} courses={courses} labels={starLabels} />
        </BackRow>
      </ViewTransition>
      <div className="class-hub">
        <div className="class-stage">
          <Chalkboard className="class-board">
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
