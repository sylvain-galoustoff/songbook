import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
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
          "icons/maskable-icon-512x512.png",
        ],
      },
      manifest: {
        name: "Songbook",
        short_name: "Songbook",
        description:
          "Lecteur multipiste synchronisé pour les répétitions du groupe.",
        theme_color: "#863bff",
        background_color: "#ffffff",
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
