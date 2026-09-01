const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "..", "src", "timer-se-card.js");
const outDir = path.join(__dirname, "..", "dist");
const out = path.join(outDir, "ha-timer-se-card.js");

if (!fs.existsSync(src)) {
  console.error("Source file not found: " + src);
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });
fs.copyFileSync(src, out);
console.log("Built " + out);
