import Link from "next/link";
import { mainNav } from "@/data/nav";
import { Logo } from "@/components/ui/logo";
import { SocialLinks } from "@/components/ui/social-links";
import { getDictionary } from "@/lib/locale";
import { format, dirFor } from "@/lib/format-dict";

const YEAR = new Date().getFullYear();

export async function Footer() {
  const dict = await getDictionary();

  return (
    /* A white slab rising out of the lavender ground, rounded only along the
       top — the same white-on-lavender lift every card on the site uses, just
       anchored to the bottom of the page. */
    <footer className="rounded-t-[2.5rem] bg-[var(--surface)] px-4 pb-8 pt-12 sm:px-8 lg:pt-16">
      <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:gap-16">
        <div>
          <Logo className="h-14" />
          <p className="mt-4 max-w-xs text-base leading-relaxed text-[var(--color-ink)]/60">
            {dict.footer.tagline}
          </p>
        </div>

        <nav aria-label={dict.nav.footerAriaLabel}>
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">
            {dict.footer.explore}
          </h2>
          <ul className="mt-4 space-y-2.5">
            {mainNav.map(({ id, href }) => (
              <li key={id}>
                {href ? (
                  <Link
                    href={href}
                    className="text-base font-semibold text-[var(--color-ink)]/70 transition-colors hover:text-[var(--brand)]"
                  >
                    {dict.nav[id]}
                  </Link>
                ) : (
                  <span className="text-base font-semibold text-[var(--color-locked-text)]">
                    {dict.nav[id]} · {dict.nav.soon}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">
            {dict.footer.follow}
          </h2>
          <SocialLinks className="mt-4" />
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-7xl border-t border-[var(--brand-soft)] pt-6">
        <p dir={dirFor(dict.locale)} className="text-center text-sm text-[var(--color-ink)]/50">
          {format(dict.footer.copyright, { year: YEAR })}
        </p>
      </div>
    </footer>
  );
}
