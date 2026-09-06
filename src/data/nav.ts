import type { NavItem } from "@/types/nav";

/** The site's primary sections. Labels are translated (`dict.nav`) by
    whichever component renders them — this module only owns the routing
    shape (`id` + `href`), never display text. */
export const mainNav: NavItem[] = [
  { id: "home", href: "/" },
  { id: "learn", href: "/learn" },
  { id: "play", href: "/play" },
];

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
