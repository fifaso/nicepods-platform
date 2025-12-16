import { getAdminDashboardStats, getUsersList } from "@/lib/admin/actions";
import { UsersTable } from "@/components/admin/users-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, AlertTriangle, Users } from "lucide-react";

// Forzar renderizado dinámico para ver datos frescos siempre
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const [stats, users] = await Promise.all([
    getAdminDashboardStats(),
    getUsersList()
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Panel de Operaciones</h1>
        <p className="text-slate-400">Estado del sistema y gestión de la red boutique.</p>
      </div>

      {/* KPI CARDS */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-slate-900 border-slate-800 text-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Usuarios Totales</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.userCount || 0}</div>
            <p className="text-xs text-slate-500">Miembros en la plataforma</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Podcasts Generados</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.podCount || 0}</div>
            <p className="text-xs text-slate-500">Contenido histórico</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Alertas (24h)</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{stats.failedJobs || 0}</div>
            <p className="text-xs text-slate-500">Jobs fallidos hoy</p>
          </CardContent>
        </Card>
      </div>

      {/* TABLA DE USUARIOS */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Gestión de Usuarios</h2>
        <UsersTable users={users || []} />
      </div>

    </div>
  );
}