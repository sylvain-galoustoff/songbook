import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Un client bloqué sur un SW cassé (cf. correctif navigateFallbackDenylist
      // ci-dessous) doit se réparer seul, sans manip côté utilisateur : le SW
      // s'active et recharge la page automatiquement dès qu'une version plus
      // récente est détectée. Compromis assumé : un reload peut interrompre
      // une lecture audio en cours si la détection tombe en pleine répétition
      // (cf. src/components/PwaUpdatePrompt, qui ne fait plus qu'enregistrer
      // le SW, sans bannière de confirmation).
      registerType: "autoUpdate",
      injectRegister: false,
      // Precache uniquement le shell applicatif : jamais l'audio (mp3/flac).
      // Aucune règle de runtimeCaching n'est ajoutée pour l'audio non plus,
      // afin que ces requêtes ne soient jamais interceptées par le SW.
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
        // mp3/flac : jamais précachés. Les icônes du manifest (192/512/maskable)
        // sont déjà injectées automatiquement par le plugin, on évite le doublon.
        globIgnores: [
          "**/*.{mp3,flac,wav}",
          "icons/pwa-192x192.png",
          "icons/pwa-512x512.png",
          "icons/pwa-192-maskable.png",
          "icons/maskable-icon-512x512.png",
        ],
        // Sans ça, le SW sert index.html (navigateFallback) en réponse à une
        // requête d'asset non précaché après redéploiement (ex. chunk JS dont
        // le hash a changé) : le navigateur reçoit du HTML avec un
        // Content-Type text/html là où il attendait un module JS -> page
        // blanche. On exclut donc explicitement /assets/ et toute URL avec
        // extension de fichier du fallback SPA, qui ne doit s'appliquer
        // qu'aux véritables navigations (routes client).
        navigateFallbackDenylist: [/^\/assets\//, /\.[^/?]+$/],
        cleanupOutdatedCaches: true,
        // injectRegister: false empêche le plugin de les forcer lui-même
        // (il ne le fait que si injectRegister vaut "auto"/null) : sans ça,
        // le nouveau SW resterait en attente jusqu'à fermeture complète de
        // l'onglet, comme en registerType "prompt" — on perdrait la
        // réparation immédiate visée par "autoUpdate".
        skipWaiting: true,
        clientsClaim: true,
      },
      manifest: {
        name: "Songbook",
        short_name: "Songbook",
        description:
          "Lecteur multipiste synchronisé pour les répétitions du groupe.",
        theme_color: "#dc3c64",
        background_color: "#304878",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "icons/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "icons/pwa-192-maskable.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "icons/maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
});
