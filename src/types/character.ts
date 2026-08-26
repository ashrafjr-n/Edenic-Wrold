export type CharacterId = "pinki" | "nova" | "bloo";

export interface Character {
  id: CharacterId;
  name: string;
  /** One line of "who is this?", for the home page introduction. */
  tagline: string;
  image: string;
  accent: string;
  accentSoft: string;
  accentDark: string;
  locked: boolean;
}
