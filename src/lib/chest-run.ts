/** The course whose last lesson was just finished (its Finish pressed) (`pinki.shapes`): the course page then walks to the chest and opens
    it (2026-11-11). Kept in memory — only that click may ask for it, never a
    reload or the back button. */
let asked: string | null = null;

export const askChest = (course: string) => {
  asked = course;
};

/** Whether the chest was asked for in `course`; asking is used up. */
export const takeChest = (course: string) => {
  const was = asked === course;
  asked = null;
  return was;
};

/** The same, without using it up (a state initialiser can run twice). */
export const peekChest = (course: string) => asked === course;

/** The courses whose chest has opened on this device, so it opens by itself
    once and after that only when tapped. */
const SEEN = "edenic-chest-opened";
const read = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(SEEN) ?? "[]");
  } catch {
    return [];
  }
};

export const chestSeen = {
  has: (course: string) => read().includes(course),
  mark: (course: string) => {
    try {
      localStorage.setItem(SEEN, JSON.stringify([...new Set([...read(), course])]));
    } catch {
      /* Storage off: it just opens by itself again next visit. */
    }
  },
};
