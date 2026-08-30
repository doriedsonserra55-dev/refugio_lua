import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const distDirectory = path.join(projectRoot, "dist");
const requiredFiles = ["index.html", "manifest.json", "sw.js", "favicon.png", "logo-192.png", "logo-512.png", "logo-refugio-da-lua.png"];

const errors = [];
for (const file of requiredFiles) {
  try {
    await fs.access(path.join(distDirectory, file));
  } catch {
    errors.push(`arquivo ausente: dist/${file}`);
  }
}

try {
  const manifest = JSON.parse(await fs.readFile(path.join(distDirectory, "manifest.json"), "utf8"));
  if (manifest.name !== "Refúgio da Lua — um espaço de paz") errors.push("manifesto sem nome esperado");
  if (manifest.display !== "standalone") errors.push("manifesto não está em modo standalone");
  if (manifest.start_url !== "/") errors.push("manifesto sem start_url raiz");
  if (!Array.isArray(manifest.icons) || manifest.icons.length < 2) errors.push("manifesto sem os dois ícones de instalação");
} catch (error) {
  errors.push(`manifesto inválido: ${error instanceof Error ? error.message : String(error)}`);
}

try {
  const html = await fs.readFile(path.join(distDirectory, "index.html"), "utf8");
  for (const marker of ['lang="pt-BR"', 'rel="manifest"', 'register("/sw.js"', 'theme-color']) {
    if (!html.includes(marker)) errors.push(`HTML sem marcador: ${marker}`);
  }
} catch (error) {
  errors.push(`HTML não pôde ser lido: ${error instanceof Error ? error.message : String(error)}`);
}

try {
  const serviceWorker = await fs.readFile(path.join(distDirectory, "sw.js"), "utf8");
  for (const marker of ["CACHE_NAME", "PRECACHE_URLS", "self.addEventListener(\"fetch\"", "/api/"]) {
    if (!serviceWorker.includes(marker)) errors.push(`service worker sem marcador: ${marker}`);
  }
} catch (error) {
  errors.push(`service worker não pôde ser lido: ${error instanceof Error ? error.message : String(error)}`);
}

if (errors.length > 0) {
  console.error("PWA validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`PWA validation passed: ${requiredFiles.length} artefatos e metadados essenciais conferidos.`);
}
