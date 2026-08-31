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
    href: "https://www.tiktok.com/@edenic.world?_r=1&_t=ZS-99M08l3uF0x",
    Icon: SiTiktok,
    brand: "#111111",
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
  },
];
