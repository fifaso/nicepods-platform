/**
 * ARCHIVO: lib/admin/actions.ts
 * VERSIÓN: 7.0 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: MADRID RESONANCE V7.0
 *
 * MISIÓN: Consolidación del núcleo administrativo con tipado soberano.
 * [REFORMA V7.0]: Sincronización axial completa con el contrato purificado V7.0.
 * Eliminación de fugas snake_case y alineación absoluta con la Doctrina ZAP.
 *
 * NIVEL DE INTEGRIDAD: 100% (Soberanía Nominal V7.0)
 */

"use server";

import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { Database } from '@/types/database.types';
import { nicepodLog } from '@/lib/utils';

/**
 * INTERFAZ: SovereignAdministrativeResponse
 * Contrato universal para respuestas de operaciones gubernamentales.
 */
export type SovereignAdministrativeResponse<T = null> = {
  isOperationSuccessful: boolean;
  responseStatusMessage: string;
  payloadData: T | null;
  exceptionMessageInformation?: string;
  traceIdentification?: string;
};

function getAdministratorServiceRoleClient(): SupabaseClient<Database> {
  const uniformResourceLocator = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!uniformResourceLocator || !serviceRoleKey) {
    throw new Error("Faltan credenciales de Supabase Administrator (Service Role)");
  }

  return createClient<Database>(uniformResourceLocator, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

async function ensureAdministratorAuthority() {
  const supabase = createServerClient();

  const { data: { user }, error: authenticationError } = await supabase.auth.getUser();
  if (authenticationError || !user) {
    throw new Error("AUTENTICACION_REQUERIDA: Sesión administrativa no detectada.");
  }

  const administratorServiceRoleClient = getAdministratorServiceRoleClient();
  const { data: administratorProfile, error: profileError } = await administratorServiceRoleClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || administratorProfile?.role !== 'admin') {
    throw new Error("ACCESO_DENEGADO: Se requiere autoridad de Administrador.");
  }

  return { administratorUser: user, administratorServiceRoleClient };
}

export async function getAdminDashboardStats(): Promise<SovereignAdministrativeResponse<{
  userCountTotal: number;
  podcastCountTotal: number;
  failedJobsCountTotal: number;
}>> {
  try {
    const { administratorServiceRoleClient } = await ensureAdministratorAuthority();

    const [userCountRequest, podcastCountRequest, failedJobsCountRequest] = await Promise.all([
      administratorServiceRoleClient.from('profiles').select('*', { count: 'exact', head: true }),
      administratorServiceRoleClient.from('micro_pods').select('*', { count: 'exact', head: true }),
      administratorServiceRoleClient.from('podcast_creation_jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'failed')
    ]);

    return {
      isOperationSuccessful: true,
      responseStatusMessage: "Estadísticas de gobernanza sincronizadas.",
      payloadData: {
        userCountTotal: userCountRequest.count || 0,
        podcastCountTotal: podcastCountRequest.count || 0,
        failedJobsCountTotal: failedJobsCountRequest.count || 0
      }
    };
  } catch (governanceException: any) {
    nicepodLog("🔥 [Admin-Action][Stats]:", governanceException.message, 'exceptionInformation');
    return {
      isOperationSuccessful: false,
      responseStatusMessage: "Fallo al recuperar estadísticas del Dashboard.",
      exceptionMessageInformation: governanceException.message,
      payloadData: { userCountTotal: 0, podcastCountTotal: 0, failedJobsCountTotal: 0 }
    };
  }
}

export async function getUsersList(): Promise<SovereignAdministrativeResponse<any[]>> {
  try {
    const { administratorServiceRoleClient } = await ensureAdministratorAuthority();

    const { data: administratorUsersInventory, error: fetchError } = await administratorServiceRoleClient
      .from('profiles')
      .select(`
        id, full_name, email, avatar_url, role, created_at,
        user_usage ( podcasts_created_this_month ),
        micro_pods ( * )
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (fetchError) throw fetchError;

    return {
      isOperationSuccessful: true,
      responseStatusMessage: "Censo de usuarios recuperado con éxito.",
      payloadData: administratorUsersInventory || []
    };
  } catch (governanceException: any) {
    nicepodLog("🔥 [Admin-Action][Users-List]:", governanceException.message, 'exceptionInformation');
    return {
      isOperationSuccessful: false,
      responseStatusMessage: "Error al sincronizar el inventario de usuarios.",
      exceptionMessageInformation: governanceException.message,
      payloadData: []
    };
  }
}

export async function getRecentPodcasts(): Promise<SovereignAdministrativeResponse<any[]>> {
  try {
    const { administratorServiceRoleClient } = await ensureAdministratorAuthority();

    const { data: recentPodcastsInventory, error: fetchError } = await administratorServiceRoleClient
      .from('micro_pods')
      .select(`
          *,
          profiles ( * )
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (fetchError) throw fetchError;

    return {
      isOperationSuccessful: true,
      responseStatusMessage: "Pulso editorial sincronizado.",
      payloadData: recentPodcastsInventory || []
    };
  } catch (governanceException: any) {
    nicepodLog("🔥 [Admin-Action][Recent-Pods]:", governanceException.message, 'exceptionInformation');
    return {
      isOperationSuccessful: false,
      responseStatusMessage: "No se pudo recuperar el pulso editorial.",
      exceptionMessageInformation: governanceException.message,
      payloadData: []
    };
  }
}

export async function getRecentFailedJobs(): Promise<SovereignAdministrativeResponse<any[]>> {
  try {
    const { administratorServiceRoleClient } = await ensureAdministratorAuthority();

    const { data: failedProductionJobs, error: fetchError } = await administratorServiceRoleClient
      .from('podcast_creation_jobs')
      .select(`
          id, created_at, error_message, job_title, status,
          profiles:user_id ( email, full_name, avatar_url )
      `)
      .eq('status', 'failed')
      .order('created_at', { ascending: false })
      .limit(20);

    if (fetchError) throw fetchError;

    return {
      isOperationSuccessful: true,
      responseStatusMessage: "Auditoría de fallos completada.",
      payloadData: failedProductionJobs || []
    };
  } catch (governanceException: any) {
    nicepodLog("🔥 [Admin-Action][Failed-Jobs]:", governanceException.message, 'exceptionInformation');
    return {
      isOperationSuccessful: false,
      responseStatusMessage: "Error en la recuperación de logs de fallo.",
      exceptionMessageInformation: governanceException.message,
      payloadData: []
    };
  }
}

export async function resetUserQuota(userIdentification: string): Promise<SovereignAdministrativeResponse> {
  try {
    const { administratorServiceRoleClient } = await ensureAdministratorAuthority();

    const { error: updateError } = await administratorServiceRoleClient
      .from('user_usage')
      .upsert({
        user_id: userIdentification,
        podcasts_created_this_month: 0,
        updated_at: new Date().toISOString()
      });

    if (updateError) throw updateError;

    revalidatePath('/admin');

    return {
      isOperationSuccessful: true,
      responseStatusMessage: "Cuota de producción restablecida correctamente.",
      payloadData: null
    };
  } catch (governanceException: any) {
    nicepodLog("🔥 [Admin-Action][Reset-Quota]:", governanceException.message, 'exceptionInformation');
    return {
      isOperationSuccessful: false,
      responseStatusMessage: "Fallo al restablecer la cuota del usuario.",
      exceptionMessageInformation: governanceException.message,
      payloadData: null
    };
  }
}

export async function toggleFeaturedStatus(
  podcastIdentification: number,
  currentFeaturedStatus: boolean
): Promise<SovereignAdministrativeResponse> {
  try {
    const { administratorServiceRoleClient } = await ensureAdministratorAuthority();

    const { error: updateError } = await administratorServiceRoleClient
      .from('micro_pods')
      .update({ is_featured: !currentFeaturedStatus })
      .eq('id', podcastIdentification);

    if (updateError) throw updateError;

    revalidatePath('/admin');

    return {
      isOperationSuccessful: true,
      responseStatusMessage: "Estado de destaque editorial actualizado.",
      payloadData: null
    };
  } catch (governanceException: any) {
    nicepodLog("🔥 [Admin-Action][Toggle-Featured]:", governanceException.message, 'exceptionInformation');
    return {
      isOperationSuccessful: false,
      responseStatusMessage: "No se pudo actualizar el estado destacado del podcast.",
      exceptionMessageInformation: governanceException.message,
      payloadData: null
    };
  }
}
