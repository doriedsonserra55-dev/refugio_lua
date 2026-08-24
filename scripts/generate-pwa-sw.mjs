import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const distDirectory = path.join(projectRoot, "dist");
const serviceWorkerPath = path.join(distDirectory, "sw.js");

async function collectFiles(directory, relativeDirectory = "") {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    const relativePath = path.join(relativeDirectory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(absolutePath, relativePath)));
      continue;
    }
    if (relativePath === "sw.js") continue;
    files.push(`/${relativePath.split(path.sep).join("/")}`);
  }

  return files;
}

const assets = (await collectFiles(distDirectory)).sort();
const version = createHash("sha256").update(assets.join("\n")).digest("hex").slice(0, 12);
const cacheName = `refugio-shell-${version}`;
const assetList = JSON.stringify(assets, null, 2);

const serviceWorker = `const CACHE_NAME = ${JSON.stringify(cacheName)};
const PRECACHE_URLS = ${assetList};

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith("refugio-shell-") && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/") || url.pathname.startsWith("/trpc/")) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/") || caches.match("/index.html"))),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    }),
  );
});
`;

await fs.writeFile(serviceWorkerPath, serviceWorker, "utf8");
console.log(`Generated ${path.relative(projectRoot, serviceWorkerPath)} with ${assets.length} precached files.`);
