import { ViewTransition } from "react";
import Image from "next/image";
import wallPortrait from "../../../../public/assets/learn/pinki/classroom/portrait.jpg";
import wallLandscape from "../../../../public/assets/learn/pinki/classroom/landscape.jpg";
import deskPortrait from "../../../../public/assets/learn/pinki/classroom/portrait-desk.png";
import deskLandscape from "../../../../public/assets/learn/pinki/classroom/landscape-desk.png";

interface ClassroomBackdropProps {
  /** A course page: the camera is up close on the board — the wall
      zoomed in past it, the child's desk out of the picture. */
  zoomed?: boolean;
}

/**
 * Pinki's classroom round her board (2026-10-14): the pink wall with the
 * class's drawings, a little out of focus, and the child's own desk in the
 * front, more so (`tools/picnic-scene`, `render.cjs classroom pinki`). A
 * portrait and a landscape frame, the one that fits the screen shown — the
 * other is never fetched (lazy and `display: none`).
 *
 * The wall is ONE view transition (`pinki-wall`) on the hub and on a course
 * page, so going in to a course zooms it, and coming back zooms it out; the
 * desk slides away on the way in (`desk-exit`). The zoom is on the view
 * INSIDE the wall, never the wall itself: a transition's snapshot is the
 * named element's box, and a wall scaled past the page would cover the
 * header for the length of the transition.
 */
export function ClassroomBackdrop({ zoomed = false }: ClassroomBackdropProps) {
  return (
    <div className="class-room" aria-hidden>
      <ViewTransition name="pinki-wall" share="class-morph" default="none">
        <div className="class-wall">
          <div className={`class-wall-view ${zoomed ? "class-wall-view--zoomed" : ""}`}>
            <Image src={wallPortrait} alt="" fill sizes="100vw" quality={80} className="object-cover landscape:hidden" />
            <Image src={wallLandscape} alt="" fill sizes="100vw" quality={80} className="object-cover portrait:hidden" />
          </div>
        </div>
      </ViewTransition>
      {!zoomed && (
        <ViewTransition exit="desk-exit" default="none">
          <div className="class-desk">
            <Image src={deskPortrait} alt="" sizes="100vw" className="h-auto w-full landscape:hidden" />
            <Image src={deskLandscape} alt="" sizes="100vw" className="h-auto w-full portrait:hidden" />
          </div>
        </ViewTransition>
      )}
    </div>
  );
}
