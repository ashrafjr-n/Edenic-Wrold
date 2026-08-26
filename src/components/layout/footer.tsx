import Link from "next/link";
import { mainNav } from "@/data/nav";
import { Logo } from "@/components/ui/logo";
import { SocialLinks } from "@/components/ui/social-links";

const YEAR = new Date().getFullYear();

export function Footer() {
  return (
    /* A white slab rising out of the lavender ground, rounded only along the
       top — the same white-on-lavender lift every card on the site uses, just
       anchored to the bottom of the page. */
    <footer className="rounded-t-[2.5rem] bg-[var(--surface)] px-4 pb-8 pt-12 sm:px-8 lg:pt-16">
      <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:gap-16">
        <div>
          <Logo className="h-14" />
          <p className="mt-4 max-w-xs text-base leading-relaxed text-[var(--color-ink)]/60">
            A gentle place to learn letters, numbers and shapes — built for
            children under ten.
          </p>
        </div>

        <nav aria-label="Footer">
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">
            Explore
          </h2>
          <ul className="mt-4 space-y-2.5">
            {mainNav.map(({ label, href }) => (
              <li key={label}>
                {href ? (
                  <Link
                    href={href}
                    className="text-base font-semibold text-[var(--color-ink)]/70 transition-colors hover:text-[var(--brand)]"
                  >
                    {label}
                  </Link>
                ) : (
                  <span className="text-base font-semibold text-[var(--color-locked-text)]">
                    {label} · soon
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">
            Follow
          </h2>
          <SocialLinks className="mt-4" />
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-7xl border-t border-[var(--brand-soft)] pt-6">
        <p className="text-center text-sm text-[var(--color-ink)]/50">
          © {YEAR} Edenic World. Made for curious little people.
        </p>
      </div>
    </footer>
  );
}
