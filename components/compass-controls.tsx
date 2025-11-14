// components/compass-controls.tsx
"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { motion } from "framer-motion";

interface CompassControlsProps {
  activeLimit: number;
  onLimitChange: (limit: number) => void;
}

const limitOptions = [5, 10, 20];

export function CompassControls({ activeLimit, onLimitChange }: CompassControlsProps) {
  return (
    <motion.div 
      className="flex justify-center mb-8"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1 }}
    >
      <ToggleGroup
        type="single"
        value={String(activeLimit)}
        onValueChange={(value) => {
          if (value) {
            onLimitChange(parseInt(value, 10));
          }
        }}
        className="bg-accent/50 p-1 rounded-lg"
      >
        {limitOptions.map(limit => (
          <ToggleGroupItem key={limit} value={String(limit)} aria-label={`Mostrar Top ${limit}`}>
            Top {limit}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </motion.div>
  );
}