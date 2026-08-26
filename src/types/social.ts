import type { IconType } from "@icons-pack/react-simple-icons";

export interface SocialLink {
  /** Platform name. Used as the accessible label, never rendered as text. */
  label: string;
  href: string;
  Icon: IconType;
  /** The platform's own brand color. Only ever shown on hover — at rest the
      chips stay white, so the row doesn't turn into a rainbow next to the
      characters. */
  brand: string;
}
