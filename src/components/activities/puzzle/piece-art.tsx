import Image from "next/image";
import type { PuzzleGrid, PuzzlePicture } from "@/types/puzzle";
import { pieceBoxStyle, pieceCropStyle } from "@/lib/puzzle-pieces";
import type { PuzzlePiece } from "@/lib/puzzle-pieces";
import { clipId } from "@/lib/puzzle-shape";

/**
 * One piece of the picture: the box holds the crop, the clip path cuts the
 * jigsaw outline out of it.
 *
 * The drop shadow sits on the OUTER span rather than the clipped one — a
 * filter is applied before the clip on the same element, so a shadow declared
 * there would be cut away with everything else outside the outline. From a
 * parent it follows the piece's real silhouette instead.
 */
export function PieceArt({
  picture,
  piece,
  grid,
  shadow = true,
  hitArea = false,
}: {
  picture: PuzzlePicture;
  piece: PuzzlePiece;
  grid: PuzzleGrid;
  shadow?: boolean;
  /** Makes the clipped shape itself the only part that answers a pointer.
      Loose pieces overlap in a heap, and a piece box is a RECTANGLE — without
      this, a piece's empty corners sit on top of its neighbours and a tap
      picks up something the child cannot even see. `clip-path` clips
      hit-testing as well as pixels, so the silhouette becomes the target. */
  hitArea?: boolean;
}) {
  return (
    <span
      className="block"
      style={{
        ...pieceBoxStyle,
        filter: shadow
          ? "drop-shadow(0 6px 8px rgb(var(--shadow-hue) / 40%))"
          : undefined,
      }}
    >
      {/* `overflow-hidden` as well as the clip path, and it is load-bearing:
          the image inside is drawn at THREE TIMES the board's size and pushed
          off-centre, and `clip-path` only hides it — it does not contain the
          layout. Without this the page's scroll width grew past the viewport,
          which on a phone widens the layout viewport itself, zooms the whole
          page out and drags every `position: fixed` overlay off-screen with
          it. */}
      <span
        className={`relative block h-full w-full overflow-hidden ${
          hitArea ? "pointer-events-auto" : ""
        }`}
        style={{ clipPath: `url(#${clipId(piece.id)})` }}
      >
        <Image
          src={picture.image}
          alt=""
          sizes="(min-width: 640px) 32rem, 100vw"
          /* Images are natively draggable: without this the browser's own
             image drag starts instead, firing `pointercancel` and killing the
             custom drag on its first move. */
          draggable={false}
          className="pointer-events-none select-none"
          style={pieceCropStyle(piece, grid)}
        />
      </span>
    </span>
  );
}
