// lib/admin/actions.ts
"use server";

import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// [CORRECCIÓN] Lazy Initialization: No crear el cliente globalmente para evitar errores en Build Time
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

// Verificador de Seguridad
async function assertAdmin() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  
  // Usamos getUser() que valida contra Supabase Auth real
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) throw new Error("No autenticado");

  // Usamos el cliente admin para saltar RLS y ver el rol real en la DB
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
  await assertAdmin();
  const supabaseAdmin = getAdminClient();

  const { count: userCount } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true });
  const { count: podCount } = await supabaseAdmin.from('micro_pods').select('*', { count: 'exact', head: true });
  
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
  const supabaseAdmin = getAdminClient();

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
  const supabaseAdmin = getAdminClient();
  
  const { error } = await supabaseAdmin
    .from('user_usage')
    .update({ podcasts_created_this_month: 0 })
    .eq('user_id', userId);

  if (error) throw new Error("Error reseteando cuota");
  
  revalidatePath('/admin');
  return { success: true };
}