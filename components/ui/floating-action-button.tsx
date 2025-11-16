// components/ui/floating-action-button.tsx
// Un botón de acción flotante, visible solo en pantallas pequeñas, para un acceso rápido a la creación.

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";

export function FloatingActionButton() {
  return (
    // Este componente solo será visible en pantallas pequeñas (md:hidden).
    <motion.div
      className="fixed bottom-6 right-6 z-50 md:hidden"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
    >
      <Link href="/create" passHref>
        <Button
          size="icon"
          className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
          aria-label="Crear nuevo podcast"
        >
          <Mic className="h-7 w-7" />
        </Button>
      </Link>
    </motion.div>
  );
}