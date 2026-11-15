/** Play's Sleeping Lab (2026-11-15, `edenic-plan.md` "Play = The Sleeping Lab"): five
    stages on the cookies of the lab's path, the door the last stop. Played by
    `CourseWorld` as a course of its own — progress `play.lab.<n>`. */
export const LAB_KEY = { owner: "play", course: "lab" } as const;

/** Stages 1…5, the URL segment under `/play/lab`. */
export const LAB_STAGES = [1, 2, 3, 4, 5] as const;

export function isLabStage(value: number): boolean {
  return (LAB_STAGES as readonly number[]).includes(value);
}
