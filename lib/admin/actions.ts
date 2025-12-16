// lib/admin/actions.ts
// VERSIÓN: 4.0 (Data Enrichment: User Context in Errors & Robust User List)

"use server";

import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// ... (getAdminClient y assertAdmin se mantienen igual, no los repetiré para ahorrar espacio) ...
// ASEGÚRATE DE MANTENER LAS FUNCIONES getAdminClient y assertAdmin QUE YA TIENES.

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

// --- NUEVAS CONSULTAS POTENCIADAS ---

export async function getAdminDashboardStats() {
  try {
    await assertAdmin();
    const supabase = getAdminClient();

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
    return { userCount: 0, podCount: 0, failedJobs: 0 };
  }
}

export async function getUsersList() {
  try {
    await assertAdmin();
    const supabase = getAdminClient();

    // [MEJORA]: Traemos datos y ordenamos por fecha de creación (Nuevos primero)
    // El user_usage puede ser null, lo manejaremos en el frontend.
    const { data: users, error } = await supabase
      .from('profiles')
      .select(`
        id, full_name, email, avatar_url, role, created_at,
        user_usage ( podcasts_created_this_month ),
        micro_pods ( id, status, created_at )
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
        console.error("Error getUsersList:", error);
        return [];
    }
    
    return users || [];
  } catch (error) {
    return [];
  }
}

export async function getRecentFailedJobs() {
  await assertAdmin();
  const supabase = getAdminClient();
  
  // [MEJORA]: Join con Profiles para saber QUIÉN falló
  const { data } = await supabase
    .from('podcast_creation_jobs')
    .select(`
        id, created_at, error_message, job_title, status,
        profiles:user_id ( email, full_name, avatar_url )
    `)
    .eq('status', 'failed')
    .order('created_at', { ascending: false })
    .limit(20); // Aumentamos límite para mejor contexto
    
  return data || [];
}

// ... (resetUserQuota se mantiene igual) ...
export async function resetUserQuota(userId: string) {
  await assertAdmin();
  const supabase = getAdminClient();
  
  const { error } = await supabase
    .from('user_usage')
    .upsert({ user_id: userId, podcasts_created_this_month: 0, updated_at: new Date().toISOString() });

  if (error) throw new Error(error.message);
  revalidatePath('/admin');
  return { success: true };
}