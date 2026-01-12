// components/admin/vault-manager.tsx
// VERSIÓN: 1.1 (Aurora Master - Density Inventory Grid)

"use client";

import { useState, useTransition } from "react";
import { deleteVaultSource } from "@/actions/vault-actions";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Trash2, ExternalLink, Search, BookOpenCheck, Database } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function VaultManager({ initialSources }: { initialSources: any[] }) {
    const [sources, setSources] = useState(initialSources);
    const [search, setSearch] = useState("");
    const [isPending, startTransition] = useTransition();

    const filteredSources = sources.filter(s =>
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.url?.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = async (id: string) => {
        if (!confirm("¿Seguro que deseas purgar esta sabiduría?")) return;
        startTransition(async () => {
            const res = await deleteVaultSource(id);
            if (res.success) {
                setSources(sources.filter(s => s.id !== id));
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
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* GRID DE ALTA DENSIDAD */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSources.map((source) => (
                    <div key={source.id} className="p-6 bg-zinc-900/40 backdrop-blur-2xl border border-white/5 rounded-[2rem] flex flex-col justify-between gap-6 hover:border-primary/30 transition-all group shadow-xl">
                        <div className="space-y-4">
                            <div className="flex justify-between items-start">
                                <Badge className={cn(
                                    "text-[9px] font-black tracking-widest border-none px-2.5 py-0.5 rounded-full",
                                    source.source_type === 'admin' ? "bg-amber-500/20 text-amber-400" : "bg-blue-500/20 text-blue-400"
                                )}>
                                    {source.source_type.toUpperCase()}
                                </Badge>
                                <div className="p-1.5 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 size={14} className="text-zinc-600 hover:text-red-400 cursor-pointer" onClick={() => handleDelete(source.id)} />
                                </div>
                            </div>

                            <h3 className="text-base font-bold text-white uppercase tracking-tight leading-tight line-clamp-2">
                                {source.title}
                            </h3>

                            {source.url && (
                                <a href={source.url} target="_blank" className="text-[10px] text-zinc-500 flex items-center gap-2 hover:text-primary transition-colors">
                                    <ExternalLink size={12} />
                                    <span className="truncate">{source.url}</span>
                                </a>
                            )}
                        </div>

                        <div className="flex items-center gap-3 pt-5 border-t border-white/5 mt-auto">
                            <div className="p-2 bg-white/5 rounded-lg text-zinc-500"><Database size={14} /></div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] leading-none mb-1">Densidad</p>
                                <p className="text-sm font-black text-white">{source.knowledge_chunks?.[0]?.count || 0} Hechos</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredSources.length === 0 && (
                <div className="py-40 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                    <p className="text-zinc-700 font-black uppercase tracking-[0.5em] text-sm">Sin coincidencias en el Vault</p>
                </div>
            )}
        </div>
    );
}