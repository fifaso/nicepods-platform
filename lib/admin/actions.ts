/**
 * ARCHIVO: lib/admin/actions.ts
 * VERSIÓN: 4.0 (Madrid Resonance)
 * PROTOCOLO: Administrative Sovereignty
 * MISIÓN: Consolidación del núcleo administrativo con tipado soberano y trazabilidad total.
 * NIVEL DE INTEGRIDAD: CRITICAL
 */

"use server";

import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { Database } from '@/types/database.types';

/**
 * INTERFAZ: SovereignAdministrativeResponse
 * Contrato universal para respuestas de operaciones gubernamentales.
 */
export type SovereignAdministrativeResponse<T = null> = {
  success: boolean;
  message: string;
  data: T | null;
  error?: string;
  trace_identification?: string;
};

// --- INFRAESTRUCTURA SEGURA ---

/**
 * getAdministratorServiceRoleClient:
 * Inicialización de un cliente con privilegios de Service Role para bypass de RLS.
 */
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

/**
 * ensureAdministratorAuthority:
 * Valida la identidad y el rango del solicitante antes de permitir mutaciones.
 */
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

// --- LECTURA DE DATOS (DASHBOARD) ---

/**
 * getAdminDashboardStats:
 * Recupera los KPIs vitales del ecosistema NicePod.
 */
export async function getAdminDashboardStats(): Promise<SovereignAdministrativeResponse<{
  userCount: number;
  podCount: number;
  failedJobs: number;
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
      success: true,
      message: "Estadísticas de gobernanza sincronizadas.",
      data: {
        userCount: userCountRequest.count || 0,
        podCount: podcastCountRequest.count || 0,
        failedJobs: failedJobsCountRequest.count || 0
      }
    };
  } catch (governanceException: any) {
    console.error("🔥 [Admin-Action][Stats]:", governanceException.message);
    return {
      success: false,
      message: "Fallo al recuperar estadísticas del Dashboard.",
      error: governanceException.message,
      data: { userCount: 0, podCount: 0, failedJobs: 0 }
    };
  }
}

/**
 * getUsersList:
 * Recupera el inventario de curadores con telemetría de uso.
 */
export async function getUsersList(): Promise<SovereignAdministrativeResponse<any[]>> {
  try {
    const { administratorServiceRoleClient } = await ensureAdministratorAuthority();

    const { data: administratorUsersInventory, error: fetchError } = await administratorServiceRoleClient
      .from('profiles')
      .select(`
        id, full_name, email, avatar_url, role, created_at,
        user_usage ( podcasts_created_this_month ),
        micro_pods ( id, title, status, created_at, audio_url )
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (fetchError) throw fetchError;

    return {
      success: true,
      message: "Censo de usuarios recuperado con éxito.",
      data: administratorUsersInventory || []
    };
  } catch (governanceException: any) {
    console.error("🔥 [Admin-Action][Users-List]:", governanceException.message);
    return {
      success: false,
      message: "Error al sincronizar el inventario de usuarios.",
      error: governanceException.message,
      data: []
    };
  }
}

/**
 * getRecentPodcasts:
 * Recupera las crónicas más recientes para auditoría editorial.
 */
export async function getRecentPodcasts(): Promise<SovereignAdministrativeResponse<any[]>> {
  try {
    const { administratorServiceRoleClient } = await ensureAdministratorAuthority();

    const { data: recentPodcastsInventory, error: fetchError } = await administratorServiceRoleClient
      .from('micro_pods')
      .select(`
          id, title, status, created_at, audio_url, is_featured,
          profiles ( full_name, email, avatar_url )
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (fetchError) throw fetchError;

    return {
      success: true,
      message: "Pulso editorial sincronizado.",
      data: recentPodcastsInventory || []
    };
  } catch (governanceException: any) {
    console.error("🔥 [Admin-Action][Recent-Pods]:", governanceException.message);
    return {
      success: false,
      message: "No se pudo recuperar el pulso editorial.",
      error: governanceException.message,
      data: []
    };
  }
}

/**
 * getRecentFailedJobs:
 * Auditoría de fallos en el pipeline de producción.
 */
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
      success: true,
      message: "Auditoría de fallos completada.",
      data: failedProductionJobs || []
    };
  } catch (governanceException: any) {
    console.error("🔥 [Admin-Action][Failed-Jobs]:", governanceException.message);
    return {
      success: false,
      message: "Error en la recuperación de logs de fallo.",
      error: governanceException.message,
      data: []
    };
  }
}

// --- ACCIONES DE GESTIÓN (MUTACIONES) ---

/**
 * resetUserQuota:
 * Restablece la capacidad de producción de un usuario.
 */
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
      success: true,
      message: "Cuota de producción restablecida correctamente.",
      data: null
    };
  } catch (governanceException: any) {
    console.error("🔥 [Admin-Action][Reset-Quota]:", governanceException.message);
    return {
      success: false,
      message: "Fallo al restablecer la cuota del usuario.",
      error: governanceException.message,
      data: null
    };
  }
}

/**
 * toggleFeaturedStatus:
 * Modifica el estado de visibilidad destacada de un activo.
 */
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
      success: true,
      message: "Estado de destaque editorial actualizado.",
      data: null
    };
  } catch (governanceException: any) {
    console.error("🔥 [Admin-Action][Toggle-Featured]:", governanceException.message);
    return {
      success: false,
      message: "No se pudo actualizar el estado destacado del podcast.",
      error: governanceException.message,
      data: null
    };
  }
}
