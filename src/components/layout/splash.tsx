import Image from "next/image";
import edenic from "../../../public/assets/splash/logo-edenic.webp";
import world from "../../../public/assets/splash/logo-world.webp";
import star from "../../../public/assets/splash/logo-star.webp";

/**
 * The site's first moment: the logo in its three clay pieces (cut by colour
 * from `edenic-logo.png`, each on the logo's whole canvas so they stack back
 * into it exactly) — "Edenic" drops and squashes on landing, "World" a beat
 * after, the whole logo tilting in 3D as it settles, the star spinning onto
 * the "c" — then the ground fades away over the page, which has been loading
 * underneath all along. ~1.5 s, plain CSS (`styles/splash.css`): transform
 * and opacity only, no JS to run it.
 *
 * Once per visit: the `splash-init` script in the root layout marks `<html
 * data-splash="seen">` before the first paint on any later load in the same
 * tab session (or when storage is blocked), and the CSS hides it.
 * Decorative only — `aria-hidden`; the header's logo carries the name.
 */
export function Splash() {
  return (
    <div className="splash" aria-hidden>
      <div className="splash-logo">
        <div className="splash-tilt">
          <Image src={world} alt="" unoptimized preload className="splash-piece splash-piece--world" />
          <Image src={edenic} alt="" unoptimized preload className="splash-piece splash-piece--edenic" />
          <Image src={star} alt="" unoptimized preload className="splash-piece splash-piece--star" />
        </div>
      </div>
    </div>
  );
}
