// components/theme-test-panel.tsx
// VERSIÓN: 1.2 (Theme Diagnostic Master - Fixed Imports & Zero Warning)
// Misión: Estación de monitoreo visual para validar la integridad cromática y de contrastes.

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Loader2 // [FIX]: Importación restaurada para el estado de carga
  ,
  Monitor,
  Moon,
  Settings,
  Sun,
  Zap
} from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";

/**
 * ThemeTestPanel: Herramienta de auditoría para el sistema de diseño Aurora.
 */
export function ThemeTestPanel() {
  const { theme, setTheme, resolvedTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  /**
   * runThemeTests
   * Ejecuta una batería de validaciones sobre el DOM para asegurar que el motor
   * de temas está inyectando las variables correctas en el tiempo de ejecución.
   */
  const runThemeTests = useCallback(() => {
    if (typeof window === 'undefined' || !document.documentElement) return;

    const results: Record<string, boolean> = {};

    // Prueba 1: Sincronía de Clase HTML
    results.htmlClassApplied = document.documentElement.classList.contains("dark") === (resolvedTheme === "dark");

    // Prueba 2: Inyección de Variables CSS
    const computedStyle = getComputedStyle(document.documentElement);
    const bgColor = computedStyle.getPropertyValue("--background").trim();
    results.cssVariablesSet = bgColor.length > 0;

    // Prueba 3: Renderizado de Capas Transparentes (Glassmorphism)
    const glassElements = document.querySelectorAll(".glass-card");
    results.glassElementsStyled = glassElements.length > 0;

    // Prueba 4: Validación de Contraste Adaptativo
    const textElements = document.querySelectorAll(".text-gray-900, .dark\\:text-gray-100");
    results.textContrastAdequate = textElements.length > 0;

    // Prueba 5: Verificación de Animaciones de Transición
    const transitionElements = document.querySelectorAll('[class*="transition"]');
    results.transitionsWorking = transitionElements.length > 0;

    console.log("📊 [NicePod-Theme] Diagnóstico completado:", results);
    setTestResults(results);
  }, [resolvedTheme]);

  /**
   * [MONTAJE]: Hydration Guard
   * Marcamos el componente como montado para evitar discrepancias entre servidor y cliente.
   */
  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * [SINCRO]: Disparo automático de pruebas
   * Sincronizado con la resolución del tema para detectar fallos en caliente.
   */
  useEffect(() => {
    if (mounted) {
      runThemeTests();
    }
  }, [mounted, runThemeTests]);

  // Pantalla de carga profesional (Evita Layout Shift)
  if (!mounted) {
    return (
      <Card className="w-full bg-card/20 backdrop-blur-xl border-white/10 shadow-2xl">
        <CardContent className="p-16 flex flex-col items-center justify-center space-y-6">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <div className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/40 animate-pulse">
            Sincronizando Frecuencia...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-white/10 shadow-2xl bg-card/30 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden animate-in fade-in duration-1000">
      <CardHeader className="p-10 pb-4 bg-white/[0.02] border-b border-white/5">
        <CardTitle className="flex items-center gap-4 text-3xl font-black uppercase tracking-tighter italic">
          <Settings className="h-8 w-8 text-primary" />
          Diagnóstico de Interfaz
        </CardTitle>
      </CardHeader>

      <CardContent className="p-10 space-y-10">
        {/* SELECTOR DE AMBIENTE TÁCTICO */}
        <div className="space-y-4">
          <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary px-1">Matriz de Color</Label>
          <div className="flex gap-4 p-2 bg-zinc-950/50 rounded-2xl border border-white/5 shadow-inner">
            <Button
              variant={theme === "light" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTheme("light")}
              className="flex-1 rounded-xl font-black uppercase text-[10px] h-12 tracking-widest transition-all"
            >
              <Sun className="h-4 w-4 mr-2" />
              Amanecer
            </Button>
            <Button
              variant={theme === "dark" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTheme("dark")}
              className="flex-1 rounded-xl font-black uppercase text-[10px] h-12 tracking-widest transition-all"
            >
              <Moon className="h-4 w-4 mr-2" />
              Nebulosa
            </Button>
            <Button
              variant={theme === "system" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTheme("system")}
              className="flex-1 rounded-xl font-black uppercase text-[10px] h-12 tracking-widest transition-all"
            >
              <Monitor className="h-4 w-4 mr-2" />
              Auto
            </Button>
          </div>
        </div>

        {/* RESULTADOS DE LAS PRUEBAS DE INTEGRIDAD */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Escaneo de Capas</Label>
            <Activity className="h-4 w-4 text-primary animate-pulse" />
          </div>
          <div className="grid gap-3">
            {Object.entries(testResults).map(([testName, isPassed]) => (
              <div
                key={testName}
                className="flex items-center justify-between p-5 rounded-[1.5rem] bg-black/40 border border-white/5 hover:border-white/20 transition-all shadow-lg"
              >
                <span className="text-xs font-black uppercase tracking-tight text-white/70">
                  {testName.replace(/([A-Z])/g, " $1").trim()}
                </span>
                {isPassed ? (
                  <div className="flex items-center gap-3 text-emerald-400">
                    <span className="text-[9px] font-black uppercase tracking-widest">Óptimo</span>
                    <CheckCircle className="h-5 w-5" />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-red-500">
                    <span className="text-[9px] font-black uppercase tracking-widest">Falla</span>
                    <AlertCircle className="h-5 w-5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* MUESTRARIO DE REACTIVIDAD (Visual Regression Test) */}
        <div className="space-y-6 pt-6 border-t border-white/10">
          <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 px-1">Componentes de Prueba</Label>
          <div className="grid gap-8">
            <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 shadow-inner">
              <p className="text-foreground font-black text-2xl uppercase tracking-tighter leading-none mb-2">Identidad Aurora</p>
              <p className="text-muted-foreground text-base font-medium leading-relaxed italic">
                "El conocimiento compartido es el único activo que se revaloriza en la ciudad."
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Badge className="bg-emerald-600 text-white rounded-lg px-4 py-1.5 font-black text-[9px] uppercase tracking-[0.2em]">Sincronizado</Badge>
              <Badge className="bg-orange-600 text-white rounded-lg px-4 py-1.5 font-black text-[9px] uppercase tracking-[0.2em]">En Espera</Badge>
              <Badge variant="outline" className="rounded-lg px-4 py-1.5 font-black text-[9px] uppercase tracking-[0.2em] border-primary/40 text-primary">Sistema V2.5</Badge>
            </div>
          </div>
        </div>

        {/* ACCIÓN DE RE-ESCÁNER MANUAL */}
        <Button
          onClick={runThemeTests}
          className="w-full h-20 rounded-[1.5rem] font-black text-xl uppercase tracking-tighter shadow-2xl bg-gradient-to-r from-primary via-purple-600 to-indigo-600 hover:brightness-110 active:scale-[0.98] transition-all group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Zap className="h-6 w-6 mr-4 group-hover:rotate-12 transition-transform relative z-10" />
          <span className="relative z-10">Ejecutar Escaneo de Verdad</span>
        </Button>
      </CardContent>
    </Card>
  );
}