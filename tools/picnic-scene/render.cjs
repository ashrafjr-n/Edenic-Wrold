/*
 * Renders the clay art in headless Chromium (`scene.html`, three.js from the
 * jsdelivr CDN).
 *
 * A Find scene — writes every layer to `out/<name>/`: the scene, the empty
 * world, and each item alone on a shadow catcher (+ a shadow-less copy for
 * its hit area). Then run `python3 tools/picnic-scene/crop.py <name> [dest]`.
 *
 *   node tools/picnic-scene/render.cjs squares   (picnic | squares | triangles | rectangles | red | yellow | purple | pink | white)
 *
 * Nova's garden — for each garden, writes `out/harvest-<garden>/`: the
 * garden without its food, a mask of what stands in front of it, each food
 * alone, and `meta.json`. Then `crop.py harvest-<garden>`.
 *
 *   node tools/picnic-scene/render.cjs harvest fruits vegetables
 *
 * Nova's basket alone (it stands beside the garden) — `out/basket/`: the
 * basket, a mask of its near half and `meta.json` (its mouth). Then
 * `crop.py basket`.
 *
 *   node tools/picnic-scene/render.cjs basket
 *
 * Nova's seasons — for each season, writes `out/season-<season>/`: the
 * island and its tree (`frame0`), then one frame per step with
 * everything before it (`frame1`…`frame4`), and `meta.json` (each step's
 * spot). Then `crop.py seasons`.
 *
 *   node tools/picnic-scene/render.cjs season spring summer fall winter
 *
 * Single things — one PNG each in `out/things/`, seen from the front and a
 * little above. Each spec is `file=thing[:arg][@blank]` (`@blank`: plain grey
 * clay, the thing before it is painted; `@float`: no ground shadow; `@top`:
 * seen from higher up; `@front`: seen from straight ahead). Then
 * `crop.py things <dest>`.
 *
 *   node tools/picnic-scene/render.cjs thing red=pot:red apple=apple apple-blank=apple@blank
 *
 * Bloo's animals, the friends' way too (velvet clay, the friends' face) —
 * each in two coats (`things/`), where each lives (`homes/`, renamed
 * `home-cat.png` → `cat.png` after cropping) and what each eats, a bite at
 * a time in the Feed step (`food/`); all three cropped with `--grain`:
 *
 *   node tools/picnic-scene/render.cjs thing cat=cat cat-grey=cat:grey dog=dog dog-spotty=dog:spotty cow=cow cow-brown=cow:brown fish=fishfriend@float fish-blue=fishfriend:blue@float
 *   node tools/picnic-scene/render.cjs thing home-cat=catBed home-dog=kennel home-cow=barn home-fish=fishbowl
 *   node tools/picnic-scene/render.cjs thing bone=food:bone@float milk=food:milk@float grass=food:grass@float pellets=food:pellets@float
 *
 * Nova's fruits, the friends' way (velvet clay, the friends' face) and her
 * cup — a thing with a face also writes `<file>.face.png` (where its glossy
 * eyes and mouth are), which `crop.py things … --grain` keeps grain off:
 *
 *   node tools/picnic-scene/render.cjs thing apple=fruit:apple banana=fruit:banana orange=fruit:orange grapes=fruit:grapes carrot=fruit:carrot broccoli=fruit:broccoli corn=fruit:corn potato=fruit:potato
 *   node tools/picnic-scene/render.cjs thing cup=cup@float
 *
 * Bloo's weather — what he wears (`wear/`, cropped with `--grain`; the
 * glasses, the umbrella, the kite, the pinwheel and the scarf seen from
 * straight ahead, as they lie on his picture) and the four weathers on his
 * hill (then `crop.py weather`, which crops all four on one box; his horns
 * come from his own picture, `crop.py horns`):
 *
 *   node tools/picnic-scene/render.cjs thing sunglasses=wear:sunglasses@float@front sunhat=wear:sunhat@float umbrella=wear:umbrella@float@front rainhat=wear:rainhat@float kite=wear:kite@float@front pinwheel=wear:pinwheel@float@front beanie=wear:beanie@float scarf=wear:scarf@float@front
 *   node tools/picnic-scene/render.cjs thing weather-sunny=weather:sunny@float weather-rainy=weather:rainy@float weather-windy=weather:windy@float weather-snowy=weather:snowy@float
 *
 * Making the weather (the Weather lessons' third step) — for each weather,
 * writes `out/weathersteps-<weather>/`: the hill before the weather and
 * after each go (`frame0`…`frame3`; sunny has one, its sun under the
 * clouds) and each thing in its sky alone (`sky0`…), all on the weather
 * pictures' camera. Then `crop.py weathersteps`. And what the weather
 * sends down or across, as single things (`crop.py things
 * public/assets/learn/bloo/weather/bits … --grain`):
 *
 *   node tools/picnic-scene/render.cjs weathersteps sunny rainy windy snowy
 *   node tools/picnic-scene/render.cjs thing drop=weatherbit:drop@float@front flake=weatherbit:flake@float@front leaf=weatherbit:leaf@float@front leaf2=weatherbit:leaf2@float@front swirl=weatherbit:swirl@float@front sparkle=weatherbit:sparkle@float@front
 *
 * Needs Playwright with Chromium (`npx playwright install chromium`); not a
 * project dependency — the site only ships the finished images.
 */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const [mode, ...specs] = process.argv.slice(2);
const page_ = (browser) => browser.newPage({ viewport: { width: 1000, height: 1250 } });

async function render(page, query) {
  await page.goto("file://" + path.join(__dirname, "scene.html") + "?" + query);
  await page.waitForFunction(() => window.ready, null, { timeout: 60000 });
  return page.evaluate(() => window.renderLayers());
}

const save = (dir, name, url) => fs.writeFileSync(path.join(dir, `${name}.png`), Buffer.from(url.split(",")[1], "base64"));

(async () => {
  const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const page = await page_(browser);
  page.on("pageerror", (error) => console.error("scene.html:", error.message));
  if (mode === "thing") {
    const out = path.join(__dirname, "out", "things");
    fs.mkdirSync(out, { recursive: true });
    for (const spec of specs) {
      const [file, rest] = spec.split("=");
      const [what, ...flags] = rest.split("@");
      const [thing, arg] = what.split(":");
      const query = new URLSearchParams({
        thing,
        ...(arg ? { arg } : {}),
        ...(flags.includes("blank") ? { paint: "blank" } : {}),
        ...(flags.includes("float") ? { shadow: "0" } : {}),
        ...(flags.includes("top") ? { lift: "58" } : {}),
        ...(flags.includes("front") ? { lift: "6" } : {}),
      });
      const layers = await render(page, query.toString());
      save(out, file, layers[thing]);
      /* A thing with a face: where its eyes and mouth are (`crop.py --grain`). */
      if (layers.face) save(out, `${file}.face`, layers.face);
    }
  } else if (mode === "harvest") {
    for (const food of specs) {
      const layers = await render(page, `harvest=${food}`);
      const out = path.join(__dirname, "out", `harvest-${food}`);
      fs.mkdirSync(out, { recursive: true });
      for (const [layer, url] of Object.entries(layers)) save(out, layer, url);
      fs.writeFileSync(path.join(out, "meta.json"), JSON.stringify(await page.evaluate(() => window.itemsMeta())));
    }
  } else if (mode === "season" || mode === "weathersteps") {
    for (const what of specs) {
      const layers = await render(page, `${mode}=${what}`);
      const out = path.join(__dirname, "out", `${mode}-${what}`);
      fs.mkdirSync(out, { recursive: true });
      for (const [layer, url] of Object.entries(layers)) save(out, layer, url);
      fs.writeFileSync(path.join(out, "meta.json"), JSON.stringify(await page.evaluate(() => window.itemsMeta())));
    }
  } else if (mode === "basket") {
    const layers = await render(page, "basket");
    const out = path.join(__dirname, "out", "basket");
    fs.mkdirSync(out, { recursive: true });
    for (const [layer, url] of Object.entries(layers)) save(out, layer, url);
    fs.writeFileSync(path.join(out, "meta.json"), JSON.stringify(await page.evaluate(() => window.itemsMeta())));
  } else {
    const name = mode || "picnic";
    const layers = await render(page, `scene=${name}`);
    const out = path.join(__dirname, "out", name);
    fs.mkdirSync(out, { recursive: true });
    for (const [layer, url] of Object.entries(layers)) save(out, layer, url);
    fs.writeFileSync(path.join(out, "meta.json"), JSON.stringify(await page.evaluate(() => window.itemsMeta())));
  }
  await browser.close();
})();
