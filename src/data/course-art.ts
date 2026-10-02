/* Course art for the courses still to come — clay things rendered by
   `tools/picnic-scene` (the same light and clay as Shapes and Colors), until
   each course gets its own. Things the Colors course already rendered are
   borrowed from it. */
import sun from "../../public/assets/learn/art/sun.png";
import cloud from "../../public/assets/learn/art/cloud.png";
import umbrella from "../../public/assets/learn/art/umbrella.png";
import calendar from "../../public/assets/learn/art/calendar.png";
import hand from "../../public/assets/learn/art/hand.png";
import foot from "../../public/assets/learn/art/foot.png";
import leaf from "../../public/assets/learn/art/leaf-orange.png";
import flower from "../../public/assets/learn/art/flower.png";
import apple from "../../public/assets/learn/pinki/colors/paint/apple.png";
import banana from "../../public/assets/learn/pinki/colors/paint/banana.png";
import carrot from "../../public/assets/learn/pinki/colors/paint/carrot.png";
import grapes from "../../public/assets/learn/pinki/colors/paint/grapes.png";
import pear from "../../public/assets/learn/pinki/colors/paint/pear.png";
import orange from "../../public/assets/learn/pinki/colors/paint/orange.png";
import fish from "../../public/assets/learn/pinki/colors/paint/fish.png";
import duck from "../../public/assets/learn/pinki/colors/paint/duck.png";
import pig from "../../public/assets/learn/pinki/colors/paint/pig.png";
import sheep from "../../public/assets/learn/pinki/colors/paint/sheep.png";
import frog from "../../public/assets/learn/pinki/colors/paint/frog.png";
import whale from "../../public/assets/learn/pinki/colors/paint/whale.png";
import snowman from "../../public/assets/learn/pinki/colors/paint/snowman.png";

export const COURSE_ART = {
  fruits: [apple, banana, grapes, carrot, pear, orange],
  seasons: [flower, sun, leaf, snowman],
  months: [calendar, flower, sun, snowman],
  animals: [fish, duck, pig, sheep, frog, whale],
  weather: [sun, cloud, umbrella, snowman],
  body: [hand, foot],
};
