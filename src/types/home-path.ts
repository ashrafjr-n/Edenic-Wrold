/** One of the two ways into the site, as shown in the home page's closing
    section. */
export interface HomePath {
  title: string;
  description: string;
  /** Art bedded into the panel's fill, in place of an icon. */
  art: {
    src: string;
    /** Decorative, so the alt is empty — but the shape still has to be known
        for layout, and one of the two is a transparent cut-out that needs
        `contain` rather than `cover`. */
    fit: "cover" | "contain";
  };
  /** Label on the panel's button. */
  action: string;
  /** Omitted while the section has no route yet — the panel then renders its
      action as a disabled chip rather than a dead link. */
  href?: string;
  /** Clay fill and its darker companion. One panel per hero color. */
  face: string;
  edge: string;
}
