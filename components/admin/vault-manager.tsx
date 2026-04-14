// components/admin/vault-manager.tsx
// VERSIÓN: 4.1 (Madrid Resonance Protocol V4.0)
/**
 * ARCHIVO: components/admin/vault-manager.tsx
 * VERSIÓN: 4.1 (Madrid Resonance)
 * PROTOCOLO: Madrid Resonance Protocol V4.0
 * MISIÓN: Grid de alta densidad para la gestión del inventario de Bóveda.
 * NIVEL DE INTEGRIDAD: HIGH
 */

"use client";

import { useState, useTransition } from "react";
import { deleteVaultSource, VaultKnowledgeSource } from "@/actions/vault-actions";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Trash2, ExternalLink, Search, Database } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * COMPONENTE: VaultManager
 */
export function VaultManager({ initialSources }: { initialSources: VaultKnowledgeSource[] }) {
    const [sourcesInventory, setSourcesInventory] = useState<VaultKnowledgeSource[]>(initialSources);
    const [searchTerms, setSearchTerms] = useState("");
    const [isPendingSovereignty, startTransitionSovereignty] = useTransition();

    const filteredSourcesInventory = sourcesInventory.filter(source =>
        source.title.toLowerCase().includes(searchTerms.toLowerCase()) ||
        source.uniformResourceLocator?.toLowerCase().includes(searchTerms.toLowerCase())
    );

    const handleDeleteAction = async (sourceIdentification: string) => {
        if (!confirm("¿Seguro que deseas purgar esta sabiduría?")) return;
        startTransitionSovereignty(async () => {
            const administrativeResponse = await deleteVaultSource(sourceIdentification);
            if (administrativeResponse.success) {
                setSourcesInventory(sourcesInventory.filter(source => source.identification !== sourceIdentification));
                toast.success("Fuente eliminada.");
            }
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* BARRA DE BÚSQUEDA */}
            <div className="relative max-w-2xl">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <Input
                    placeholder="Filtrar inventario por concepto o URL..."
                    className="pl-14 h-16 bg-white/5 border-white/10 rounded-2xl text-white font-medium text-lg shadow-inner"
                    value={searchTerms}
                    onChange={(e) => setSearchTerms(e.target.value)}
                />
            </div>

            {/* GRID DE ALTA DENSIDAD */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSourcesInventory.map((source) => (
                    <div key={source.identification} className="p-6 bg-zinc-900/40 backdrop-blur-2xl border border-white/5 rounded-[2rem] flex flex-col justify-between gap-6 hover:border-primary/30 transition-all group shadow-xl">
                        <div className="space-y-4">
                            <div className="flex justify-between items-start">
                                <Badge className={cn(
                                    "text-[9px] font-black tracking-widest border-none px-2.5 py-0.5 rounded-full",
                                    source.sourceTypeDescriptor === 'admin' ? "bg-amber-500/20 text-amber-400" : "bg-blue-500/20 text-blue-400"
                                )}>
                                    {source.sourceTypeDescriptor.toUpperCase()}
                                </Badge>
                                <div className="p-1.5 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 size={14} className="text-zinc-600 hover:text-red-400 cursor-pointer" onClick={() => handleDeleteAction(source.identification)} />
                                </div>
                            </div>

                            <h3 className="text-base font-bold text-white uppercase tracking-tight leading-tight line-clamp-2">
                                {source.title}
                            </h3>

                            {source.uniformResourceLocator && (
                                <a href={source.uniformResourceLocator} target="_blank" rel="noopener noreferrer" className="text-[10px] text-zinc-500 flex items-center gap-2 hover:text-primary transition-colors">
                                    <ExternalLink size={12} />
                                    <span className="truncate">{source.uniformResourceLocator}</span>
                                </a>
                            )}
                        </div>

                        <div className="flex items-center gap-3 pt-5 border-t border-white/5 mt-auto">
                            <div className="p-2 bg-white/5 rounded-lg text-zinc-500"><Database size={14} /></div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] leading-none mb-1">Densidad</p>
                                <p className="text-sm font-black text-white">{source.knowledgeChunksInventory?.[0]?.count || 0} Hechos</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredSourcesInventory.length === 0 && (
                <div className="py-40 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                    <p className="text-zinc-700 font-black uppercase tracking-[0.5em] text-sm">Sin coincidencias en el Vault</p>
                </div>
            )}
        </div>
    );
}
