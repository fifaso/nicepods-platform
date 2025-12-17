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
import { Info, Sparkles, BrainCircuit, Headphones } from "lucide-react";

export function PlatformInfoDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
        >
          <Info className="h-5 w-5" />
          <span className="sr-only">Sobre NicePod</span>
        </Button>
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