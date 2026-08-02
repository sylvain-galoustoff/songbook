import { useRegisterSW } from "virtual:pwa-register/react";

// En registerType "autoUpdate" (cf. vite.config.ts), le SW s'active et
// recharge la page tout seul dès qu'une nouvelle version est détectée : plus
// de bannière à afficher, plus de choix à laisser au musicien. Ce composant
// ne sert donc plus qu'à déclencher l'enregistrement du SW (injectRegister:
// false impose un enregistrement explicite côté app) — il ne rend rien.
export function PwaUpdatePrompt() {
  useRegisterSW();
  return null;
}
