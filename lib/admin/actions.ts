// lib/admin/actions.ts
// VERSIÓN: 5.0 (Full Admin Suite: Operations, CRM & Editorial Power)

"use server";

import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// --- INFRAESTRUCTURA SEGURA ---

// Inicialización diferida para evitar errores en Build Time si faltan env vars
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Faltan credenciales de Supabase Admin (Service Role)");
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Verificador de Seguridad: ¿Quien llama es realmente el Admin?
async function assertAdmin() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  
  // 1. Validar sesión de usuario
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("No autenticado");

  // 2. Validar rol contra la DB usando cliente Admin (saltando RLS de usuario)
  const adminClient = getAdminClient();
  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    throw new Error("Acceso Denegado: No tienes permisos de Administrador.");
  }
  return user;
}

// --- LECTURA DE DATOS (DASHBOARD) ---

export async function getAdminDashboardStats() {
  try {
    await assertAdmin();
    const supabaseAdmin = getAdminClient();

    // Consultas paralelas para velocidad
    const [userReq, podReq, jobsReq] = await Promise.all([
        supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('micro_pods').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('podcast_creation_jobs')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'failed')
            // Filtro opcional de tiempo: .gte('created_at', yesterday.toISOString())
    ]);

    return { 
        userCount: userReq.count || 0, 
        podCount: podReq.count || 0, 
        failedJobs: jobsReq.count || 0 
    };
  } catch (e) {
    console.error("Error stats:", e);
    // Retorno seguro para no romper la UI
    return { userCount: 0, podCount: 0, failedJobs: 0 };
  }
}

export async function getUsersList() {
  try {
    await assertAdmin();
    const supabaseAdmin = getAdminClient();

    // Traemos datos enriquecidos: Perfil + Uso + Podcasts recientes
    const { data: users, error } = await supabaseAdmin
      .from('profiles')
      .select(`
        id, full_name, email, avatar_url, role, created_at,
        user_usage ( podcasts_created_this_month ),
        micro_pods ( id, title, status, created_at, audio_url )
      `)
      .order('created_at', { ascending: false })
      .limit(50); // Paginación implícita

    if (error) {
        console.error("Error getUsersList:", error);
        return [];
    }
    
    return users || [];
  } catch (error) {
    console.error("Crash getUsersList:", error);
    return [];
  }
}

// Feed de Actividad ("El Pulso") - [ACTUALIZADO: Incluye is_featured]
export async function getRecentPodcasts() {
  await assertAdmin();
  const supabaseAdmin = getAdminClient();
  
  const { data } = await supabaseAdmin
    .from('micro_pods')
    .select(`
        id, title, status, created_at, audio_url, is_featured,
        profiles ( full_name, email, avatar_url )
    `)
    .order('created_at', { ascending: false })
    .limit(10);
    
  return data || [];
}

// Auditoría de Errores con Contexto de Usuario
export async function getRecentFailedJobs() {
  await assertAdmin();
  const supabaseAdmin = getAdminClient();
  
  const { data } = await supabaseAdmin
    .from('podcast_creation_jobs')
    .select(`
        id, created_at, error_message, job_title, status,
        profiles:user_id ( email, full_name, avatar_url )
    `)
    .eq('status', 'failed')
    .order('created_at', { ascending: false })
    .limit(20);
    
  return data || [];
}

// --- ACCIONES DE GESTIÓN (MUTACIONES) ---

export async function resetUserQuota(userId: string) {
  await assertAdmin();
  const supabaseAdmin = getAdminClient();
  
  // Reseteamos el uso del mes a 0 usando upsert por seguridad
  const { error } = await supabaseAdmin
    .from('user_usage')
    .upsert({ 
        user_id: userId, 
        podcasts_created_this_month: 0, 
        updated_at: new Date().toISOString() 
    });

  if (error) throw new Error("Error reseteando cuota: " + error.message);
  
  revalidatePath('/admin'); // Actualiza la tabla inmediatamente
  return { success: true };
}

// [NUEVO] Acción Editorial: Destacar/Ocultar Podcast
export async function toggleFeaturedStatus(podcastId: number, currentStatus: boolean) {
  await assertAdmin();
  const supabaseAdmin = getAdminClient();

  const { error } = await supabaseAdmin
    .from('micro_pods')
    .update({ is_featured: !currentStatus })
    .eq('id', podcastId);

  if (error) throw new Error("No se pudo actualizar el estado destacado");
  
  revalidatePath('/admin');
  return { success: true };
}