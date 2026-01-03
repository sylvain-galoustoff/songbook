import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import styles from "./InstallApp.module.css";

export default function InstallApp() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifie si l'app est déjà installée
    const isInstalled =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone; // iOS
    if (isInstalled) {
      navigate("/"); // redirige vers la home
      return;
    }

    // Écoute le prompt PWA
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Redirige après installation
    const appInstalledHandler = () => navigate("/");
    window.addEventListener("appinstalled", appInstalledHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", appInstalledHandler);
    };
  }, [navigate]);

  const installApp = () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => {
      setDeferredPrompt(null);
      navigate("/"); // retourne vers home après choix
    });
  };

  return (
    <div className={`page`} id="install">
      <main className={styles.main}>
        <h1 className={styles.title}>Installer Songbook</h1>
        <p className={styles.subTitle}>
          Pour profiter de toutes les fonctionnalités, installez l’application.
        </p>
        <button className="secondary" onClick={installApp}>
          Installer l’app
        </button>
      </main>
    </div>
  );
}
