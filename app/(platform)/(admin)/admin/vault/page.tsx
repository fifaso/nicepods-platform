
// app/admin/vault/page.tsx

// app/(platform)/(admin)/admin/vault/page.tsx

import { listVaultSources } from "@/actions/vault-actions";
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
  // listVaultSources ahora devuelve un VaultActionResponse: { success, message, data, error }
  const response = await listVaultSources();
  
  // 2. EXTRACCIÓN SANEADA (El Fix para TS2339 y TS2740)
  // Si la petición tuvo éxito y contiene data, usamos esa data. De lo contrario, array vacío.
  // Esto garantiza que el método .reduce() y .length() jamás colapsen el servidor.
  const sources: any[] = response.success && Array.isArray(response.data) ? response.data : [];

  // 3. TELEMETRÍA DE DENSIDAD (Cálculo de Chunks Atómicos)
  // Iteramos sobre las fuentes para sumar la cantidad de vectores indexados.
  const totalFacts = sources.reduce((acc: number, curr: any) => {
    // La consulta SQL inyecta el conteo en un array [{count: X}]
    const chunkCount = curr.knowledge_chunks?.[0]?.count || 0;
    return acc + chunkCount;
  }, 0);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      
      {/* 
          BLOQUE I: CABECERA DE MANDO
          Título y estado de la red de inteligencia.
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
            {response.success ? "Índice HNSW Estable" : "Alerta de Sincronía"}
          </span>
        </div>
      </div>

      {/* 
          BLOQUE II: HUD DE TELEMETRÍA DE ALTA DENSIDAD
          Muestra el volumen de capital intelectual almacenado.
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
              {sources.length}
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
              {totalFacts}
            </p>
         </div>

         {/* Tarjeta: Reporte de Red (Fallback Error) */}
         {!response.success && (
           <div className="sm:col-span-2 lg:col-span-1 p-6 bg-red-950/20 border border-red-500/20 rounded-[2rem] flex flex-col justify-center">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500 mb-2">Fallo de Subsistema</p>
              <p className="text-xs text-red-400 font-medium">{response.error || "No se pudo establecer contacto con PostgreSQL."}</p>
           </div>
         )}
      </div>
      
      {/* 
          BLOQUE III: MOTOR DE GESTIÓN CLIENTE
          Pasamos el inventario limpio (Array de sources) al componente interactivo 
          que maneja la tabla, los borrados y la inyección manual.
      */}
      <div className="pt-6">
        <VaultDashboardClient initialSources={sources} />
      </div>

    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Resolución TS2339/TS2740: Al aislar `const sources = response.data` garantizamos 
 *    que los métodos de Array (.reduce y .length) operen sobre el tipo correcto.
 * 2. Cero Pestañeos de Error: Si la DB falla, `sources` es `[]`, lo que previene que 
 *    el `VaultDashboardClient` reciba 'undefined' y rompa la hidratación en el cliente.
 * 3. Estética Industrial: Se añadieron iconos de lucide-react y variables de Tailwind
 *    para dar una sensación de centro de mando físico.
 */