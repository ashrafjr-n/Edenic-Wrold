import type { CourseStopsFrame, SceneRect } from "@/types/course";
import { usePageTransition } from "@/store/page-transition";

/* The pure canvas and timing helpers of `CourseWorld`'s camera: no React,
   no state of their own. */

/** A closed lesson: its colour taken out, then a flat light silver over it. */
const SILVER = "#c9cdd6";
const SILVER_LIGHT = "#e4e7ee";
const SILVER_FLAT = 0.68;

/** Each stop's box at `progress`, between the render's key positions. */
export function boxAt(keys: readonly (readonly SceneRect[])[], progress: number, stop: number): SceneRect {
  const at = progress * (keys.length - 1);
  const low = Math.min(keys.length - 2, Math.floor(at));
  const mix = at - low;
  const [a, b] = [keys[low][stop], keys[low + 1][stop]];
  return [0, 1, 2, 3].map((i) => a[i] + (b[i] - a[i]) * mix) as unknown as SceneRect;
}

/** Lays the tiles (of a frame's mask sheet) that are asked for on `layer`, at
    the mask's own size — half the picture's, so a quarter of the pixels to
    move. Whether any was there. */
function stampTiles(layer: CanvasRenderingContext2D, mask: ImageBitmap, tiles: readonly number[], wanted: readonly number[]) {
  const tile = mask.height / tiles.length;
  if (layer.canvas.width !== mask.width || layer.canvas.height !== tile) {
    layer.canvas.width = mask.width;
    layer.canvas.height = tile;
  }
  layer.globalCompositeOperation = "source-over";
  layer.clearRect(0, 0, mask.width, tile);
  let any = false;
  for (const one of wanted) {
    const at = tiles.indexOf(one);
    if (at < 0) continue;
    layer.drawImage(mask, 0, tile * at, mask.width, tile, 0, 0, mask.width, tile);
    any = true;
  }
  return any;
}

/** Multiplies `tint` through the given ways' tiles of a frame's mask, so white
    stones keep their light and shade. `circle` (x, y, r, in the picture's
    pixels) limits it: a way turning grows out from its lesson. */
export function tintWays(target: CanvasRenderingContext2D, layer: CanvasRenderingContext2D, mask: ImageBitmap, tiles: readonly number[], ways: readonly number[], tint: string, circle?: readonly [number, number, number]) {
  if (!stampTiles(layer, mask, tiles, ways)) return;
  const { width, height } = layer.canvas;
  layer.globalCompositeOperation = "source-in";
  layer.fillStyle = tint;
  layer.fillRect(0, 0, width, height);
  if (circle) {
    const k = width / target.canvas.width;
    layer.globalCompositeOperation = "destination-in";
    layer.beginPath();
    layer.arc(circle[0] * k, circle[1] * k, Math.max(0.5, circle[2] * k), 0, Math.PI * 2);
    layer.fillStyle = "#000";
    layer.fill();
  }
  target.globalCompositeOperation = "multiply";
  target.drawImage(layer.canvas, 0, 0, width, height, 0, 0, target.canvas.width, target.canvas.height);
  target.globalCompositeOperation = "source-over";
}

/** Greys the given drops (their tiles of a frame's drop sheet): the colour is
    taken out keeping the clay's light, then a light silver laid over it, `amount`
    1 closed .. 0 open. */
export function silverDrops(target: CanvasRenderingContext2D, layer: CanvasRenderingContext2D, mask: ImageBitmap, tiles: readonly number[], drops: readonly number[], amount: number) {
  if (!stampTiles(layer, mask, tiles, drops)) return;
  const { width, height } = layer.canvas;
  const [w, h] = [target.canvas.width, target.canvas.height];
  layer.globalCompositeOperation = "source-in";
  layer.fillStyle = SILVER;
  layer.fillRect(0, 0, width, height);
  target.globalAlpha = amount;
  target.globalCompositeOperation = "color";
  target.drawImage(layer.canvas, 0, 0, width, height, 0, 0, w, h);
  layer.fillStyle = SILVER_LIGHT;
  layer.fillRect(0, 0, width, height);
  target.globalCompositeOperation = "source-over";
  target.globalAlpha = amount * SILVER_FLAT;
  target.drawImage(layer.canvas, 0, 0, width, height, 0, 0, w, h);
  target.globalAlpha = 1;
}

export const easeInOut = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2);
export const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));
/** Until the clouds that brought the child here have cleared (at most 4 s):
    what plays when the page opens is seen, not played under them. */
export async function cloudsGone() {
  for (let i = 0; i < 40 && usePageTransition.getState().active; i++) await wait(100);
}

/** A frame off the network, decoded off the main thread (a picture decoded on
    first draw is the scroll's worst hitch). */
export async function fetchBitmap(url: string, signal: AbortSignal, options?: ImageBitmapOptions) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(url);
  return createImageBitmap(await response.blob(), options);
}

export const fileUrl = (data: CourseStopsFrame, name: string, f: number, type: string) => `${data.path}${name}${String(f).padStart(3, "0")}.${type}?v=${data.version}`;
