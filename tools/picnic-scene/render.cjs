/*
 * Renders the picnic scene (`scene.html`, three.js from the jsdelivr CDN) in
 * headless Chromium and writes every layer to `out/`: the scene, the empty
 * world, and each item alone on a shadow catcher (+ a shadow-less copy for its
 * hit area). Then run `python3 tools/picnic-scene/crop.py`.
 *
 * Needs Playwright with Chromium (`npx playwright install chromium`); not a
 * project dependency — the site only ships the finished images.
 */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

(async () => {
  const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const page = await browser.newPage({ viewport: { width: 1000, height: 1250 } });
  await page.goto("file://" + path.join(__dirname, "scene.html"));
  await page.waitForFunction(() => window.ready, null, { timeout: 60000 });
  const layers = await page.evaluate(() => window.renderLayers());
  const out = path.join(__dirname, "out");
  fs.mkdirSync(out, { recursive: true });
  for (const [name, url] of Object.entries(layers)) {
    fs.writeFileSync(path.join(out, `${name}.png`), Buffer.from(url.split(",")[1], "base64"));
  }
  fs.writeFileSync(path.join(out, "meta.json"), JSON.stringify(await page.evaluate(() => window.itemsMeta())));
  await browser.close();
})();
