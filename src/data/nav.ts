import type { NavItem } from "@/types/nav";

/** The site's primary sections. Labels are translated (`dict.nav`) by
    whichever component renders them — this module only owns the routing
    shape (`id` + `href`), never display text. */
export const mainNav: NavItem[] = [
  { id: "home", href: "/" },
  { id: "learn", href: "/learn" },
  { id: "discover", href: "/discover", alsoCurrentOn: ["/play", "/watch", "/trail"] },
];

/** Whether `item` is the current page's tab. "/" would otherwise prefix-match
    every route on the site. */
export function isNavActive({ href, alsoCurrentOn = [] }: NavItem, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return [href, ...alsoCurrentOn].some((prefix) => prefix !== undefined && pathname.startsWith(prefix));
}

/**
 * The phone bar's fourth tab.
 *
 * Deliberately NOT part of `mainNav`: this is chrome, not a section of the
 * site, so it must never reach `MainNav` or the footer — the header's "Join
 * Edenic World" is the same entry point on the breakpoints where that bar
 * isn't rendered. It carries no `href` because there is no profile to go to
 * until someone signs in.
 */
export const profileNav: NavItem = { id: "profile" };
