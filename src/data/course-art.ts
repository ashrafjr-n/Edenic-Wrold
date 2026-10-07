/* Course art for the courses still to come — clay things rendered by
   `tools/picnic-scene` (the same light and clay as Shapes and Colors), until
   each course gets its own. Things the Colors course already rendered are
   borrowed from it. */
import sun from "../../public/assets/learn/art/sun.png";
import cloud from "../../public/assets/learn/art/cloud.png";
import umbrella from "../../public/assets/learn/art/umbrella.png";
import hand from "../../public/assets/learn/art/hand.png";
import foot from "../../public/assets/learn/art/foot.png";
import snowman from "../../public/assets/learn/pinki/colors/paint/snowman.png";

export const COURSE_ART = {
  weather: [sun, cloud, umbrella, snowman],
  body: [hand, foot],
};
