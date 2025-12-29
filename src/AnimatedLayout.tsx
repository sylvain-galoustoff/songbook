import { Outlet, useLocation } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
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

const pushTransition = {
  duration: 0.35,
  ease: [0.4, 0, 0.2, 1] as const,
};

export default function AnimatedLayout() {
  const location = useLocation();
  const previousPath = useRef(location.pathname);

  const direction = location.pathname > previousPath.current ? -1 : 1;

  previousPath.current = location.pathname;

  return (
    <div id="app">
      <Header />
      <AnimatePresence>
        <motion.div
          key={location.pathname}
          custom={direction}
          variants={pushVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pushTransition}
          className="animated-wrapper"
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
