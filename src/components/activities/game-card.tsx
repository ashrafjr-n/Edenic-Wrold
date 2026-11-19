import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import type { PlayCard } from "@/data/play-games";

type ClayVars = CSSProperties & { "--clay-edge": string; "--card-face": string; "--card-ink": string };

interface GameCardProps {
  card: PlayCard;
  title: string;
  alt: string;
  dir: "rtl" | "ltr";
  /** Laid over the picture — `PlayLock`'s frosted padlock. */
  cover?: ReactNode;
  /** The foot's end: the play dot, "Open it!", a padlock dot or "Coming soon". */
  action: ReactNode;
  /** The whole card is a link here (an open game)… */
  href?: string;
  /** …or one big button (a shut game the child cannot open yet). */
  onClick?: () => void;
  label?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * One of `/play`'s games: a clay tile in the game's colour (grain and all)
 * holding its picture in a white-rimmed window, and under it a foot with the
 * game's name and, at its end, what the card does. Open, the whole tile is
 * the link; on hover the picture leans in and the play dot swells — the
 * tile itself never moves.
 */
export function GameCard({ card, title, alt, dir, cover, action, href, onClick, label, className = "", style }: GameCardProps) {
  const body = (
    <>
      <span className="game-card-window">
        <Image src={card.art} alt={alt} dir={dir} placeholder="blur" fill sizes="(min-width: 1024px) 26rem, (min-width: 640px) 46vw, 92vw" className="game-card-art object-cover" />
        {cover}
      </span>
      <span className="flex min-h-16 items-center justify-between gap-3 ps-3 pe-1 pt-3 sm:min-h-[4.5rem]">
        <span dir={dir} className="game-card-title text-2xl font-bold lg:text-[1.7rem]">
          {title}
        </span>
        {action}
      </span>
    </>
  );

  const classes = `game-card clay group ${href ? "game-card--live" : ""} ${className}`;
  const vars: ClayVars = { "--clay-edge": card.edge, "--card-face": card.face, "--card-ink": card.ink, ...style };

  if (href) {
    return (
      <Link href={href} aria-label={label} className={classes} style={vars}>
        {body}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" aria-label={label} onClick={onClick} className={`${classes} cursor-pointer text-start`} style={vars}>
        {body}
      </button>
    );
  }
  return (
    <div role="group" aria-label={label} className={classes} style={vars}>
      {body}
    </div>
  );
}
