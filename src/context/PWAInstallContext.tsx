import { createContext, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";

type PWAInstallContextType = {
  isInstalled: boolean;
};

const PWAInstallContext = createContext<PWAInstallContextType>({
  isInstalled: false,
});

export function PWAInstallProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isInstalled, setIsInstalled] = useState<boolean>(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const installed =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone;

    setIsInstalled(installed);

    // Si l'app n'est PAS installée et qu'on n'est PAS déjà sur /install
    if (!installed && location.pathname !== "/install") {
      navigate("/install", { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <PWAInstallContext.Provider value={{ isInstalled }}>
      {children}
    </PWAInstallContext.Provider>
  );
}

export function usePWAInstall() {
  return useContext(PWAInstallContext);
}
