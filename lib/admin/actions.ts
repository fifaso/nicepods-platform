// lib/admin/actions.ts
// VERSIÓN: 3.0 (Data Enrichment & Resilience)

"use server";

import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Faltan credenciales de Admin");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function assertAdmin() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  
  const adminClient = getAdminClient();
  const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single();
  
  if (profile?.role !== 'admin') throw new Error("Acceso Denegado");
  return user;
}

// --- LECTURA MEJORADA ---

export async function getAdminDashboardStats() {
  try {
    await assertAdmin();
    const supabase = getAdminClient();

    // Consultas paralelas
    const [userReq, podReq, jobsReq] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('micro_pods').select('*', { count: 'exact', head: true }),
        supabase.from('podcast_creation_jobs').select('*', { count: 'exact', head: true }).eq('status', 'failed')
    ]);

    return { 
        userCount: userReq.count || 0, 
        podCount: podReq.count || 0, 
        failedJobs: jobsReq.count || 0 
    };
  } catch (e) {
    console.error("Admin Stats Error:", e);
    return { userCount: 0, podCount: 0, failedJobs: 0 };
  }
}

export async function getUsersList() {
  try {
    await assertAdmin();
    const supabase = getAdminClient();

    // [MEJORA]: Traemos Perfiles + Uso + Últimos 5 Podcasts (para la vista detalle)
    // El left join es implícito en Supabase si la relación existe.
    const { data: users, error } = await supabase
      .from('profiles')
      .select(`
        id, full_name, email, avatar_url, role, created_at,
        user_usage ( podcasts_created_this_month ),
        micro_pods ( id, title, status, created_at, audio_url )
      `)
      .order('created_at', { ascending: false })
      .limit(50); // Paginación implícita de 50 para velocidad

    if (error) {
        console.error("Supabase Error getUsersList:", error);
        return [];
    }
    
    return users || [];
  } catch (error) {
    console.error("Server Action Error getUsersList:", error);
    return [];
  }
}

// Nueva función para ver los errores
export async function getRecentFailedJobs() {
  await assertAdmin();
  const supabase = getAdminClient();
  
  const { data } = await supabase
    .from('podcast_creation_jobs')
    .select('id, created_at, error_message, job_title')
    .eq('status', 'failed')
    .order('created_at', { ascending: false })
    .limit(10);
    
  return data || [];
}

// --- ACCIONES ---

export async function resetUserQuota(userId: string) {
  await assertAdmin();
  const supabase = getAdminClient();
  
  // Usamos upsert por si el registro no existe
  const { error } = await supabase
    .from('user_usage')
    .upsert({ user_id: userId, podcasts_created_this_month: 0, updated_at: new Date().toISOString() });

  if (error) throw new Error(error.message);
  revalidatePath('/admin');
  return { success: true };
}