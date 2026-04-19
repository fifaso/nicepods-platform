/**
 * ARCHIVO: app/(platform)/(admin)/admin/vault/page.tsx
 * VERSIÓN: 8.3 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: Madrid Resonance Protocol V8.3
 * MISIÓN: Punto de entrada administrativo para la gestión del NicePodKnowledgeVault.
 * NIVEL DE INTEGRIDAD: 100% (Strategist Verified)
 */

import { listVaultSources, VaultKnowledgeSource } from "@/actions/vault-actions";
import { VaultDashboardClient } from "@/components/admin/vault-dashboard-client";
import { Database, Server, BrainCircuit, Activity } from "lucide-react";

/**
 * [CONFIGURACIÓN DE RED]: force-dynamic
 * La administración de la Bóveda no debe ser cacheada. Cada acceso del administrador
 * debe reflejar el estado exacto del índice HNSW en ese milisegundo.
 */
export const dynamic = 'force-dynamic';

/**
 * COMPONENTE SSR: VaultPage
 * Punto de entrada administrativo para la gestión del Knowledge Vault (NKV).
 */
export default async function VaultPage() {
  
  // 1. INVOCACIÓN DE LA ACCIÓN DE SOBERANÍA
  const administrativeResponse = await listVaultSources();
  
  // 2. EXTRACCIÓN SANEADA (Build Shield Sovereignty)
  const sourcesInventory: VaultKnowledgeSource[] = administrativeResponse.success && administrativeResponse.dataPayload
    ? administrativeResponse.dataPayload
    : [];

  // 3. TELEMETRÍA DE DENSIDAD (Cálculo de Chunks Atómicos)
  const totalAtomicFactsCountMagnitude = sourcesInventory.reduce((accumulator: number, currentSource: VaultKnowledgeSource) => {
    const chunkCount = currentSource.knowledgeChunksInventory?.[0]?.count || 0;
    return accumulator + chunkCount;
  }, 0);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      
      {/* 
          BLOQUE I: CABECERA DE MANDO
      */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-white flex items-center gap-3">
            <BrainCircuit className="text-primary" size={28} />
            Bóveda NKV
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 mt-2">
            NicePod Knowledge Vault • Radar Semántico 768d
          </p>
        </div>
        
        {/* Indicador de Estado del Motor */}
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full backdrop-blur-md">
          <Activity size={12} className="text-primary animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-widest text-primary">
            {administrativeResponse.success ? "Índice HNSW Estable" : "Alerta de Sincronía"}
          </span>
        </div>
      </div>

      {/* 
          BLOQUE II: HUD DE TELEMETRÍA DE ALTA DENSIDAD
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
         
         {/* Tarjeta: Fuentes Verificadas */}
         <div className="relative p-6 bg-[#050505] border border-white/5 rounded-[2rem] overflow-hidden group hover:border-primary/30 transition-colors">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
               <Database size={64} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
              Total Fuentes Base
            </p>
            <p className="text-5xl font-black text-white leading-none tabular-nums drop-shadow-md">
              {sourcesInventory.length}
            </p>
         </div>

         {/* Tarjeta: Hechos Atómicos (Vectores) */}
         <div className="relative p-6 bg-[#050505] border border-primary/20 rounded-[2rem] overflow-hidden group shadow-[0_0_30px_-10px_rgba(var(--primary),0.1)] hover:shadow-[0_0_40px_-10px_rgba(var(--primary),0.2)] transition-all">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity text-primary">
               <Server size={64} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Hechos Atómicos (Vectores)
            </p>
            <p className="text-5xl font-black text-white leading-none tabular-nums drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]">
              {totalAtomicFactsCountMagnitude}
            </p>
         </div>

         {/* Tarjeta: Reporte de Red (Fallback Error) */}
         {!administrativeResponse.success && (
           <div className="sm:col-span-2 lg:col-span-1 p-6 bg-red-950/20 border border-red-500/20 rounded-[2rem] flex flex-col justify-center">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500 mb-2">Fallo de Subsistema</p>
              <p className="text-xs text-red-400 font-medium">{administrativeResponse.exceptionInformation || "No se pudo establecer contacto con PostgreSQL."}</p>
           </div>
         )}
      </div>
      
      {/* 
          BLOQUE III: MOTOR DE GESTIÓN CLIENTE
      */}
      <div className="pt-6">
        <VaultDashboardClient initialSources={sourcesInventory} />
      </div>

    </div>
  );
}
