// components/ui/floating-action-button.tsx
// VERSIÓN: 3.0 (Compact & Safe Z-Index)

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";
import { useAudio } from "@/contexts/audio-context";

export function FloatingActionButton() {
  const { currentPodcast } = useAudio();
  
  // Si hay reproductor, subimos mucho más (bottom-32) para librar el player y su progreso
  const bottomPosition = currentPodcast ? "bottom-32" : "bottom-6";

  return (
    <motion.div
      className={`fixed ${bottomPosition} right-4 z-40 md:hidden transition-all duration-500 ease-in-out`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileTap={{ scale: 0.9 }}
    >
      <Link href="/create" passHref>
        <Button
          size="icon"
          // Tamaño reducido a h-12 (48px) para ser estándar móvil, no gigante
          className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl hover:shadow-2xl border border-white/20"
          aria-label="Crear nuevo podcast"
        >
          <Mic className="h-5 w-5" />
        </Button>
      </Link>
    </motion.div>
  );
}