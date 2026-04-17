/**
 * ARCHIVO: app/(platform)/(admin)/admin/page.tsx
 * VERSIÓN: 6.0 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: MADRID RESONANCE V7.0
 *
 * Misión: Panel de Operaciones principal con integración de tipado soberano.
 * [REFORMA V6.0]: Sincronización axial completa con el contrato purificado V7.0.
 * Eliminación de fugas snake_case y alineación absoluta con la Doctrina ZAP.
 *
 * NIVEL DE INTEGRIDAD: 100% (Soberanía Nominal V7.0)
 */

import { 
  getAdminDashboardStats, 
  getUsersList, 
  getRecentFailedJobs, 
  getRecentPodcasts 
} from "@/lib/admin/actions";
import { UserManagementAdministrativeTable } from "@/components/admin/user-management-administrative-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users } from "lucide-react";
import { FailedJobsDialog, type FailedProductionJobSnapshot } from "@/components/admin/failed-jobs-dialog";
import { RecentPodcastsList } from "@/components/admin/recent-podcasts-list";
import { mapDatabasePodcastToSovereignPodcast } from "@/lib/podcast-utils";

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const [
    governanceStatsResponse,
    usersInventoryResponse,
    failedProductionJobsResponse,
    recentPodcastsResponse
  ] = await Promise.all([
    getAdminDashboardStats(),
    getUsersList(),
    getRecentFailedJobs(),
    getRecentPodcasts()
  ]);

  const statistics = governanceStatsResponse.payloadData || { userCountTotal: 0, podcastCountTotal: 0, failedJobsCountTotal: 0 };

  // Mapeo Soberano de los Inventarios
  const usersCollection = (usersInventoryResponse.payloadData || []).map((userRow: any) => ({
    ...userRow,
    identification: userRow.id,
    fullName: userRow.full_name,
    avatarUniformResourceLocator: userRow.avatar_url,
    reputationScoreValue: userRow.reputation_score,
    isVerifiedAccountStatus: userRow.is_verified,
    authorityRole: userRow.role,
    creationTimestamp: userRow.created_at,
    emailAddress: userRow.email,
    userUsageTelemetrics: userRow.user_usage ? {
        podcastsCreatedThisMonth: Array.isArray(userRow.user_usage)
            ? userRow.user_usage[0]?.podcasts_created_this_month
            : userRow.user_usage.podcasts_created_this_month
    } : undefined,
    podcastsCollection: (userRow.micro_pods || []).map((podRow: any) => mapDatabasePodcastToSovereignPodcast(podRow))
  }));

  const recentPodcastsCollection = (recentPodcastsResponse.payloadData || []).map((podRow: any) => mapDatabasePodcastToSovereignPodcast(podRow));

  const failedJobsCollection: FailedProductionJobSnapshot[] = (failedProductionJobsResponse.payloadData || []).map((jobRow: any) => ({
    identification: jobRow.id,
    creationTimestamp: jobRow.created_at,
    exceptionMessageInformation: jobRow.error_message,
    jobTitleTextContent: jobRow.job_title,
    operationalStatus: jobRow.status,
    authorProfile: jobRow.profiles ? {
        emailAddress: jobRow.profiles.email,
        fullName: jobRow.profiles.full_name,
        avatarUniformResourceLocator: jobRow.profiles.avatar_url
    } : null
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-white mb-1">Panel de Operaciones</h1>
            <p className="text-slate-400">Visión global y control de la red boutique.</p>
        </div>
        <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                Sistema Operativo V7.0
            </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <Card className="bg-slate-900 border-slate-800 text-slate-200 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Users className="w-24 h-24 text-blue-500" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-slate-400">Usuarios Totales</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">{statistics.userCountTotal}</div>
            <p className="text-xs text-slate-500 mt-1">Miembros activos en la comunidad</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-slate-200 shadow-lg relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10">
            <Activity className="w-24 h-24 text-green-500" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-slate-400">Podcasts Generados</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">{statistics.podcastCountTotal}</div>
            <p className="text-xs text-slate-500 mt-1">Contenido histórico creado</p>
          </CardContent>
        </Card>

        <FailedJobsDialog jobsCollection={failedJobsCollection} failedJobsCountTotal={statistics.failedJobsCountTotal} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        <div className="xl:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Gestión de Usuarios</h2>
            </div>
            <UserManagementAdministrativeTable usersCollection={usersCollection} />
        </div>

        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">El Pulso</h2>
                <span className="text-xs text-slate-500">Últimas 10 creaciones</span>
            </div>
            
            <div className="bg-slate-900/30 rounded-xl border border-slate-800 p-1">
                <RecentPodcastsList podcastsCollection={recentPodcastsCollection} />
            </div>
        </div>

      </div>
    </div>
  );
}
