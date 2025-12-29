import { Outlet, useLocation } from "react-router";
import { useRef, type JSX } from "react";
import Header from "./components/Header/Header";
import { AnimatePresence, motion } from "motion/react";
import HomeFooter from "./views/Home/HomeFooter";

export const pushVariants = {
  initial: (direction: number) => ({
    x: direction > 0 ? "100%" : "-30%",
  }),
  animate: {
    x: "0%",
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-30%" : "100%",
  }),
};

export const footerVariants = {
  initial: {
    y: "100%",
  },
  animate: {
    y: "0%",
  },
  exit: {
    y: "100%",
  },
};

const pushTransition = {
  duration: 0.35,
  ease: [0.4, 0, 0.2, 1] as const,
};

export default function AnimatedLayout() {
  const location = useLocation();
  const previousPath = useRef(location.pathname);

  const direction = location.pathname > previousPath.current ? -1 : 1;
  previousPath.current = location.pathname;

  const titles: Record<string, string> = {
    "/login": "Connexion",
    "/signin": "Inscription",
    "/": "Vos titres",
  };

  const withFooterPages: string[] = ["/"];

  const footers: Record<string, JSX.Element> = {
    "/": <HomeFooter />,
  };

  return (
    <div id="app">
      <Header title={location.pathname && titles[location.pathname]} />

      <AnimatePresence>
        <motion.div
          key={location.pathname}
          custom={direction}
          variants={pushVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pushTransition}
          className={`animated-wrapper ${
            withFooterPages.includes(location.pathname)
              ? "with-footer"
              : undefined
          }`}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {withFooterPages.includes(location.pathname) && (
          <motion.footer
            key={`footer-${location.pathname}`}
            variants={footerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {location.pathname && footers[location.pathname]}
          </motion.footer>
        )}
      </AnimatePresence>
    </div>
  );
}
