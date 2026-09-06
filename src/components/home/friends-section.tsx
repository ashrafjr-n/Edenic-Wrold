import { characters } from "@/data/characters";
import { SocialLinks } from "@/components/ui/social-links";
import { getDictionary } from "@/lib/locale";
import { FriendPod } from "./friend-pod";

/** A group photo, not a row of boxes: the middle friend stands higher than the
    two beside her, so the trio reads as an arc instead of a list. */
const POD_OFFSETS = ["lg:mt-16", "lg:mt-0", "lg:mt-16"];

export async function FriendsSection() {
  const dict = await getDictionary();

  const cast = characters.map((character, index) => ({
    character,
    offset: POD_OFFSETS[index] ?? "",
  }));

  return (
    <section
      id="friends"
      className="anim-reveal px-4 py-14 sm:px-8 lg:py-20"
      aria-labelledby="friends-heading"
    >
      <div className="card mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-16 lg:py-16">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,23rem)_minmax(0,1fr)] lg:gap-16">
          <div className="text-center lg:text-left">
            <span className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
              {dict.home.friendsEyebrow}
            </span>

            <h2
              id="friends-heading"
              className="mt-3 text-4xl font-bold leading-[1.1] tracking-tight text-[var(--color-ink)] sm:text-5xl"
            >
              {dict.home.friendsHeadingLine1}
              <br />
              {dict.home.friendsHeadingLine2}
            </h2>

            <p className="mt-4 text-lg leading-relaxed text-[var(--color-ink)]/60">
              {dict.home.friendsBody}
            </p>

            <hr className="my-8 border-0 border-t border-[var(--brand-soft)]" />

            <p className="text-sm font-semibold text-[var(--color-ink-soft)]">
              {dict.home.comeSayHello}
            </p>
            <SocialLinks className="mt-4 justify-center lg:justify-start" />
          </div>

          <div className="grid grid-cols-1 gap-12 sm:grid-cols-3 sm:gap-6">
            {cast.map(({ character, offset }) => (
              <FriendPod
                key={character.id}
                character={character}
                tagline={dict.characters[character.id].tagline}
                offset={offset}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
