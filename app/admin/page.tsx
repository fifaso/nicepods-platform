// app/admin/page.tsx

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, Bot, Hourglass, AlertCircle } from 'lucide-react';
import { Database } from '@/types/supabase';
import Link from 'next/link';

// ========================================================================
// 1. DEFINICIÓN DE TIPOS
// ========================================================================

type Job = Database['public']['Tables']['podcast_creation_jobs']['Row'];
type Metric = {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
};
type AdminDashboardData = {
  metrics: Metric[];
  recentJobs: Job[];
};

// ========================================================================
// 2. LÓGICA DE OBTENCIÓN DE DATOS
// ========================================================================

async function getAdminDashboardData(supabase: ReturnType<typeof createClient>): Promise<AdminDashboardData> {
  // Las políticas de RLS basadas en 'custom claims' garantizan que solo un admin pueda ejecutar esto.
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Ejecutamos las consultas de métricas en paralelo para máxima eficiencia.
  const [
    { count: totalUsers },
    { count: podcastsToday },
    { count: pendingJobs },
    { count: failedJobsToday }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('micro_pods').select('*', { count: 'exact', head: true }).gte('created_at', twentyFourHoursAgo),
    supabase.from('podcast_creation_jobs').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('podcast_creation_jobs').select('*', { count: 'exact', head: true }).eq('status', 'failed').gte('created_at', twentyFourHoursAgo)
  ]);

  const { data: recentJobs, error: jobsError } = await supabase
    .from('podcast_creation_jobs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);
    
  if (jobsError) console.error("Error fetching recent jobs:", jobsError);

  const metrics: Metric[] = [
    { title: 'Usuarios Totales', value: totalUsers ?? 0, icon: Users, color: 'text-blue-500' },
    { title: 'Podcasts Creados (24h)', value: podcastsToday ?? 0, icon: Bot, color: 'text-green-500' },
    { title: 'Trabajos en Cola', value: pendingJobs ?? 0, icon: Hourglass, color: 'text-yellow-500' },
    { title: 'Trabajos Fallidos (24h)', value: failedJobsToday ?? 0, icon: AlertCircle, color: 'text-red-500' },
  ];

  return { metrics, recentJobs: recentJobs || [] };
}

// ========================================================================
// 3. SUB-COMPONENTES DE UI
// ========================================================================

function MetricCard({ metric }: { metric: Metric }) {
  const Icon = metric.icon;
  return (
    <Card className="bg-card/50 backdrop-blur-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
        <Icon className={`h-4 w-4 ${metric.color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{metric.value}</div>
      </CardContent>
    </Card>
  );
}

function RecentJobsTable({ jobs }: { jobs: Job[] }) {
  const getStatusBadge = (status: Job['status']) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary">Pendiente</Badge>;
      case 'processing': return <Badge className="bg-blue-500/20 text-blue-700 hover:bg-blue-500/30 border-blue-400/50">Procesando</Badge>;
      case 'completed': return <Badge className="bg-green-500/20 text-green-700 hover:bg-green-500/30 border-green-400/50">Completado</Badge>;
      case 'failed': return <Badge variant="destructive">Fallido</Badge>;
      default: return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-lg">
      <CardHeader><CardTitle>Actividad Reciente</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Título del Trabajo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="w-[30%]">Mensaje de Error</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.length > 0 ? jobs.map(job => (
              <TableRow key={job.id}>
                <TableCell className="font-medium">{job.job_title || "Sin título"}</TableCell>
                <TableCell>{getStatusBadge(job.status)}</TableCell>
                <TableCell>{new Date(job.created_at).toLocaleString()}</TableCell>
                <TableCell className="text-xs text-destructive truncate max-w-xs">{job.error_message}</TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No hay actividad reciente para mostrar.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ========================================================================
// 4. COMPONENTE PRINCIPAL DE LA PÁGINA
// ========================================================================

export default async function AdminDashboardPage() {
  const supabase = createClient(cookies());

  const { data: { user } } = await supabase.auth.getUser();

  // --- GUARDIÁN DE SEGURIDAD DEFINITIVO ---
  // Redirige si no hay usuario O si el 'claim' del JWT no es 'admin'.
  // Esta es la forma más rápida y segura, ya que no requiere una consulta a la BD.
  if (!user || user.app_metadata?.user_role !== 'admin') {
    redirect('/create');
  }

  const { metrics, recentJobs } = await getAdminDashboardData(supabase);

  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard de Administrador</h1>
        <p className="text-muted-foreground">Una vista centralizada de la salud y actividad de la plataforma.</p>
      </header>
      
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {metrics.map(metric => <MetricCard key={metric.title} metric={metric} />)}
      </section>

      <section>
        <RecentJobsTable jobs={recentJobs} />
      </section>
    </div>
  );
}