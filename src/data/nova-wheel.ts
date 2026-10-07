import type { StaticImageData } from "next/image";
import upto0 from "../../public/assets/learn/nova/months/wheel/0.png";
import upto1 from "../../public/assets/learn/nova/months/wheel/1.png";
import upto2 from "../../public/assets/learn/nova/months/wheel/2.png";
import upto3 from "../../public/assets/learn/nova/months/wheel/3.png";
import upto4 from "../../public/assets/learn/nova/months/wheel/4.png";
import upto5 from "../../public/assets/learn/nova/months/wheel/5.png";
import upto6 from "../../public/assets/learn/nova/months/wheel/6.png";
import upto7 from "../../public/assets/learn/nova/months/wheel/7.png";
import upto8 from "../../public/assets/learn/nova/months/wheel/8.png";
import upto9 from "../../public/assets/learn/nova/months/wheel/9.png";
import upto10 from "../../public/assets/learn/nova/months/wheel/10.png";
import upto11 from "../../public/assets/learn/nova/months/wheel/11.png";
import upto12 from "../../public/assets/learn/nova/months/wheel/12.png";
import only1 from "../../public/assets/learn/nova/months/wheel/only-1.png";
import only2 from "../../public/assets/learn/nova/months/wheel/only-2.png";
import only3 from "../../public/assets/learn/nova/months/wheel/only-3.png";
import only4 from "../../public/assets/learn/nova/months/wheel/only-4.png";
import only5 from "../../public/assets/learn/nova/months/wheel/only-5.png";
import only6 from "../../public/assets/learn/nova/months/wheel/only-6.png";
import only7 from "../../public/assets/learn/nova/months/wheel/only-7.png";
import only8 from "../../public/assets/learn/nova/months/wheel/only-8.png";
import only9 from "../../public/assets/learn/nova/months/wheel/only-9.png";
import only10 from "../../public/assets/learn/nova/months/wheel/only-10.png";
import only11 from "../../public/assets/learn/nova/months/wheel/only-11.png";
import only12 from "../../public/assets/learn/nova/months/wheel/only-12.png";
import mark2 from "../../public/assets/learn/nova/months/wheel/mark-2.png";
import mark5 from "../../public/assets/learn/nova/months/wheel/mark-5.png";
import mark8 from "../../public/assets/learn/nova/months/wheel/mark-8.png";
import mark11 from "../../public/assets/learn/nova/months/wheel/mark-11.png";

/* Nova's year wheel — rendered by `tools/picnic-scene` (`render.cjs wheel`
   → `crop.py wheel`, which prints the spots): a clay wheel like a clock,
   December at the top, the year going clockwise; a month that has come is
   raised and painted its season's color, carrying its season's thing. All
   cut on one box, so every picture lies exactly over the others. */

/** The first k months in (k = 0…12) — a lesson's magic button steps
    through three of them. */
export const WHEEL_UPTO: readonly StaticImageData[] = [upto0, upto1, upto2, upto3, upto4, upto5, upto6, upto7, upto8, upto9, upto10, upto11, upto12];

/** Month m alone (index m − 1) — its word card. */
export const WHEEL_ONLY: readonly StaticImageData[] = [only1, only2, only3, only4, only5, only6, only7, only8, only9, only10, only11, only12];

/** Month m's slice marked in plain cream, no season (the review sorts it
    by its place in the year) — by month number. */
export const WHEEL_MARK: Readonly<Record<number, StaticImageData>> = { 2: mark2, 5: mark5, 8: mark8, 11: mark11 };

/** Where each month's slice is tapped (index m − 1), % of the picture. */
export const WHEEL_SPOTS: readonly (readonly [number, number])[] = [[64.56, 25.47], [75.21, 36.11], [79.11, 50.65], [75.21, 65.18], [64.56, 75.82], [50, 79.71], [35.44, 75.82], [24.79, 65.18], [20.89, 50.65], [24.79, 36.11], [35.44, 25.47], [50, 21.58]];
