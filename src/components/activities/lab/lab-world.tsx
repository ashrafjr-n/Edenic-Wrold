"use client";

import { useState, type ComponentProps } from "react";
import { CourseWorld } from "@/components/learn/course-world";
import { FriendSays } from "@/components/ui/friend-says";
import { CLASSROOMS } from "@/data/classroom";
import { LAB_KEY } from "@/data/lab";
import { itemKey } from "@/lib/progress-keys";
import { useProgress } from "@/store/progress";

type LabWorldProps = Omit<ComponentProps<typeof CourseWorld>, "characterId" | "lessonId" | "star"> & {
  welcome: readonly string[];
  skipLabel: string;
};

/**
 * The Sleeping Lab on `/play`: the lab's world of stops, and — until the child has
 * done the first stage — Pinki's welcome over it (`FriendSays`), once a visit.
 */
export function LabWorld({ welcome, skipLabel, dir, ...world }: LabWorldProps) {
  const hydrated = useProgress((state) => state.hydrated);
  const started = useProgress((state) => Boolean(state.items[itemKey(LAB_KEY.owner, LAB_KEY.course, 1)]));
  const [heard, setHeard] = useState(false);

  return (
    <>
      <CourseWorld {...world} dir={dir} characterId={LAB_KEY.owner} lessonId={LAB_KEY.course} />
      {hydrated && !started && !heard && (
        <FriendSays picture={CLASSROOMS.pinki.cheer} ink="var(--color-pinki)" lines={welcome} skipLabel={skipLabel} dir={dir} onDone={() => setHeard(true)} />
      )}
    </>
  );
}
