
// components/admin/resonance-simulator.tsx

"use client";

import { useState } from "react";
import { 
  Search, 
  Activity, 
  Target, 
  AlertCircle, 
  Zap,
  Network
} from "lucide-react";

// --- INFRAESTRUCTURA UI ---
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

// --- LÓGICA DE NEGOCIO SOBERANA ---
import { simulateVaultSearch } from "@/actions/vault-actions";

/**
 * COMPONENTE: ResonanceSimulator
 * Laboratorio de pruebas para la inteligencia semántica de NicePod.
 * Permite a los administradores inyectar intenciones (queries) y auditar
 * qué vectores de conocimiento recupera el modelo.
 */
export function ResonanceSimulator() {
    // --- ESTADO LOCAL DEL LABORATORIO ---
    const [query, setQuery] = useState("");
    const [threshold, setThreshold] = useState([0.75]); // Umbral de similitud base
    const [isSimulating, setIsSimulating] = useState(false);
    
    // El tipo 'any[]' se mantiene para flexibilidad de los retornos de Supabase Edge Functions
    const [results, setResults] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    /**
     * handleSimulate: Protocolo de Inyección de Frecuencia.
     * Despacha la consulta a través de los Server Actions hacia la Edge Function de búsqueda.
     */
    const handleSimulate = async () => {
        // Validación de higiene: No buscar en vacío
        if (!query.trim()) return;

        setIsSimulating(true);
        setError(null);
        setResults([]); // Limpieza del radar previo

        try {
            // 1. Invocación de Acción Estándar (Devuelve VaultActionResponse)
            const response = await simulateVaultSearch(query, threshold[0]);

            if (response.success) {
                // 2. [FIX TS2339]: La acción ahora aloja los resultados en la propiedad genérica '.data'
                // Fallback a array vacío si data es null o undefined para evitar crasheos de '.map()'
                const semanticNodes = Array.isArray(response.data) ? response.data : [];
                setResults(semanticNodes);
                
                if (semanticNodes.length === 0) {
                    setError("No se encontraron hechos atómicos que superen el umbral de similitud.");
                }
            } else {
                // Si la función falla lógicamente (ej. timeout de red), mostramos el mensaje oficial
                setError(response.error || response.message || "Fallo en la calibración del radar.");
            }
        } catch (err: any) {
            console.error("🔥 [Resonance-Simulator-Fatal]:", err);
            setError("Fallo crítico de red al contactar la Bóveda HNSW.");
        } finally {
            setIsSimulating(false);
        }
    };

    /**
     * getSimilarityColor: Termómetro Visual de Precisión.
     * Codifica la calidad del matching vectorial para facilitar auditorías rápidas.
     */
    const getSimilarityColor = (score: number) => {
        if (score >= 0.85) return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
        if (score >= 0.70) return "text-primary bg-primary/10 border-primary/20";
        return "text-amber-400 bg-amber-400/10 border-amber-400/20";
    };

    return (
        <Card className="bg-[#050505] border-white/5 shadow-2xl rounded-[2.5rem] overflow-hidden">
            
            {/* CABECERA DEL LABORATORIO */}
            <div className="bg-white/[0.02] border-b border-white/5 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                        <Network size={20} className="text-primary" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-white">Laboratorio de Resonancia</h3>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-medium mt-1">
                            Auditoría de Radar Semántico 768d
                        </p>
                    </div>
                </div>
            </div>

            <CardContent className="p-6 md:p-8 space-y-8">
                
                {/* 
                    BLOQUE I: PANEL DE CONTROL DE PARÁMETROS 
                */}
                <div className="space-y-6">
                    {/* Input de Intención (Query) */}
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-primary transition-colors h-5 w-5" />
                        <Input
                            placeholder="Ingrese un concepto, tema o intención de investigación..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSimulate()}
                            className="pl-12 h-14 bg-zinc-900/50 border-white/10 rounded-2xl text-white placeholder:text-zinc-600 focus-visible:ring-primary focus-visible:border-primary transition-all font-medium text-base"
                            disabled={isSimulating}
                        />
                    </div>

                    {/* Calibración de Umbral de Similitud (Cosine Similarity Threshold) */}
                    <div className="space-y-4 bg-black/20 p-5 rounded-2xl border border-white/5">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 flex items-center gap-2">
                                <Target size={12} /> Umbral de Similitud (Threshold)
                            </label>
                            <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                                {threshold[0].toFixed(2)}
                            </span>
                        </div>
                        <Slider
                            value={threshold}
                            onValueChange={setThreshold}
                            max={0.95}
                            min={0.30}
                            step={0.01}
                            className="py-2"
                            disabled={isSimulating}
                        />
                        <p className="text-[9px] text-zinc-600 font-medium uppercase tracking-widest text-center">
                            Umbrales altos (0.8+) requieren coincidencias semánticas casi idénticas.
                        </p>
                    </div>

                    <Button 
                        onClick={handleSimulate} 
                        disabled={isSimulating || !query.trim()}
                        className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary via-indigo-500 to-primary opacity-90 group-hover:opacity-100 transition-opacity" />
                        <span className="relative z-10 flex items-center gap-2">
                            {isSimulating ? (
                                <>
                                    <Activity className="animate-spin h-4 w-4" /> 
                                    <span>Lanzando Pulso...</span>
                                </>
                            ) : (
                                <>
                                    <Zap className="h-4 w-4" /> 
                                    <span>Simular Extracción</span>
                                </>
                            )}
                        </span>
                    </Button>
                </div>

                {/* 
                    BLOQUE II: VISOR DE TELEMETRÍA (RESULTADOS O ERROR)
                */}
                {error && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2">
                        <AlertCircle className="text-amber-500 h-5 w-5 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-1">Informe de Fallo</h4>
                            <p className="text-xs font-medium text-amber-200/80">{error}</p>
                        </div>
                    </div>
                )}

                {results.length > 0 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary flex items-center justify-between border-b border-white/5 pb-2">
                            <span>Vectores Recuperados</span>
                            <span className="text-zinc-500">Volumen: {results.length}</span>
                        </h4>
                        
                        <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                            {results.map((r, idx) => (
                                <div key={idx} className="p-4 bg-zinc-900/40 border border-white/5 hover:border-primary/30 transition-colors rounded-2xl space-y-3 group">
                                    <div className="flex items-start justify-between gap-4">
                                        <p className="text-sm font-medium text-zinc-300 leading-relaxed italic group-hover:text-white transition-colors">
                                            "{r.content}"
                                        </p>
                                        
                                        {/* Insignia de Precisión Vectorial */}
                                        <div className={`shrink-0 px-2 py-1 border rounded-md flex items-center gap-1 ${getSimilarityColor(r.similarity)}`}>
                                            <Target size={10} />
                                            <span className="font-mono font-bold text-[10px]">
                                                {r.similarity.toFixed(3)}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 opacity-50">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">
                                            Origen: {r.title || "Dato Atómico"}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Resolución TS2339: La línea crítica 'const semanticNodes = Array.isArray(response.data) ? response.data : [];'
 *    asegura que TypeScript y el motor de React siempre tengan un Array para mapear, eliminando el fallo
 *    que causaba que el Build Shield abortara.
 * 2. Rendimiento UX: Se ha implementado soporte para ejecutar la simulación pulsando 'Enter' (onKeyDown).
 * 3. Feedback Táctil: La colorimetría dinámica de la métrica 'similarity' permite a los ingenieros de IA
 *    (Administradores) detectar de un vistazo si el radar está trayendo "ruido" (color naranja) o 
 *    "inteligencia pura" (color verde).
 */