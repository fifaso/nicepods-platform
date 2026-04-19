/**
 * ARCHIVO: components/admin/vault-dashboard-client.tsx
 * VERSIÓN: 8.3 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: Madrid Resonance Protocol V8.3
 * MISIÓN: Panel de control interactivo para la gestión física del índice vectorial.
 * NIVEL DE INTEGRIDAD: 100% (Strategist Verified)
 */

"use client";

import { useState } from "react";
import { 
  Trash2, 
  Search, 
  Plus, 
  Database, 
  Server, 
  Link as LinkIcon,
  ShieldAlert
} from "lucide-react";

// --- INFRAESTRUCTURA UI ---
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// --- LÓGICA DE NEGOCIO SOBERANA ---
import { deleteVaultSource, VaultKnowledgeSource } from "@/actions/vault-actions";
import { ManualIngestionModal } from "./manual-ingestion-modal";
import { ResonanceSimulator } from "./resonance-simulator";

/**
 * INTERFAZ: VaultDashboardComponentProperties
 */
interface VaultDashboardComponentProperties {
    initialSources: VaultKnowledgeSource[];
}

/**
 * COMPONENTE: VaultDashboardClient
 * El panel de control interactivo para la gestión física del índice vectorial.
 */
export function VaultDashboardClient({ initialSources }: VaultDashboardComponentProperties) {
    const { toast } = useToast();
    
    // --- ESTADOS LOCALES ---
    const [searchTerm, setSearchTerm] = useState("");
    const [isDeletingIdentification, setIsDeletingIdentification] = useState<string | null>(null);
    const [isModalOpenSovereignty, setIsModalOpenSovereignty] = useState(false);

    /**
     * MOTOR DE BÚSQUEDA LOCAL:
     */
    const filteredSourcesInventory = initialSources.filter(source =>
        source.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        source.sourceTypeDescriptor?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    /**
     * PROTOCOLO DE PURGA: handleDeleteAction
     */
    const handleDeleteAction = async (sourceIdentification: string, sourceTitle: string) => {
        if (!window.confirm(`⚠️ ADVERTENCIA CRÍTICA:\n¿Está seguro de purgar la fuente "${sourceTitle}"?\nEsto eliminará permanentemente todos sus vectores del índice HNSW.`)) return;

        setIsDeletingIdentification(sourceIdentification);
        try {
            const administrativeResponse = await deleteVaultSource(sourceIdentification);
            if (administrativeResponse.success) {
                toast({
                    title: "Purga Ejecutada",
                    description: `La fuente "${sourceTitle}" ha sido erradicada de la Bóveda.`,
                });
            } else {
                throw new Error(administrativeResponse.message || administrativeResponse.exceptionInformation || "Fallo en la purga.");
            }
        } catch (vaultException: unknown) {
            const errorMessage = vaultException instanceof Error ? vaultException.message : "Error desconocido";
            console.error("🔥 [Vault-Client-Fatal]:", errorMessage);
            toast({
                title: "Error de Contención",
                description: errorMessage,
                variant: "destructive"
            });
        } finally {
            setIsDeletingIdentification(null);
        }
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* 
                BLOQUE I: INVENTARIO DE LA BÓVEDA (MAIN PANEL)
            */}
            <div className="xl:col-span-2 space-y-6">
                
                {/* Barra de Herramientas de Inventario */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/40 p-4 rounded-2xl border border-white/5">
                    <div className="relative flex-1 max-w-sm group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Localizar fuente en la Bóveda..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-black/50 border-white/10 rounded-xl h-10 text-xs font-medium text-white placeholder:text-zinc-600 focus-visible:ring-primary focus-visible:border-primary"
                        />
                    </div>
                    
                    <Button 
                        onClick={() => setIsModalOpenSovereignty(true)}
                        className="h-10 rounded-xl font-black uppercase tracking-widest text-[10px] bg-primary text-black hover:bg-primary/90 shadow-[0_0_20px_rgba(var(--primary),0.2)]"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Inyectar Inteligencia
                    </Button>
                </div>

                {/* Tabla de Datos de Alta Densidad */}
                <div className="border border-white/5 rounded-[2rem] overflow-hidden bg-[#050505] shadow-2xl">
                    <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                        <Table>
                            <TableHeader className="bg-zinc-900/80 sticky top-0 z-10 backdrop-blur-md">
                                <TableRow className="border-white/5 hover:bg-transparent">
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 py-5">Identidad de Fuente</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Origen</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Densidad (Vectores)</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Auditoría</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredSourcesInventory.length === 0 ? (
                                    <TableRow className="hover:bg-transparent border-none">
                                        <TableCell colSpan={4} className="h-48 text-center">
                                            <div className="flex flex-col items-center justify-center text-zinc-500 gap-3">
                                                <Database size={32} className="opacity-20" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">No se detectaron registros en esta frecuencia.</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredSourcesInventory.map((source) => (
                                        <TableRow key={source.identification} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                                            <TableCell className="py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-bold text-sm text-zinc-200 group-hover:text-primary transition-colors line-clamp-1 max-w-[300px]" title={source.title}>
                                                        {source.title}
                                                    </span>
                                                    {source.uniformResourceLocator ? (
                                                        <a href={source.uniformResourceLocator} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[9px] text-zinc-600 hover:text-primary transition-colors w-max">
                                                            <LinkIcon size={10} /> Enlace Externo
                                                        </a>
                                                    ) : (
                                                        <span className="text-[9px] text-zinc-700 uppercase tracking-widest">Inyección Nativa</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            
                                            <TableCell>
                                                <Badge variant="outline" className={`text-[8px] uppercase tracking-widest font-black border-white/10 ${source.sourceTypeDescriptor === 'admin' ? 'text-amber-400 bg-amber-400/5 border-amber-400/20' : 'text-zinc-400'}`}>
                                                    {source.sourceTypeDescriptor}
                                                </Badge>
                                            </TableCell>
                                            
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Server size={12} className="text-primary/60" />
                                                    <span className="font-mono font-bold text-xs text-zinc-300">
                                                        {source.knowledgeChunksInventory?.[0]?.count || 0}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteAction(source.identification, source.title)}
                                                    disabled={isDeletingIdentification === source.identification}
                                                    className="h-8 w-8 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                    title="Purgar del Índice Vectorial"
                                                >
                                                    {isDeletingIdentification === source.identification ? (
                                                        <div className="h-4 w-4 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
                                                    ) : (
                                                        <Trash2 size={16} />
                                                    )}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* 
                BLOQUE II: LABORATORIO LATERAL (SIDE PANEL)
            */}
            <div className="xl:col-span-1 space-y-6">
                <div className="p-4 bg-zinc-900/40 border border-white/5 rounded-2xl flex items-start gap-3">
                    <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest leading-relaxed font-medium">
                        <span className="text-amber-500 font-black block mb-1">Zona de Alta Precisión</span>
                        La inyección manual y la purga afectan directamente el radar semántico de todos los curadores.
                    </p>
                </div>
                
                <ResonanceSimulator />
            </div>

            {/* MODAL DE INYECCIÓN (Orquestador de Refinería) */}
            <ManualIngestionModal 
                isOpen={isModalOpenSovereignty}
                onClose={() => setIsModalOpenSovereignty(false)}
            />

        </div>
    );
}
