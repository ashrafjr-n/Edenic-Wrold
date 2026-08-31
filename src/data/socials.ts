import {
  SiFacebook,
  SiInstagram,
  SiSnapchat,
  SiTiktok,
  SiYoutube,
} from "@icons-pack/react-simple-icons";
import type { SocialLink } from "@/types/social";

export const socialLinks: SocialLink[] = [
  {
    label: "YouTube",
    href: "https://www.youtube.com/@EdenicWorld-kids",
    Icon: SiYoutube,
    brand: "#ff0033",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/edenic.world/",
    Icon: SiInstagram,
    brand: "#e4405f",
  },
  {
    label: "TikTok",
    /* A deep purple rather than TikTok's own near-black: asked for directly,
       and a black chip in this row reads as a hole next to four saturated
       ones. */
    brand: "#6b3fa0",
    href: "https://www.tiktok.com/@edenic.world?_r=1&_t=ZS-99M08l3uF0x",
    Icon: SiTiktok,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61591428555515",
    Icon: SiFacebook,
    brand: "#0866ff",
  },
  {
    label: "Snapchat",
    href: "https://snapchat.com/t/1H9eHXOO",
    Icon: SiSnapchat,
    brand: "#fffc00",
    /* The one chip whose fill is too pale for a white icon — Snapchat's own
       branding is a dark ghost on yellow for the same reason. */
    ink: "var(--color-ink)",
  },
];
