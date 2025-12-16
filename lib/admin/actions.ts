"use server";

import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// Cliente con SUPERPODERES (Service Role) para operaciones administrativas
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Verificador de Seguridad: ¿Quien llama es realmente el Admin?
async function assertAdmin() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("No autenticado");

  // Verificamos el rol directamente contra la DB (más seguro que confiar en la sesión local)
  const { data: profile } = await supabaseAdmin
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
  await assertAdmin();

  // 1. Usuarios Totales
  const { count: userCount } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true });
  
  // 2. Podcasts Totales
  const { count: podCount } = await supabaseAdmin.from('micro_pods').select('*', { count: 'exact', head: true });
  
  // 3. Jobs Fallidos (Últimas 24h)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const { count: failedJobs } = await supabaseAdmin
    .from('podcast_creation_jobs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'failed')
    .gte('created_at', yesterday.toISOString());

  return { userCount, podCount, failedJobs };
}

export async function getUsersList() {
  await assertAdmin();

  // Obtenemos perfiles + su uso actual
  const { data: users, error } = await supabaseAdmin
    .from('profiles')
    .select(`
      id, full_name, email, avatar_url, created_at, role,
      user_usage ( podcasts_created_this_month, max_listening_minutes )
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw new Error(error.message);
  return users;
}

// --- ACCIONES DE GESTIÓN (GOD MODE) ---

export async function resetUserQuota(userId: string) {
  await assertAdmin();
  
  // Reseteamos el uso del mes a 0
  const { error } = await supabaseAdmin
    .from('user_usage')
    .update({ podcasts_created_this_month: 0 })
    .eq('user_id', userId);

  if (error) throw new Error("Error reseteando cuota");
  
  revalidatePath('/admin'); // Refresca la UI automáticamente
  return { success: true };
}