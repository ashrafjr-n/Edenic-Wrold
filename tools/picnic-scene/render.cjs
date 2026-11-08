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
 *   node tools/picnic-scene/render.cjs thing apple=apple apple-blank=apple@blank
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
 * What Bloo's animals eat (Feed the animal, 2026-11-01) — in the videos'
 * look, like the vegetables, cropped with `--grain` (`crop.py things
 * public/assets/learn/bloo/animals/food … --grain`):
 *
 *   node tools/picnic-scene/render.cjs thing milk=food:milk@hd@float bone=food:bone@hd@float fish-food=food:fishFood@hd@float banana=food:banana@hd@float cheese=food:cheese@hd@float worm=food:worm@hd@float seeds=food:seeds@hd@float lettuce=food:lettuce@hd@float cricket=food:cricket@hd@float
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
 * Pinki's shape garden (2026-11-02) — the Shapes course's world: per
 * lesson and frame, `out/garden-<n>-<frame>/` — each station's still, every
 * frame of the camera's moves (`m<i>/`, 30 fps), the Find in layers. On the
 * Mac's GPU. Then `crop.py garden`, which blurs, encodes the clips and
 * writes `src/data/shape-garden.ts`:
 *
 *   node tools/picnic-scene/render.cjs garden 1 2 3 4 5
 *
 * Pinki's colour forest (2026-11-05) — the Colors course's world, the
 * same kit as the garden (`scene.html?garden=<1-11>&world=forest`; lessons 1-10
 * the colours in order, 11 the review): `out/forest-<n>-<frame>/`, then
 * `crop.py forest`, which writes `src/data/color-forest.ts`:
 *
 *   node tools/picnic-scene/render.cjs forest 1 2 3 4 5 6 7 8 9 10 11
 *
 * Nova's vegetable garden (2026-11-05) — the Vegetables course's world, the
 * same kit (`scene.html?garden=<1-6>&world=veg`, the lessons' vegetables in
 * order, 6 the review): `out/veg-<n>-<frame>/`, lesson 1's with Basket Time's
 * kitchen in layers; then `crop.py veg`, which writes `src/data/veg-garden.ts`:
 *
 *   node tools/picnic-scene/render.cjs veg 1 2 3 4 5 6
 *
 * Nova's hill (2026-11-05) — The Seasons' world, the same kit
 * (`scene.html?garden=<1-5>&world=hill`, the seasons in order, 5 the review):
 * `out/hill-<n>-<frame>/`, then `crop.py hill`, which writes
 * `src/data/season-hill.ts`:
 *
 *   node tools/picnic-scene/render.cjs hill 1 2 3 4 5
 *
 * A course's world of stops (2026-11-05, Shapes) — the page behind its lessons'
 * pedestals, the camera going in as it scrolls: `out/stops-<frame>/`, a frame
 * per step of the scroll and each stop's box along the way. Then `crop.py
 * stops`, which writes `src/data/shape-stops.ts`:
 *
 *   node tools/picnic-scene/render.cjs stops
 *
 * Nova's Vegetables (2026-11-06): `node tools/picnic-scene/render.cjs stops fruits`, then
 * `crop.py stops fruits` → `src/data/veg-stops.ts`.
 *
 * Colors' (2026-11-06) — 180 frames, ten ways; then `crop.py stops colors`,
 * which writes `src/data/color-stops.ts`:
 *
 *   node tools/picnic-scene/render.cjs stops colors
 *   node tools/picnic-scene/render.cjs stops colors drops   (after it: each drop's
 *                                   pixels, so the page can grey the closed ones)
 *
 * A game card's picture on /play (2026-10-23) uses the same worlds —
 * `play-cups` is Nova's Cups (her garden, her cups, a carrot under the
 * tipped one); then `crop.py playcard cups` (sharp, no blur):
 *
 *   node tools/picnic-scene/render.cjs backdrop play-cups
 *
 * A friend's classroom (Pinki's 2026-10-14, Nova's and Bloo's 2026-10-23 —
 * `THEMES` in `scene.html`) — their hub's and course pages' room, in both
 * frames, the wall (`<frame>-back.png`) and the chairs in front
 * (`<frame>-front.png`), then `crop.py classroom <id>`:
 *
 *   node tools/picnic-scene/render.cjs classroom pinki nova bloo
 *
 * Pinki's courses' things for their boxes on her board (2026-10-14), then
 * `crop.py things public/assets/learn/pinki/classroom course-shapes course-colors`:
 *
 *   node tools/picnic-scene/render.cjs thing course-shapes=shapeBlocks@hd course-colors=palette@hd@top
 *
 * Needs Playwright with Chromium (`npx playwright install chromium`); not a
 * project dependency — the site only ships the finished images.
 */
const { chromium } = require(process.env.PW || "playwright");
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
  /* The garden's thousands of frames on the Mac's GPU (~0.5 s a frame,
     six times SwiftShader); everything else as it always was. */
  const gpu = ["garden", "forest", "veg", "hill", "stops"].includes(mode) ? ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] : ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"];
  const browser = await chromium.launch({ args: gpu });
  const page = await page_(browser);
  page.on("pageerror", (error) => console.error("scene.html:", error.message));
  if (mode === "stops") {
    /* `stops` is Shapes' (2026-11-05); `stops colors` Colors' (2026-11-06):
       its own `out/stops-colors-<frame>/`, longer, a mask per way (ten). */
    /* `stops fruits` (2026-11-06) is Nova's Vegetables: `out/stops-fruits-<frame>/`,
       100 frames, five ways. */
    const course = specs[0] === "colors" || specs[0] === "fruits" ? specs[0] : "shapes";
    const colors = course !== "shapes";
    /* `stops colors drops`: only each drop's pixels (`d<frame>-<k>.png`, the
       page greys the ones not yet open), into the frames already rendered. */
    const dropsOnly = course === "colors" && specs[1] === "drops";
    const [FRAMES, KEYS] = course === "colors" ? [180, 61] : course === "fruits" ? [100, 41] : [90, 31];
    /* `ONLY=landscape` renders one frame size (the other's pictures stay). */
    for (const frame of process.env.ONLY ? [process.env.ONLY] : ["landscape", "portrait"]) {
      const out = path.join(__dirname, "out", colors ? `stops-${course}-${frame}` : `stops-${frame}`);
      if (!dropsOnly) {
        fs.rmSync(out, { recursive: true, force: true });
        fs.mkdirSync(out, { recursive: true });
      }
      await page.goto("file://" + path.join(__dirname, "scene.html") + `?garden=1&frame=${frame}&px=1&world=stops${colors ? `&course=${course}` : ""}`);
      await page.waitForFunction(() => window.ready, null, { timeout: 120000 });
      const [ways, drops] = await page.evaluate(() => [window.garden.ways, window.garden.drops]);
      for (let f = 0; f < FRAMES; f++) {
        const name = String(f).padStart(3, "0");
        if (dropsOnly) {
          for (let k = 0; k < drops; k++) {
            const mask = await page.evaluate(([t, k]) => window.garden.dropMask(t, k), [f / (FRAMES - 1), k]);
            fs.writeFileSync(path.join(out, `d${name}-${k}.png`), Buffer.from(mask.split(",")[1], "base64"));
          }
          continue;
        }
        const url = await page.evaluate((t) => window.garden.frameAt(t), f / (FRAMES - 1));
        fs.writeFileSync(path.join(out, `f${name}.jpg`), Buffer.from(url.split(",")[1], "base64"));
        /* Where each way's stones are in this frame. */
        for (let k = 0; k < ways; k++) {
          const mask = await page.evaluate(([t, k]) => window.garden.wayMask(t, k), [f / (FRAMES - 1), k]);
          fs.writeFileSync(path.join(out, `w${name}-${k}.png`), Buffer.from(mask.split(",")[1], "base64"));
        }
      }
      if (!dropsOnly) {
        const keys = [];
        for (let k = 0; k < KEYS; k++) keys.push(await page.evaluate((t) => window.garden.boxes(t), k / (KEYS - 1)));
        fs.writeFileSync(path.join(out, "meta.json"), JSON.stringify({ frames: FRAMES, ways, keys }));
      }
      console.log(`stops ${colors ? course + " " : ""}${dropsOnly ? "drops " : ""}${frame}: done`);
    }
  } else if (mode === "thing") {
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
  } else if (mode === "season") {
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
  } else if (mode === "backdrop") {
    for (const name of specs) {
      const out = path.join(__dirname, "out", `backdrop-${name}`);
      fs.mkdirSync(out, { recursive: true });
      for (const frame of ["portrait", "landscape"]) save(out, frame, (await render(page, `backdrop=${name}&frame=${frame}`)).backdrop);
    }
  } else if (["garden", "forest", "veg", "hill"].includes(mode)) {
    /* Pinki's shape garden: for each lesson and frame, `out/garden-<n>-<frame>/`
       — each station's still, every frame of each camera move (`m<i>/`;
       move 0 is the entry, the last the end's rise over the path in
       bloom; a walk opens on the flower of the step just done blooming),
       and a shape lesson's Find (its picnic on the lawn, from above) in
       layers at 1.6x. */
    const SECONDS = mode === "hill" ? { entry: 2.4, step: 3, end: 4.6 } : mode === "veg" ? { entry: 2.4, step: 2.6, blur: 1.6 } : { entry: 2.4, step: 2.3, walk: 3.4, end: 2.8 };
    const FPS = 30;
    for (const lesson of specs) {
      for (const frame of ["landscape", "portrait"]) {
        const out = path.join(__dirname, "out", `${mode}-${lesson}-${frame}`);
        fs.mkdirSync(out, { recursive: true });
        const open = async (px) => {
          await page.goto("file://" + path.join(__dirname, "scene.html") + `?garden=${lesson}&frame=${frame}&px=${px}${mode === "garden" ? "" : `&world=${mode}`}`);
          await page.waitForFunction(() => window.ready, null, { timeout: 120000 });
          /* Nova's kitchen has Nova standing in it (2026-11-06; it was Pinki's by mistake). */
          if (mode === "veg") {
            const dataUrl = (file) => "data:image/png;base64," + fs.readFileSync(path.join(__dirname, "../../public/assets", file)).toString("base64");
            await page.evaluate(([a, b]) => window.garden.setFriend(a, b), [dataUrl("friends/nova.png"), dataUrl("friends/nova.png")]);
          }
        };
        await open(1);
        const stations = await page.evaluate(() => window.garden.stations);
        for (let i = 0; i < stations; i++) save(out, `s${i}`, await page.evaluate((i) => window.garden.station(i), i));
        fs.writeFileSync(path.join(out, "meta.json"), JSON.stringify(await page.evaluate(() => window.garden.meta())));
        /* The moves, at 0.8x — they are seen moving, and mostly out of focus. */
        await open(0.8);
        for (let i = 0; i < stations; i++) {
          /* The kitchen has no entry clip: the first station is a still, never moving. */
          if (mode === "veg" && i === 0) continue;
          const dir = path.join(out, `m${i}`);
          fs.rmSync(dir, { recursive: true, force: true });
          fs.mkdirSync(dir);
          const n = Math.round(FPS * (i === 0 ? SECONDS.entry : mode === "veg" ? (i === 2 ? SECONDS.blur : SECONDS.step) : i === stations - 1 ? SECONDS.end : mode === "garden" && lesson === "5" ? SECONDS.walk : SECONDS.step));
          for (let f = 0; f < n; f++) {
            const url = await page.evaluate(([i, t]) => window.garden.move(i, t), [i, f / (n - 1)]);
            fs.writeFileSync(path.join(dir, `${String(f).padStart(4, "0")}.jpg`), Buffer.from(url.split(",")[1], "base64"));
          }
          console.log(`${mode} ${lesson} ${frame} move ${i}: ${n} frames`);
        }
        if (mode === "veg") {
          if (lesson !== "1") continue;
          await open(1.6);
          const kitchen = path.join(out, "kitchen");
          fs.rmSync(kitchen, { recursive: true, force: true });
          fs.mkdirSync(kitchen);
          fs.writeFileSync(path.join(out, "kitchen.json"), JSON.stringify(await page.evaluate(() => window.garden.kitchenMeta())));
          for (const [layer, url] of Object.entries(await page.evaluate(() => window.garden.kitchenLayers()))) save(kitchen, layer, url);
        } else if (mode !== "hill" && Number(lesson) <= (mode === "forest" ? 10 : 4)) {
          await open(1.6);
          const layers = await page.evaluate(() => window.garden.findLayers());
          const find = path.join(out, "find");
          fs.rmSync(find, { recursive: true, force: true });
          fs.mkdirSync(find);
          for (const [layer, url] of Object.entries(layers)) save(find, layer, url);
        }
      }
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
