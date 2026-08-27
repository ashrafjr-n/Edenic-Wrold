import type { CharacterId } from "@/types/character";
import type { Lesson } from "@/types/lesson";

export const lessonsByCharacter: Record<CharacterId, Lesson[]> = {
  pinki: [
    {
      id: "numbers",
      name: "Learn Numbers",
      description: "Learn numbers 1 to 10",
      image: "/assets/learn-with-pinki/123-pinki.png",
      totalItems: 10,
      locked: false,
    },
    {
      id: "letters",
      name: "Learn Letters",
      description: "Learn the alphabet from A to Z",
      image: "/assets/icons/A.png",
      totalItems: 26,
      locked: true,
    },
    {
      id: "colors",
      name: "Learn Colors",
      description: "Discover colors all around us",
      image: "/assets/icons/blue-ball.png",
      totalItems: 8,
      locked: true,
    },
    {
      id: "shapes",
      name: "Learn Shapes",
      description: "Explore circles, squares and more",
      image: "/assets/icons/ball.png",
      totalItems: 8,
      locked: true,
    },
  ],
  nova: [],
  bloo: [],
};
