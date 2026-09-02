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
    the site's home page until the marketing home took that route over. */
export function CharacterPicker() {
  return (
    <section className="flex flex-1 flex-col justify-center px-4 pb-12 pt-4 sm:px-8 sm:pb-16 sm:pt-6">
      <div className="mx-auto -mt-2 max-w-3xl text-center sm:-mt-4">
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

      {/* The hero centers as one group. Pinning the cast to the bottom with
          `mt-auto` instead left a large dead gap under the subtitle on a tall
          viewport — the space reads better distributed above and below. */}
      <div className="mx-auto mt-8 w-full max-w-6xl sm:mt-11">
        <div className="flex flex-col items-center gap-10 sm:flex-row sm:items-end sm:justify-center sm:gap-6 lg:gap-14">
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
    </section>
  );
}
