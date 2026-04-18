/**
 * ARCHIVO: app/(platform)/theme-test/page.tsx
 * VERSIÓN: 5.1 (Madrid Resonance)
 * PROTOCOLO: Intellectual Capital & Traceability
 * MISIÓN: Terminal de validación sensorial y peritaje de la interfaz atmosférica NicePod.
 * NIVEL DE INTEGRIDAD: 100%
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Palette, Eye, Zap, CheckCircle, Monitor, Smartphone, Tablet, Globe } from "lucide-react";

/**
 * ThemeTestPage: Laboratorio de hardware visual.
 * Misión: Garantizar que la atmósfera Lumen-Shield sea consistente en todas las dimensiones de renderizado.
 */
export default function ThemeTestPage() {
  return (
    <div className="min-h-screen bg-[#010101] pt-0 isolate">

      {/*
          I. ELEMENTOS ATMOSFÉRICOS (AMBIENT GLOW)
          Misión: Proyectar la identidad visual sin comprometer el rendimiento del hardware.
      */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
      <div
        className="absolute top-40 right-20 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="max-w-6xl mx-auto pt-24 pb-8 px-4 sm:px-6 lg:px-8 relative z-10">

        {/* CABECERA: PROTOCOLO DE PERITAJE VISUAL */}
        <div className="mb-12">
          <div className="inline-flex items-center space-x-2 bg-zinc-900 border border-white/5 px-4 py-2 rounded-full font-black uppercase tracking-[0.2em] mb-4 shadow-2xl">
            <Palette className="h-4 w-4 text-primary" />
            <span className="text-[10px] text-zinc-400">Suite de Validación Visual</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-white uppercase italic leading-none">NicePod <span className="text-primary not-italic">Atmos</span></h1>
          <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[11px] mt-4">
            Panel integral para la verificación de consistencia estética y soberanía de marca.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">

          {/* SECCIÓN II: VALIDACIÓN MULTI-HARDWARE */}
          <div className="space-y-6">
            <Card className="bg-[#050505]/80 backdrop-blur-3xl border-white/5 shadow-2xl rounded-[2.5rem] overflow-hidden">
              <CardHeader className="pt-8 px-8">
                <CardTitle className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-white italic">
                  <Globe className="h-5 w-5 text-primary" />
                  Validación Multi-Plataforma
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-8 pb-8 mt-2">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-2xl bg-zinc-900/50 border border-white/5">
                    <Monitor className="h-6 w-6 mx-auto mb-3 text-zinc-400" />
                    <div className="text-[9px] font-black uppercase tracking-widest mb-2">Escritorio</div>
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[8px] uppercase font-black">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Certificado
                    </Badge>
                  </div>
                  <div className="text-center p-4 rounded-2xl bg-zinc-900/50 border border-white/5">
                    <Tablet className="h-6 w-6 mx-auto mb-3 text-zinc-400" />
                    <div className="text-[9px] font-black uppercase tracking-widest mb-2">Tablet</div>
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[8px] uppercase font-black">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Certificado
                    </Badge>
                  </div>
                  <div className="text-center p-4 rounded-2xl bg-zinc-900/50 border border-white/5">
                    <Smartphone className="h-6 w-6 mx-auto mb-3 text-zinc-400" />
                    <div className="text-[9px] font-black uppercase tracking-widest mb-2">Móvil</div>
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[8px] uppercase font-black">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Certificado
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SECCIÓN III: GALERÍA DE COMPONENTES SOBERANOS */}
          <div className="space-y-6">
            <Card className="bg-[#050505]/80 backdrop-blur-3xl border-white/5 shadow-2xl rounded-[2.5rem] overflow-hidden">
              <CardHeader className="pt-8 px-8">
                <CardTitle className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-white italic">
                  <Eye className="h-5 w-5 text-primary" />
                  Biblioteca de Activos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 px-8 pb-8 mt-2">

                {/* Visualización de Navegación Atmosférica */}
                <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5">
                  <div className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-4">Interfaz de Navegación</div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-primary rounded-lg shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]"></div>
                      <span className="font-black text-xs uppercase tracking-tighter italic text-white">NicePod</span>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-12 h-6 bg-white/5 rounded-lg"></div>
                      <div className="w-6 h-6 bg-white/5 rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Formulario de Alta Fidelidad */}
                <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5">
                  <div className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-4">Soberanía de Entrada</div>
                  <div className="space-y-3">
                    <Input placeholder="Input Industrial" className="h-12 rounded-xl bg-black border-white/5 focus:ring-primary/20 text-xs" />
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-[9px] bg-primary text-primary-foreground">
                        Primario
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-[9px] bg-transparent border-white/10 text-white">
                        Secundario
                      </Button>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* SECCIÓN IV: RESUMEN DE INTEGRIDAD */}
            <Card className="bg-[#050505]/80 backdrop-blur-3xl border-white/5 shadow-2xl rounded-[2.5rem] overflow-hidden">
              <CardHeader className="pt-8 px-8">
                <CardTitle className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-white italic">
                  <Zap className="h-5 w-5 text-primary" />
                  Métricas de Integridad
                </CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-8 mt-2">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">
                      Toggle de Tema Lumen-Shield
                    </span>
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Cinemática de Transición</span>
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">
                      Consistencia Soberana
                    </span>
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
