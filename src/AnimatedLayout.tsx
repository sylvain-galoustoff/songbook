import { Outlet, useLocation, useMatches } from "react-router";
import { useRef, type JSX } from "react";
import Header from "./components/Header/Header";
import { AnimatePresence, motion } from "motion/react";

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
  initial: { y: "100%" },
  animate: { y: "0%" },
  exit: { y: "100%" },
};

const pushTransition = {
  duration: 0.35,
  ease: [0.4, 0, 0.2, 1] as const,
};

type RouteHandle = {
  title?: string;
  backArrow?: boolean;
  footer?: JSX.Element;
};

export default function AnimatedLayout() {
  const location = useLocation();
  const matches = useMatches();

  // ---- Route active (pattern + params déjà résolus)
  const currentMatch = matches[matches.length - 1];
  const handle = currentMatch?.handle as RouteHandle | undefined;

  // ---- Direction d’animation (simple et stable)
  const previousPath = useRef(location.pathname);
  const direction = location.pathname > previousPath.current ? -1 : 1;
  previousPath.current = location.pathname;

  return (
    <div id="app">
      <Header
        title={handle?.title ?? ""}
        backArrow={Boolean(handle?.backArrow)}
      />

      <AnimatePresence>
        <motion.div
          key={location.pathname}
          custom={direction}
          variants={pushVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pushTransition}
          className={`animated-wrapper ${handle?.footer ? "with-footer" : ""}`}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {handle?.footer && (
          <motion.footer
            key={`footer-${currentMatch?.id}`}
            variants={footerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {handle.footer}
          </motion.footer>
        )}
      </AnimatePresence>
    </div>
  );
}
