/* The pictures laid on Bloo's worlds of stops (2026-11-08), in lesson order, as
   data URLs (a `file:` image would taint the canvas): the animals' own
   pictures, and each season's view out of his round window. To change an
   animal's picture, change its file here. `render.cjs stops animals|weather`
   passes them to `window.garden.setPictures`. */
const fs = require("fs");
const path = require("path");

const FILES = {
  animals: ["cat", "dog", "fish", "elephant", "mouse", "bird", "parrot", "turtle", "gecko"].map((a) => `learn/bloo/animals/things/${a}.png`),
  weather: ["spring", "summer", "fall", "winter"].map((s) => `learn/bloo/seasons-weather/window/${s}.jpg`),
};

const stopPictures = (course) =>
  (FILES[course] ?? []).map((file) => {
    const type = file.endsWith(".png") ? "image/png" : "image/jpeg";
    return `data:${type};base64,` + fs.readFileSync(path.join(__dirname, "../../public/assets", file)).toString("base64");
  });

module.exports = { stopPictures };
