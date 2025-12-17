// components/platform-info-dialog.tsx
// VERSIÓN: 2.0 (Dynamic Aurora Button: "Conócenos")

"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info, Sparkles, BrainCircuit, Headphones, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function PlatformInfoDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="relative group cursor-pointer">
            {/* Capa de Brillo (Glow) detrás del botón */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-200"></div>
            
            <Button 
                className={cn(
                    "relative h-10 px-5 rounded-full border-0 overflow-hidden",
                    "text-white font-bold text-xs tracking-wide uppercase",
                    "shadow-xl transition-all active:scale-95"
                )}
                style={{
                    background: "linear-gradient(270deg, #ec4899, #8b5cf6, #3b82f6, #ec4899)",
                    backgroundSize: "300% 300%",
                    animation: "aurora 6s ease infinite"
                }}
            >
                {/* Definición de la animación inline para no tocar tailwind.config */}
                <style jsx>{`
                    @keyframes aurora {
                        0% { background-position: 0% 50% }
                        50% { background-position: 100% 50% }
                        100% { background-position: 0% 50% }
                    }
                `}</style>

                <Sparkles className="mr-2 h-4 w-4 text-yellow-200 animate-pulse" />
                Conócenos
            </Button>
        </div>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md bg-slate-950 border-slate-800 text-slate-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-white">
            <Sparkles className="h-5 w-5 text-purple-500" />
            NicePod Manifiesto
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Redefiniendo cómo consumimos conocimiento.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
            {/* Puntos Clave Estratégicos */}
            <div className="flex gap-4">
                <div className="mt-1 bg-blue-500/10 p-2 rounded-lg h-fit">
                    <BrainCircuit className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                    <h4 className="font-semibold text-white text-sm">Inteligencia que Potencia</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        No generamos contenido genérico. Usamos IA avanzada para sintetizar, estructurar y personalizar el conocimiento a tu medida.
                    </p>
                </div>
            </div>

            <div className="flex gap-4">
                <div className="mt-1 bg-pink-500/10 p-2 rounded-lg h-fit">
                    <Headphones className="h-5 w-5 text-pink-400" />
                </div>
                <div>
                    <h4 className="font-semibold text-white text-sm">Cultura en Audio</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Transformamos la lectura pasiva en una experiencia auditiva inmersiva. Aprende mientras te mueves, sin fricción.
                    </p>
                </div>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <p className="text-xs text-center text-slate-500 italic">
                    "NicePod es tu filtro de señal en un mundo lleno de ruido."
                </p>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}