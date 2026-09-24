import type { LetterWord } from "@/types/letter-item";

/**
 * The short words a Letters session can ask a child to spell.
 *
 * Letters are taught A–Z, so a word only appears once every letter in it is
 * open to the child — `cab` after C, `bed` after E, and nothing at all for
 * A and B. `sessionFor` makes that check; this list only has to hold words
 * a small child can picture and sound out: three or four letters, one sound
 * per letter, and a picture that can only mean that word.
 */
export const BUILD_WORDS: readonly LetterWord[] = [
  { word: "cab", emoji: "🚕" },
  { word: "bed", emoji: "🛏️" },
  { word: "bee", emoji: "🐝" },
  { word: "bag", emoji: "👜" },
  { word: "egg", emoji: "🥚" },
  { word: "hat", emoji: "🎩" },
  { word: "bat", emoji: "🦇" },
  { word: "cat", emoji: "🐱" },
  { word: "leg", emoji: "🦵" },
  { word: "hen", emoji: "🐔" },
  { word: "dog", emoji: "🐶" },
  { word: "box", emoji: "📦" },
  { word: "pig", emoji: "🐷" },
  { word: "pen", emoji: "🖊️" },
  { word: "map", emoji: "🗺️" },
  { word: "rat", emoji: "🐀" },
  { word: "sun", emoji: "☀️" },
  { word: "ten", emoji: "🔟" },
  { word: "nut", emoji: "🥜" },
  { word: "bus", emoji: "🚌" },
  { word: "cup", emoji: "🥤" },
  { word: "van", emoji: "🚐" },
  { word: "web", emoji: "🕸️" },
  { word: "fox", emoji: "🦊" },
  { word: "six", emoji: "6️⃣" },
  { word: "zip", emoji: "🤐" },
];
