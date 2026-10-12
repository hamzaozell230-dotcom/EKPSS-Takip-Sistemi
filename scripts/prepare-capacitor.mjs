// Copies the static client build (wherever the build tool put it) into ./www for Capacitor.
import { cpSync, existsSync, rmSync, readdirSync, copyFileSync } from "node:fs";
import { join } from "node:path";

const candidates = [".output/public", "dist/client", "dist"];
const src = candidates.find((d) => existsSync(d) && readdirSync(d).length > 0);
if (!src) {
  console.error("Build output not found in: " + candidates.join(", "));
  process.exit(1);
}
rmSync("www", { recursive: true, force: true });
cpSync(src, "www", { recursive: true });

if (!existsSync(join("www", "index.html"))) {
  const shell = readdirSync("www").find((f) => f.endsWith(".html"));
  if (!shell) {
    console.error("No HTML entry found in " + src);
    process.exit(1);
  }
  copyFileSync(join("www", shell), join("www", "index.html"));
}
console.log(`Capacitor web assets ready: ${src} -> www`);
