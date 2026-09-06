export interface NavItem {
  /** Stable key, independent of the translated `label` — used for React
      keys, active-tab matching and icon lookups so a translation can never
      break them. */
  id: "home" | "learn" | "play" | "profile";
  /** Omitted while a section has no route yet. Those items still render — the
      nav is meant to show the shape of the whole site — but as plain text, so
      nothing in the header can lead to a 404. */
  href?: string;
}
