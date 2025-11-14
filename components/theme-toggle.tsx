// components/theme-toggle.tsx
// VERSIÓN POTENCIADA: Toggle directo con transición animada y robustez para SSR.

"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  // Utilizamos 'resolvedTheme' para saber cuál es el tema activo, incluso si el usuario ha seleccionado "system".
  const { resolvedTheme, setTheme } = useTheme();
  
  // Este estado es crucial para prevenir errores de hidratación en Next.js.
  // El componente renderizará un placeholder hasta que esté montado en el cliente.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // La función de toggle ahora es simple y directa.
  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  // Mientras el componente no se haya montado en el cliente, mostramos un botón deshabilitado
  // del mismo tamaño para evitar saltos en el layout (Cumulative Layout Shift).
  if (!mounted) {
    return <Button variant="ghost" size="icon" className="h-9 w-9" disabled aria-label="Cargando selector de tema" />;
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Cambiar entre tema claro y oscuro">
      <AnimatePresence mode="wait" initial={false}>
        {/* Usamos el 'key' para que AnimatePresence detecte el cambio y active la animación de entrada/salida. */}
        <motion.div
          key={resolvedTheme}
          initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          {resolvedTheme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </motion.div>
      </AnimatePresence>
    </Button>
  );
}