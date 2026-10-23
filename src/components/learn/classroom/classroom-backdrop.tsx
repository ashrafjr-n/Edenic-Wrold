import { ViewTransition } from "react";
import Image from "next/image";
import { WallPreload } from "@/components/learn/classroom/wall-preload";
import wallPortrait from "../../../../public/assets/learn/pinki/classroom/portrait.jpg";
import wallLandscape from "../../../../public/assets/learn/pinki/classroom/landscape.jpg";
import deskPortrait from "../../../../public/assets/learn/pinki/classroom/portrait-desk.png";
import deskLandscape from "../../../../public/assets/learn/pinki/classroom/landscape-desk.png";

interface ClassroomBackdropProps {
  /** A course page: the camera is up close on the board — the wall
      zoomed in past it, the child's desk out of the picture. */
  zoomed?: boolean;
  /** Behind a lesson (and its loading screen): the zoomed wall, still, and
      NOT the `pinki-wall` transition — the lesson's wall is fixed to the
      whole screen, the course page's sits inside the page, and a pair of
      different boxes grew the wall over the header and the bottom nav on
      every tap of a lesson. */
  still?: boolean;
}

/**
 * Pinki's classroom round her board (2026-10-14): the pink wall, sharp,
 * with the class's drawings, a "Small Steps, Big Dreams" poster and a
 * window, and the class's chairs and a desk in the front, out of focus
 * (`tools/picnic-scene`, `render.cjs classroom pinki`) — a whole frame laid
 * over the wall the same way, so they stand where they were rendered. A
 * portrait and a landscape frame, the one that fits the screen shown — the
 * other is never fetched (lazy and `display: none`) — and preloaded, so the
 * room is there with the page, not a moment after.
 *
 * The wall is ONE view transition (`pinki-wall`) on the hub and on a course
 * page, so going in to a course zooms it, and coming back zooms it out; the
 * chairs slide away on the way in (`desk-exit`). The zoom is on the view
 * INSIDE the wall, never the wall itself: a transition's snapshot is the
 * named element's box, and a wall scaled past the page would cover the
 * header for the length of the transition.
 */
export function ClassroomBackdrop({ zoomed = false, still = false }: ClassroomBackdropProps) {
  const wall = (
    <div className="class-wall">
      <div className={`class-wall-view ${zoomed || still ? "class-wall-view--zoomed" : ""}`}>
        <Image src={wallPortrait} alt="" fill sizes="100vw" className="object-cover landscape:hidden" />
        <Image src={wallLandscape} alt="" fill sizes="100vw" className="object-cover portrait:hidden" />
      </div>
    </div>
  );
  return (
    <div className="class-room" aria-hidden>
      <WallPreload portrait={wallPortrait} landscape={wallLandscape} />
      {still ? (
        wall
      ) : (
        <ViewTransition name="pinki-wall" share="class-morph" default="none">
          {wall}
        </ViewTransition>
      )}
      {!zoomed && !still && (
        <ViewTransition exit="desk-exit" default="none">
          <div className="class-desk">
            <div className="class-desk-view">
              <Image src={deskPortrait} alt="" fill sizes="100vw" className="object-cover landscape:hidden" />
              <Image src={deskLandscape} alt="" fill sizes="100vw" className="object-cover portrait:hidden" />
            </div>
          </div>
        </ViewTransition>
      )}
    </div>
  );
}
