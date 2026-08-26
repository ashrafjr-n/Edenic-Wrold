export interface NavItem {
  label: string;
  /** Omitted while a section has no route yet. Those items still render — the
      nav is meant to show the shape of the whole site — but as plain text, so
      nothing in the header can lead to a 404. */
  href?: string;
}
