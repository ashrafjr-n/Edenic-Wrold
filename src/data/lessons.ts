import type { CharacterId } from "@/types/character";
import type { Lesson } from "@/types/lesson";

export const lessonsByCharacter: Record<CharacterId, Lesson[]> = {
  pinki: [
    {
      id: "numbers",
      name: "Learn Numbers",
      image: "/assets/learn-with-pinki/123-pinki.png",
      locked: false,
    },
    {
      id: "letters",
      name: "Learn Letters",
      image: "/assets/icons/A.png",
      locked: true,
    },
    {
      id: "colors",
      name: "Learn Colors",
      image: "/assets/icons/blue-ball.png",
      locked: true,
    },
    {
      id: "shapes",
      name: "Learn Shapes",
      image: "/assets/icons/ball.png",
      locked: true,
    },
  ],
  nova: [],
  bloo: [],
};
