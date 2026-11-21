import type { NavItem } from "@/types/nav";

/** The site's primary sections. Labels are translated (`dict.nav`) by
    whichever component renders them — this module only owns the routing
    shape (`id` + `href`), never display text. */
export const mainNav: NavItem[] = [
  { id: "home", href: "/" },
  { id: "learn", href: "/learn" },
  { id: "watch", href: "/watch" },
  { id: "play", href: "/play" },
];

/** Whether `item` is the current page's tab. "/" would otherwise prefix-match
    every route on the site; `/play` stays lit on every game under it. */
export function isNavActive({ href }: NavItem, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return href !== undefined && pathname.startsWith(href);
}
