import type { LucideIcon } from "lucide-react";

/** One of the two ways into the site, as shown in the home page's closing
    section. */
export interface HomePath {
  title: string;
  description: string;
  Icon: LucideIcon;
  /** Label on the panel's button. */
  action: string;
  /** Omitted while the section has no route yet — the panel then renders its
      action as a disabled chip rather than a dead link. */
  href?: string;
  /** Clay fill and its darker companion. One panel per hero color. */
  face: string;
  edge: string;
}
