// components/admin/resonance-simulator.tsx
// VERSIÓN: 1.1 (Master Standard - Fix Missing Icon Import & Stability)

"use client";

import { useState, useTransition } from "react";
import { simulateVaultSearch } from "@/actions/vault-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    Zap,
    Microscope,
    BookOpen,
    AlertTriangle,
    Calendar,
    Info,
    Loader2,
    Sparkles,
    ExternalLink // [FIJO]: Importación añadida para evitar ReferenceError
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function ResonanceSimulator() {
    const [query, setQuery] = useState("");
    const [threshold, setThreshold] = useState([0.7]);
    const [results, setResults] = useState<any[]>([]);
    const [isPending, startTransition] = useTransition();

    /**
     * handleTest: Dispara la simulación de búsqueda semántica en el NKV.
     */
    const handleTest = () => {
        if (!query || query.length < 3) return;
        startTransition(async () => {
            const data = await simulateVaultSearch(query, threshold[0]);
            // El action devuelve { success, results }
            if (data.success) setResults(data.results);
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">

            {/* 1. PANEL DE CALIBRACIÓN */}
            <div className="lg:col-span-1 space-y-6">
                <div className="p-8 bg-zinc-900/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] shadow-2xl space-y-8">
                    <header className="space-y-1">
                        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                            <Microscope size={16} /> Parámetros
                        </h3>
                        <p className="text-[10px] text-zinc-500 font-medium uppercase">Ajuste de sensibilidad semántica</p>
                    </header>

                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <label className="text-[11px] font-black text-white/70 uppercase tracking-widest">Umbral (Cosine)</label>
                            <Badge variant="outline" className="font-mono text-primary bg-primary/5 border-primary/20">
                                {threshold[0].toFixed(2)}
                            </Badge>
                        </div>
                        <Slider
                            value={threshold}
                            onValueChange={setThreshold}
                            max={1} min={0.3} step={0.01}
                            className="py-2"
                        />
                        <div className="flex justify-between text-[9px] font-bold text-zinc-600 uppercase">
                            <span>Asociativo (0.3)</span>
                            <span>Exacto (1.0)</span>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-500 uppercase px-1">Término de Consulta</label>
                            <Input
                                placeholder="Ej: Estoicismo y tecnología..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleTest()}
                                className="bg-black/40 border-white/10 h-14 rounded-2xl text-white font-medium focus:border-primary transition-all shadow-inner"
                            />
                        </div>
                        <Button
                            onClick={handleTest}
                            disabled={isPending || query.length < 3}
                            className="w-full h-16 bg-primary text-white font-black uppercase tracking-widest gap-3 rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all"
                        >
                            {isPending ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                            SIMULAR RECUPERACIÓN
                        </Button>
                    </div>
                </div>

                <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-start gap-4">
                    <Info className="text-amber-500 shrink-0" size={18} />
                    <p className="text-[10px] text-amber-200/60 leading-relaxed font-medium">
                        <span className="text-amber-400 font-bold">Nota de Admin:</span> Este laboratorio utiliza el modelo <b>text-embedding-004</b>. Los resultados mostrados son los mismos que recibirá el Agente Pro durante el draft.
                    </p>
                </div>
            </div>

            {/* 2. RESULTADOS DEL ADN SEMÁNTICO */}
            <div className="lg:col-span-2 space-y-6">
                <AnimatePresence mode="wait">
                    {results.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="h-96 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]"
                        >
                            <div className="p-6 bg-white/5 rounded-full mb-4">
                                <Search size={40} className="text-zinc-700" />
                            </div>
                            <p className="text-xs font-black uppercase tracking-[0.4em] text-zinc-600">Esperando Señal...</p>
                        </motion.div>
                    ) : (
                        <div className="grid gap-4">
                            {results.map((res, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="p-6 bg-card/40 backdrop-blur-3xl border border-white/5 rounded-[2rem] hover:border-primary/40 transition-all shadow-2xl relative overflow-hidden group"
                                >
                                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                                        <Sparkles size={100} />
                                    </div>

                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-black text-xs">
                                                #{i + 1}
                                            </div>
                                            <div className="space-y-0.5">
                                                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Hecho Atómico</span>
                                                <p className="text-[11px] font-bold text-zinc-500 uppercase truncate max-w-[200px] md:max-w-md">
                                                    {res.title}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-zinc-500 uppercase mb-1">Similitud</p>
                                            <Badge className="bg-primary text-white border-none font-mono text-xs px-3">
                                                {(res.similarity * 100).toFixed(2)}%
                                            </Badge>
                                        </div>
                                    </div>

                                    <blockquote className="text-base text-zinc-200 font-medium leading-relaxed italic mb-6 border-l-2 border-primary/30 pl-6">
                                        "{res.content}"
                                    </blockquote>

                                    <div className="flex items-center justify-between pt-4 border-t border-white/5 relative z-10">
                                        <div className="flex items-center gap-4 text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                                            <span className="flex items-center gap-1.5"><Calendar size={12} /> {res.days_old.toFixed(0)} días</span>
                                            {res.url && (
                                                <a href={res.url} target="_blank" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                                                    <ExternalLink size={12} /> Fuente Original
                                                </a>
                                            )}
                                        </div>
                                        <Badge variant="secondary" className="text-[9px] bg-white/5 text-zinc-500 border-none">
                                            ID: {res.source_id.substring(0, 8)}
                                        </Badge>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}