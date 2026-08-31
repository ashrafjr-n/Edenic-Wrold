import type { IconType } from "@icons-pack/react-simple-icons";

export interface SocialLink {
  /** Platform name. Used as the accessible label, never rendered as text. */
  label: string;
  href: string;
  Icon: IconType;
  /** The platform's own brand color — the chip's fill at rest, grained, and
      darkened on hover. (It used to appear only on hover, over a white chip;
      that was reversed on request.) */
  brand: string;
  /** The icon's own color on top of `brand`. Defaults to white; only a pale
      fill like Snapchat's yellow needs to override it, since a white icon on
      yellow cannot be read at this size. */
  ink?: string;
}
