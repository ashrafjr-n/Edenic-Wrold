export type CharacterId = "pinki" | "nova" | "bloo";

export interface Character {
  id: CharacterId;
  name: string;
  image: string;
  accent: string;
  accentSoft: string;
  accentDark: string;
  locked: boolean;
}
