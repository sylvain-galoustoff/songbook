import { Outlet, useLocation } from "react-router";
import { useRef } from "react";
import Header from "./components/Header/Header";

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

  return (
    <div id="app">
      <Header />

      <div key={location.pathname} className="animated-wrapper">
        <Outlet />
      </div>
    </div>
  );
}
