import { Outlet, useLocation } from "react-router";
import { useRef } from "react";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";

export const pushVariants = {
  initial: (direction: number) => ({
    x: direction > 0 ? "100%" : "-30%",
    y: "100px",
  }),
  animate: {
    x: "0%",
    y: "100px",
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-30%" : "100%",
    y: "100px",
  }),
};

export default function AnimatedLayout() {
  const location = useLocation();
  const previousPath = useRef(location.pathname);

  previousPath.current = location.pathname;

  const titles: Record<string, string> = {
    "/login": "Connexion",
    "/signin": "Inscription",
  };

  const withFooterPages: string[] = [];

  return (
    <div id="app">
      <Header title={location.pathname && titles[location.pathname]} />

      <div
        key={location.pathname}
        className={`animated-wrapper ${
          withFooterPages.includes(location.pathname)
            ? "with-footer"
            : undefined
        }`}
      >
        <Outlet />
      </div>

      {withFooterPages.includes(location.pathname) && <Footer />}
    </div>
  );
}
