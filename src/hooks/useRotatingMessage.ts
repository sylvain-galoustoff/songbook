import { useEffect, useState } from "react";

// Fait tourner un message "fun" toutes les `intervalMs`, indépendamment de la
// progression réelle (qui, elle, va dans une barre de progression à part —
// cf. Loader). `tick` s'incrémente en continu plutôt que d'être réinitialisé
// à chaque changement de `messages` (ex. changement de phase de
// chargement) : la liste affichée change, mais pas forcément à partir de son
// premier élément — un détail purement cosmétique, sans conséquence.
export function useRotatingMessage(
  messages: readonly string[],
  intervalMs: number,
  active: boolean,
): string {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!active || messages.length <= 1) return;
    const id = setInterval(() => {
      setTick((current) => current + 1);
    }, intervalMs);
    return () => clearInterval(id);
  }, [active, messages, intervalMs]);

  return messages.length > 0 ? messages[tick % messages.length] : "";
}
