// app/(admin)/admin/page.tsx
// VERSIÓN: 2.0 (Full Cockpit: Operations + Editorial Control)

import { 
  getAdminDashboardStats, 
  getUsersList, 
  getRecentFailedJobs, 
  getRecentPodcasts 
} from "@/lib/admin/actions";
import { UsersTable } from "@/components/admin/users-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users } from "lucide-react";
import { FailedJobsDialog } from "@/components/admin/failed-jobs-dialog";
import { RecentPodcastsList } from "@/components/admin/recent-podcasts-list";

// Forzar renderizado dinámico para ver datos frescos siempre
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  // Carga de datos paralela para máxima velocidad
  const [stats, users, failedJobsList, recentPodcasts] = await Promise.all([
    getAdminDashboardStats(),
    getUsersList(),
    getRecentFailedJobs(),
    getRecentPodcasts()
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* 1. HEADER ESTRATÉGICO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-white mb-1">Panel de Operaciones</h1>
            <p className="text-slate-400">Visión global y control de la red boutique.</p>
        </div>
        <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                Sistema Operativo
            </span>
        </div>
      </div>

      {/* 2. TARJETAS KPI (SIGNOS VITALES) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* KPI: Usuarios */}
        <Card className="bg-slate-900 border-slate-800 text-slate-200 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Users className="w-24 h-24 text-blue-500" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-slate-400">Usuarios Totales</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">{stats.userCount}</div>
            <p className="text-xs text-slate-500 mt-1">Miembros activos en la comunidad</p>
          </CardContent>
        </Card>

        {/* KPI: Producción */}
        <Card className="bg-slate-900 border-slate-800 text-slate-200 shadow-lg relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10">
            <Activity className="w-24 h-24 text-green-500" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-slate-400">Podcasts Generados</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">{stats.podCount}</div>
            <p className="text-xs text-slate-500 mt-1">Contenido histórico creado</p>
          </CardContent>
        </Card>

        {/* KPI: Salud/Alertas (Componente Interactivo) */}
        <FailedJobsDialog jobs={failedJobsList} count={stats.failedJobs} />
      </div>

      {/* 3. ZONA DE GESTIÓN (GRID ASIMÉTRICO) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: CRM DE USUARIOS (2/3 del ancho) */}
        <div className="xl:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Gestión de Usuarios</h2>
            </div>
            {/* Tabla Inteligente con Buscador y Reset */}
            <UsersTable users={users} />
        </div>

        {/* COLUMNA DERECHA: EL PULSO EDITORIAL (1/3 del ancho) */}
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">El Pulso</h2>
                <span className="text-xs text-slate-500">Últimas 10 creaciones</span>
            </div>
            
            {/* Lista Interactiva para Curaduría (Destacar/Play) */}
            <div className="bg-slate-900/30 rounded-xl border border-slate-800 p-1">
                <RecentPodcastsList podcasts={recentPodcasts} />
            </div>
        </div>

      </div>
    </div>
  );
}