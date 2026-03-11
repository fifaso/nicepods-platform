// components/compass-filter-bar.tsx
/**
 * =================================================================================
 * Compass Filter Bar - v1.0.0
 * =================================================================================
 *
 * Rol en la Arquitectura:
 * Este es un componente "presentacional" o "tonto". Su única responsabilidad es
 * renderizar una lista de "Lentes Temáticas" (tags) y notificar a su componente
 * padre (`ResonanceCompass`) cuando el usuario selecciona una.
 *
 * Principios de Diseño:
 * - Desacoplado: No tiene conocimiento de cómo funciona el mapa estelar; solo gestiona la selección de tags.
 * - Interactivo: Utiliza `framer-motion` para una entrada suave y `hover` states para un feedback visual claro.
 * - Reutilizable: Podría ser utilizado en otras partes de la aplicación que necesiten un filtro por tags.
 *
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface CompassFilterBarProps {
  tags: string[];
  activeTag: string | null;
  onTagSelect: (tag: string | null) => void;
}

export function CompassFilterBar({ tags, activeTag, onTagSelect }: CompassFilterBarProps) {
  // Define las variantes de animación para una entrada escalonada y elegante.
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05, // Cada badge aparecerá con un pequeño retraso.
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div 
      className="flex flex-wrap gap-2 justify-center mb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <Badge
          variant={!activeTag ? "default" : "secondary"}
          onClick={() => onTagSelect(null)}
          className="cursor-pointer text-sm transition-all hover:bg-primary/80"
        >
          Todas las Constelaciones
        </Badge>
      </motion.div>
      
      {tags.map(tag => (
        <motion.div key={tag} variants={itemVariants}>
          <Badge
            variant={activeTag === tag ? "default" : "secondary"}
            onClick={() => onTagSelect(tag)}
            className="cursor-pointer text-sm transition-all hover:bg-primary/80"
          >
            {tag}
          </Badge>
        </motion.div>
      ))}
    </motion.div>
  );
}