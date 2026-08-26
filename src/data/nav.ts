import type { NavItem } from "@/types/nav";

/** The site's primary sections. Activities has no `href` yet — the page isn't
    built, and a header link that 404s is worse than one that waits. */
export const mainNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Learn", href: "/learn" },
  { label: "Activities" },
];
