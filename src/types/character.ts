export type CharacterId = "pinki" | "nova" | "bloo";

/** The tagline used to live here as a plain field; it's translated content
    now, so it lives in the dictionaries (`dict.characters[id].tagline`)
    instead — components read it from there, not from this type. */
export interface Character {
  id: CharacterId;
  name: string;
  image: string;
  /** Wide illustrated scene for the `/learn/[character]` hero banner. Only
      Pinki has one produced so far — optional until Nova's and Bloo's exist. */
  heroImage?: string;
  accent: string;
  accentSoft: string;
  accentDark: string;
  locked: boolean;
}
