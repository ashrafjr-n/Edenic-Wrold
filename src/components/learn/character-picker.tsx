import { characters } from "@/data/characters";
import { CharacterCard } from "./character-card";

/** Which character gates each locked one. `characters` is static, so this is
    resolved once at module load rather than on every render. */
const cast = characters.map((character, index) => ({
  character,
  index,
  previousName: character.locked ? characters[index - 1]?.name : undefined,
}));

/** The `/learn` landing step: choose a friend, then their lesson hub. This was
    the site's home page until the marketing home took that route over.
 *
 * **Everything lives inside ONE white card**, and it is deliberately the very
 * same `.card` the home page's "Meet the friends" section uses — same class,
 * same `max-w-7xl`, same padding — not a lookalike. The two pages have to read
 * as one design family, and `.card` is where the radius and the shadow are
 * defined, so sharing the class is the only way they can never drift apart.
 * The characters used to float straight on the page background here, which is
 * what made this route feel unfinished next to the home page.
 */
export function CharacterPicker() {
  return (
    <section className="flex flex-1 flex-col justify-center px-4 pb-12 pt-4 sm:px-8 sm:pb-16 sm:pt-6">
      <div className="card mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-16 lg:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1
            className="anim-drop-in text-4xl font-bold leading-tight tracking-tight text-[var(--color-ink)] sm:text-6xl"
            style={{ animationDelay: "0.15s" }}
          >
            Learn. <span className="text-[var(--color-head-play)]">Play.</span>{" "}
            <span className="text-[var(--color-head-grow)]">Grow.</span>
          </h1>
          <p
            className="anim-drop-in mx-auto mt-3 max-w-xl text-lg text-[var(--color-ink)]/60 sm:text-xl"
            style={{ animationDelay: "0.35s" }}
          >
            Pick a friend and start your learning adventure!
          </p>
        </div>

        {/* One friend per row until `lg`, the three side by side above it.
            Deliberately `lg` and not `sm` — the same call the lesson hub's
            grid makes, and for the same reason: this page's portraits are the
            main cast shot, roughly twice the size of the home page's friend
            pods, and three 14rem tiles simply do not fit inside this card at
            a tablet's width. They overlapped each other from 640px to about
            900px before this. "Desktop" here means real desktop width. */}
        <div className="mx-auto mt-14 w-full max-w-6xl lg:mt-16">
          <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-end lg:justify-center lg:gap-14">
            {cast.map(({ character, index, previousName }) => (
              <CharacterCard
                key={character.id}
                character={character}
                index={index}
                previousName={previousName}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
