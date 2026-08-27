export type CharacterId = "pinki" | "nova" | "bloo";

export interface Character {
  id: CharacterId;
  name: string;
  /** One line of "who is this?", for the home page introduction. */
  tagline: string;
  image: string;
  /** Wide illustrated scene for the `/learn/[character]` hero banner. Only
      Pinki has one produced so far — optional until Nova's and Bloo's exist. */
  heroImage?: string;
  accent: string;
  accentSoft: string;
  accentDark: string;
  locked: boolean;
}
