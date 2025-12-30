import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { IoCloseCircle } from "react-icons/io5";

interface ModalProps {
  name: string;
  closeModal: () => void;
  children: ReactNode;
}

export default function Modal({ name, closeModal, children }: ModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="modal"
    >
      <IoCloseCircle className="close-modal-button" onClick={closeModal} />
      <AnimatePresence>
        <motion.div
          className="box-wrapper"
          key={`box-${name}`}
          initial={{ y: "-20px" }}
          animate={{ y: "0" }}
          exit={{ y: "-20px" }}
          transition={{ duration: 0.15, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
