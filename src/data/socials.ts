import {
  SiFacebook,
  SiInstagram,
  SiSnapchat,
  SiTiktok,
  SiYoutube,
} from "@icons-pack/react-simple-icons";
import type { SocialLink } from "@/types/social";

/** Placeholder destinations — swap in the real accounts once they exist. */
export const socialLinks: SocialLink[] = [
  {
    label: "YouTube",
    href: "https://youtube.com",
    Icon: SiYoutube,
    brand: "#ff0033",
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    Icon: SiInstagram,
    brand: "#e4405f",
  },
  {
    label: "TikTok",
    href: "https://tiktok.com",
    Icon: SiTiktok,
    brand: "#111111",
  },
  {
    label: "Facebook",
    href: "https://facebook.com",
    Icon: SiFacebook,
    brand: "#0866ff",
  },
  {
    label: "Snapchat",
    href: "https://snapchat.com",
    Icon: SiSnapchat,
    brand: "#fffc00",
  },
];
