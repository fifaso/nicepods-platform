import { getAdminDashboardStats, getUsersList, getRecentFailedJobs } from "@/lib/admin/actions";
import { UsersTable } from "@/components/admin/users-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, AlertTriangle, Users } from "lucide-react";
import { FailedJobsDialog } from "@/components/admin/failed-jobs-dialog"; // Vamos a crear este pequeño componente

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const [stats, users, failedJobsList] = await Promise.all([
    getAdminDashboardStats(),
    getUsersList(),
    getRecentFailedJobs()
  ]);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Panel de Operaciones</h1>
            <p className="text-slate-400 text-sm">Gestión de la red boutique.</p>
        </div>
        <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                Sistema Operativo
            </span>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900 border-slate-800 text-slate-200 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Usuarios Totales</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.userCount}</div>
            <p className="text-xs text-slate-500">Miembros activos</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-slate-200 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Podcasts Generados</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.podCount}</div>
            <p className="text-xs text-slate-500">Contenido histórico</p>
          </CardContent>
        </Card>

        {/* ALERT CARD CON TRIGGER */}
        <FailedJobsDialog jobs={failedJobsList} count={stats.failedJobs} />
      </div>

      {/* USERS TABLE */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Gestión de Usuarios</h2>
        <UsersTable users={users} />
      </div>

    </div>
  );
}