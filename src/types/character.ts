export type CharacterId = "pinki" | "nova" | "bloo";

/** The tagline used to live here as a plain field; it's translated content
    now, so it lives in the dictionaries (`dict.characters[id].tagline`)
    instead — components read it from there, not from this type. */
export interface Character {
  id: CharacterId;
  name: string;
  image: string;
  accent: string;
  accentSoft: string;
  accentDark: string;
  locked: boolean;
  /** The "Learn With" button's colours on `/learn`, when they are not the
      character's own accent (Nova's is gold, on request). */
  button?: { face: string; edge: string; text: string };
}
