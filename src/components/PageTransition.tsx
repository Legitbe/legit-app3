import { motion } from "framer-motion";
import { ReactNode } from "react";

export const PageTransition = ({ children }: { children: ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.2 }}
    style={{ width: "100%" }}
  >
    {children}
  </motion.div>
);
