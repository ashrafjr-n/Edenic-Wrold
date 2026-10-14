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
 *   node tools/picnic-scene/render.cjs harvest vegetables
 *
 * Nova's basket alone (it stands beside the garden) — `out/basket/`: the
 * basket, a mask of its near half and `meta.json` (its mouth). Then
 * `crop.py basket`.
 *
 *   node tools/picnic-scene/render.cjs basket
 *
 * Nova's seasons — for each season, writes `out/season-<season>/`: the
 * island and its tree (`frame0`), then the season coming over it step by
 * step (`frame1`…`frame4`, the last the whole season). Then `crop.py
 * seasons`, which keeps the last.
 *
 *   node tools/picnic-scene/render.cjs season spring summer fall winter
 *
 * Single things — one PNG each in `out/things/`, seen from the front and a
 * little above. Each spec is `file=thing[:arg][@blank]` (`@blank`: plain grey
 * clay, the thing before it is painted; `@float`: no ground shadow; `@top`:
 * seen from higher up; `@front`: seen from straight ahead; `@hd`: twice the
 * pixels, for fine detail — the videos' vegetables). Then
 * `crop.py things <dest>`.
 *
 *   node tools/picnic-scene/render.cjs thing red=pot:red apple=apple apple-blank=apple@blank
 *
 * Where Bloo's animals live (`homes/`, renamed `home-cat.png` → `cat.png`
 * after cropping; the animals themselves are the videos' own — `cut.py`)
 * and Nova's cup, the friends' way (velvet clay), cropped with `--grain` —
 * a thing with a face also writes `<file>.face.png` (where its glossy eyes
 * and mouth are), which `crop.py things … --grain` keeps grain off:
 *
 *   node tools/picnic-scene/render.cjs thing home-cat=catBed home-dog=kennel home-fish=fishbowl
 *   node tools/picnic-scene/render.cjs thing cup=cup@float
 *
 * Bloo's weather — what a child needs for each, the review's things to
 * sort (`wear/`, cropped with `--grain`; some seen from straight ahead)
 * and the four weathers on his hill (then `crop.py weather`, which crops
 * all four on one box):
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
 * The videos' look (2026-10-12): smooth satin vegetables with no face, in
 * the videos' warm light, cropped with `--grain` like the rest — Nova's
 * vegetables into `nova/fruits/things` and the pumpkin into
 * `nova/seasons/things` (`crop.py things <dest> … --grain`); her carrot and
 * potato beds come with `render.cjs harvest vegetables`:
 *
 *   node tools/picnic-scene/render.cjs thing carrot=video:carrot@hd@float potato=video:potato@hd@float broccoli=video:broccoli@hd@float tomato=video:tomato@hd@float pepper=video:pepper@hd@float pumpkin=video:pumpkin@hd@float
 *
 * A lesson's backdrop (2026-10-13) — its world behind every step, in both
 * frames (`out/backdrop-<name>/portrait.png`, `landscape.png`); Shapes has
 * one per lesson. Then `crop.py backdrop <name> <dest>`, which blurs them:
 *
 *   node tools/picnic-scene/render.cjs backdrop circle square triangle rectangle review
 *
 * Pinki's house (2026-10-14) — her hub: the house and every lesson's
 * reward as its own layer (`out/house-pinki/`), then `crop.py house`:
 *
 *   node tools/picnic-scene/render.cjs house pinki
 *
 * Pinki's classroom (2026-10-14) — her hub's and course pages' room, in
 * both frames, the wall (`<frame>-back.png`) and the child's desk in front
 * (`<frame>-front.png`), then `crop.py classroom`:
 *
 *   node tools/picnic-scene/render.cjs classroom pinki
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
        ...(flags.includes("hd") ? { px: "2" } : {}),
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
  } else if (mode === "classroom") {
    for (const who of specs) {
      const out = path.join(__dirname, "out", `classroom-${who}`);
      fs.mkdirSync(out, { recursive: true });
      for (const frame of ["portrait", "landscape"]) {
        const layers = await render(page, `classroom=${who}&frame=${frame}`);
        for (const [layer, url] of Object.entries(layers)) save(out, `${frame}-${layer}`, url);
      }
    }
  } else if (mode === "house") {
    for (const who of specs) {
      const out = path.join(__dirname, "out", `house-${who}`);
      fs.mkdirSync(out, { recursive: true });
      const layers = await render(page, `house=${who}`);
      for (const [layer, url] of Object.entries(layers)) save(out, layer, url);
      fs.writeFileSync(path.join(out, "meta.json"), JSON.stringify(await page.evaluate(() => window.itemsMeta())));
    }
  } else if (mode === "backdrop") {
    for (const name of specs) {
      const out = path.join(__dirname, "out", `backdrop-${name}`);
      fs.mkdirSync(out, { recursive: true });
      for (const frame of ["portrait", "landscape"]) save(out, frame, (await render(page, `backdrop=${name}&frame=${frame}`)).backdrop);
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
