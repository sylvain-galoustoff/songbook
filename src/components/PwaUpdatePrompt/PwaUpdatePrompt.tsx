import { useRegisterSW } from "virtual:pwa-register/react";
import "./PwaUpdatePrompt.scss";

/**
 * Signale la disponibilité d'une nouvelle version de l'app et laisse le
 * musicien choisir quand recharger : un reload forcé pendant une répétition
 * couperait le son en cours, donc jamais d'auto-reload ici (registerType
 * "prompt" côté vite.config.ts va dans le même sens).
 */
export function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div className="pwa-update-prompt" role="status">
      <span>Nouvelle version disponible.</span>
      <button type="button" onClick={() => updateServiceWorker(true)}>
        Mettre à jour
      </button>
      <button
        type="button"
        className="dismiss"
        onClick={() => setNeedRefresh(false)}
      >
        Plus tard
      </button>
    </div>
  );
}
