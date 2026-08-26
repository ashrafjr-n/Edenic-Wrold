import Image from "next/image";
import Link from "next/link";
import logo from "../../../public/edenic-logo.png";

/** The logo is a **static import**, not a `/edenic-logo.png` string, and that
    matters: a static import is content-hashed into its URL, so replacing the
    file on disk changes the URL and every cache — the browser's, and Next's
    image optimizer's — misses and refetches. A plain public path keeps the same
    URL forever, which is why a redrawn logo appeared not to update. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" aria-label="Edenic World home" className="shrink-0">
      <Image
        src={logo}
        alt="Edenic World"
        preload
        placeholder="blur"
        className={`w-auto ${className}`}
      />
    </Link>
  );
}
