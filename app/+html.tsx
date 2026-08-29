import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

const serviceWorkerRegistration = `
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
        // O app continua funcionando normalmente quando o host não permite service workers.
      });
    });
  }
`;

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />
        <meta name="theme-color" content="#2F6F8F" />
        <meta name="description" content="Um espaço anônimo para desabafar, acolher e encontrar respiro." />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Refúgio da Lua" />
        <meta property="og:title" content="Refúgio da Lua — um espaço de paz" />
        <meta property="og:description" content="Um espaço anônimo para desabafar, acolher e encontrar respiro." />
        <meta property="og:image" content="/logo-refugio-da-lua.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="preload" as="image" href="/logo-refugio-da-lua.png" />
        <link rel="apple-touch-icon" href="/logo-192.png" />
        <script dangerouslySetInnerHTML={{ __html: serviceWorkerRegistration }} />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
