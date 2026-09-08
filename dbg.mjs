import { open, toTrace, trace } from "./lib.mjs";
const { b, page } = await open(1);
await toTrace(page);
await trace(page, [[[30,27],[50,11],[50,91]]]);
await page.getByRole("button", { name: /^Next$/ }).first().click();
await page.waitForTimeout(900);
console.log(await page.evaluate(() => [...document.querySelectorAll("button")].map(x => JSON.stringify([x.getAttribute("aria-label"), x.textContent.trim().slice(0,20)])).join("\n")));
await b.close();
