/*
 * Renders one Find scene (`scene.html?scene=<name>`, three.js from the
 * jsdelivr CDN) in headless Chromium and writes every layer to `out/<name>/`:
 * the scene, the empty world, and each item alone on a shadow catcher (+ a
 * shadow-less copy for its hit area). Then run
 * `python3 tools/picnic-scene/crop.py <name>`.
 *
 *   node tools/picnic-scene/render.cjs squares   (picnic | squares | triangles | rectangles)
 *
 * Needs Playwright with Chromium (`npx playwright install chromium`); not a
 * project dependency — the site only ships the finished images.
 */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const name = process.argv[2] || "picnic";

(async () => {
  const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const page = await browser.newPage({ viewport: { width: 1000, height: 1250 } });
  await page.goto("file://" + path.join(__dirname, "scene.html") + "?scene=" + name);
  await page.waitForFunction(() => window.ready, null, { timeout: 60000 });
  const layers = await page.evaluate(() => window.renderLayers());
  const out = path.join(__dirname, "out", name);
  fs.mkdirSync(out, { recursive: true });
  for (const [name, url] of Object.entries(layers)) {
    fs.writeFileSync(path.join(out, `${name}.png`), Buffer.from(url.split(",")[1], "base64"));
  }
  fs.writeFileSync(path.join(out, "meta.json"), JSON.stringify(await page.evaluate(() => window.itemsMeta())));
  await browser.close();
})();
