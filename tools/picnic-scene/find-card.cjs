/* Renders `find-card.html`'s clay magnifier → `out/find-card/magnifier.png` (transparent).
   node tools/picnic-scene/find-card.cjs   (Playwright + Chromium, like render.cjs). */
const { chromium } = require(process.env.PW || "playwright");
const fs = require("fs");
const path = require("path");
(async () => {
  const browser = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"], executablePath: process.env.CHROME });
  const page = await browser.newPage({ viewport: { width: 1000, height: 1000 } });
  page.on("pageerror", (e) => console.error("find-card.html:", e.message));
  await page.goto("file://" + path.join(__dirname, "find-card.html"));
  await page.waitForFunction(() => window.ready, null, { timeout: 60000 });
  const url = await page.evaluate(() => window.magnifier());
  const dir = path.join(__dirname, "out", "find-card");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "magnifier.png"), Buffer.from(url.split(",")[1], "base64"));
  await browser.close();
})();
