/* Renders `find-card.html`'s three parts → `out/find-card/{back,front,magnifier}.png`.
   node tools/picnic-scene/find-card.cjs   (Playwright + Chromium, like render.cjs). */
const { chromium } = require(process.env.PW || "playwright");
const fs = require("fs");
const path = require("path");
(async () => {
  const browser = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"], executablePath: process.env.CHROME });
  const dir = path.join(__dirname, "out", "find-card");
  fs.mkdirSync(dir, { recursive: true });
  for (const part of ["back", "front", "magnifier"]) {
    const size = part === "magnifier" ? { width: 1000, height: 1000 } : { width: 2752, height: 1720 };
    const page = await browser.newPage({ viewport: size });
    page.on("pageerror", (e) => console.error("find-card.html:", e.message));
    await page.goto("file://" + path.join(__dirname, "find-card.html") + "?part=" + part);
    await page.waitForFunction(() => window.ready, null, { timeout: 90000 });
    const url = await page.evaluate(() => window.shot());
    fs.writeFileSync(path.join(dir, part + ".png"), Buffer.from(url.split(",")[1], "base64"));
    await page.close();
  }
  await browser.close();
})();
