import { ViewTransition } from "react";
import Image from "next/image";
import { WallPreload } from "@/components/learn/classroom/wall-preload";
import type { Framed } from "@/types/course";

interface ClassroomBackdropProps {
  /** The friend's room — `CLASSROOMS[id]`. */
  wall: Framed;
  desk: Framed;
  /** Behind a lesson (and its loading screen): the zoomed wall, still, no
      chairs, and NOT the `class-wall` transition — the lesson's wall is
      fixed to the whole screen, the classroom's sits inside the page, and a
      pair of different boxes grew the wall over the header and the bottom
      nav on every tap of a lesson. */
  still?: boolean;
}

/**
 * A friend's classroom round their board (Pinki's 2026-10-14: the pink
 * wall, sharp, with the class's drawings, a "Small Steps, Big Dreams"
 * poster and a window; Nova's and Bloo's their own), and the class's
 * chairs and a desk in the front, out of focus (`tools/picnic-scene`,
 * `render.cjs classroom <id>`) — a whole frame laid
 * over the wall the same way, so they stand where they were rendered. A
 * portrait and a landscape frame, the one that fits the screen shown — the
 * other is never fetched (lazy and `display: none`) — and preloaded, so the
 * room is there with the page, not a moment after.
 *
 * In the classroom (`ClassroomShell`, a layout — 2026-11-04) it is mounted
 * ONCE for the hub and its course pages: going in to a course the camera
 * comes closer (`.class-page--course` — the zoom is on the view INSIDE the
 * wall: a transition's snapshot is the named element's box, and a wall
 * scaled past the page would cover the header), the chairs slide away on
 * a wide screen and come closer on a phone; each is a view transition that
 * animates that `update`, never a page built again.
 */
export function ClassroomBackdrop({ wall: room, desk: chairs, still = false }: ClassroomBackdropProps) {
  const wall = (
    <div className="class-wall">
      <div className={`class-wall-view ${still ? "class-wall-view--zoomed" : ""}`}>
        <Image src={room.portrait} alt="" fill sizes="100vw" className="object-cover landscape:hidden" />
        <Image src={room.landscape} alt="" fill sizes="100vw" className="object-cover portrait:hidden" />
      </div>
    </div>
  );
  return (
    <div className="class-room" aria-hidden>
      <WallPreload portrait={room.portrait} landscape={room.landscape} />
      {still ? (
        wall
      ) : (
        <>
          <ViewTransition name="class-wall" share="class-morph" update="class-morph" default="none">
            {wall}
          </ViewTransition>
          <ViewTransition name="class-desk" update="board-morph" default="none">
            <div className="class-desk">
              <div className="class-desk-view">
                <Image src={chairs.portrait} alt="" fill sizes="100vw" className="object-cover landscape:hidden" />
                <Image src={chairs.landscape} alt="" fill sizes="100vw" className="object-cover portrait:hidden" />
              </div>
            </div>
          </ViewTransition>
        </>
      )}
    </div>
  );
}
