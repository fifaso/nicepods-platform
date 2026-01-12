// components/admin/vault-dashboard-client.tsx
// VERSIÓN: 1.0 (NKV Operational Dashboard - Tabs & Ingestion)

"use client";

import { useState, useTransition } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VaultManager } from "./vault-manager";
import { ResonanceSimulator } from "./resonance-simulator";
import { ManualIngestionModal } from "./manual-ingestion-modal";
import { Database, Microscope, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VaultDashboardProps {
    initialSources: any[];
}

export function VaultDashboardClient({ initialSources }: VaultDashboardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="space-y-8">
            <Tabs defaultValue="inventory" className="w-full">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
                    {/* SELECTOR DE MODO */}
                    <TabsList className="bg-white/5 border border-white/5 p-1.5 rounded-[1.5rem] h-16 shadow-inner w-full md:w-auto">
                        <TabsTrigger value="inventory" className="rounded-xl px-8 font-black text-[10px] tracking-[0.2em] data-[state=active]:bg-white/10">
                            <Database size={16} className="mr-2" /> INVENTARIO
                        </TabsTrigger>
                        <TabsTrigger value="simulator" className="rounded-xl px-8 font-black text-[10px] tracking-[0.2em] data-[state=active]:bg-white/10">
                            <Microscope size={16} className="mr-2" /> LABORATORIO
                        </TabsTrigger>
                    </TabsList>

                    {/* ACCIÓN PRIMARIA */}
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="h-16 px-10 rounded-[1.5rem] bg-primary text-white font-black uppercase tracking-[0.2em] text-xs shadow-[0_0_30px_rgba(var(--primary),0.3)] hover:scale-105 transition-transform"
                    >
                        <Plus size={20} className="mr-2" /> Inyectar Conocimiento
                    </Button>
                </div>

                {/* VISTA A: GESTIÓN DE FUENTES */}
                <TabsContent value="inventory" className="animate-in slide-in-from-bottom-4 duration-500 outline-none">
                    <VaultManager initialSources={initialSources} />
                </TabsContent>

                {/* VISTA B: LABORATORIO DE RESONANCIA */}
                <TabsContent value="simulator" className="animate-in slide-in-from-bottom-4 duration-500 outline-none">
                    <ResonanceSimulator />
                </TabsContent>
            </Tabs>

            {/* MODAL DE INGESTA MANUAL */}
            <ManualIngestionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

            {/* DECORACIÓN AMBIENTAL */}
            <div className="fixed bottom-10 right-10 opacity-10 pointer-events-none">
                <Sparkles size={120} className="text-primary animate-pulse" />
            </div>
        </div>
    );
}