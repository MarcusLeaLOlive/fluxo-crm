/**
 * Pós-build: injeta o HTML pré-renderizado da apresentação em dist/index.html.
 * Rode depois de `vite build` e `vite build --ssr src/entry-server.jsx --outDir dist-ssr`.
 */
import { readFile, writeFile, rm } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const htmlPath = path.join(root, "dist", "index.html");
const { render } = await import(pathToFileURL(path.join(root, "dist-ssr", "entry-server.js")).href);

const html = await readFile(htmlPath, "utf8");
const marker = '<div id="root"></div>';
if (!html.includes(marker)) throw new Error("Marcador <div id=\"root\"></div> não encontrado em dist/index.html");

await writeFile(htmlPath, html.replace(marker, `<div id="root">${render()}</div>`));
await rm(path.join(root, "dist-ssr"), { recursive: true, force: true });
console.log("OK: apresentação pré-renderizada em dist/index.html");
