import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import React from "react";

interface AuroraCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  gradient?: boolean; // Opción para añadir un brillo sutil
}

export const AuroraCard = ({ 
  children, 
  className, 
  gradient = false,
  ...props 
}: AuroraCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        // Base Glassmorphism
        "relative overflow-hidden rounded-2xl border border-white/10",
        "bg-card/40 backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.12)]",
        // Textura sutil
        gradient && "before:absolute before:inset-0 before:bg-gradient-to-br before:from-violet-500/5 before:to-transparent before:pointer-events-none",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};