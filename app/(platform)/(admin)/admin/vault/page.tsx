// app/admin/vault/page.tsx
// VERSIÓN: 1.0 (NKV Master Console - Admin Sovereign Access)

import { listVaultSources } from "@/actions/vault-actions";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { VaultDashboardClient } from "@/components/admin/vault-dashboard-client";
import { ShieldCheck, Database, Zap, Microscope } from "lucide-react";

/**
 * PAGE: AdminVaultPage
 * Punto de entrada protegido para la gestión del Knowledge Vault.
 */
export default async function AdminVaultPage() {
    const supabase = createClient();

    // 1. PROTOCOLO DE SEGURIDAD NIVEL 2 (Server-Side Role Validation)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login?redirect=/admin/vault');

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        // Redirección silenciosa para usuarios no autorizados
        redirect('/');
    }

    // 2. HIDRATACIÓN DE DATOS (Fetch paralelo de fuentes y métricas)
    const sources = await listVaultSources();

    // 3. CÁLCULO DE MÉTRICAS DE IMPACTO
    const totalFacts = sources.reduce((acc: number, curr: any) =>
        acc + (curr.knowledge_chunks?.[0]?.count || 0), 0
    );

    return (
        <div className="min-h-screen pt-24 pb-20 px-6 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">

            {/* HEADER EJECUTIVO: Aurora Style */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-12">
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.3em] text-[10px]">
                        <ShieldCheck size={14} className="animate-pulse" />
                        Acceso de Administración NicePod
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white leading-none">
                        Knowledge <span className="text-primary italic">Vault</span>
                    </h1>
                    <p className="text-zinc-500 font-medium max-w-xl text-lg leading-relaxed">
                        Control master de la inteligencia colectiva. Aquí se destila, protege y audita la Verdad Permanente de la plataforma.
                    </p>
                </div>

                {/* MONITOR DE SABIDURÍA ACUMULADA */}
                <div className="flex gap-6">
                    <div className="p-6 bg-white/[0.03] border border-white/10 rounded-[2rem] flex items-center gap-5 backdrop-blur-xl shadow-2xl">
                        <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400 shadow-inner">
                            <Database size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Fuentes</p>
                            <p className="text-3xl font-black text-white leading-none">{sources.length}</p>
                        </div>
                    </div>
                    <div className="p-6 bg-white/[0.03] border border-white/10 rounded-[2rem] flex items-center gap-5 backdrop-blur-xl shadow-2xl">
                        <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-400 shadow-inner">
                            <Zap size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Hechos</p>
                            <p className="text-3xl font-black text-white leading-none">{totalFacts}</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* 4. PANEL OPERATIVO (Client Component) */}
            <VaultDashboardClient initialSources={sources} />

        </div>
    );
}