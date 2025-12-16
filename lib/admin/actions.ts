// lib/admin/actions.ts
// VERSIÓN: 2.0 (Error Handling & Safe Returns)

"use server";

import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    // [LOG CRÍTICO] Esto aparecerá en los logs de Vercel si falta la variable
    console.error("❌ CRITICAL: Faltan credenciales de Supabase Admin (SUPABASE_SERVICE_ROLE_KEY)");
    throw new Error("Configuración de servidor incompleta");
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

async function assertAdmin() {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
    
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error("No autenticado");

    const adminClient = getAdminClient();
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      throw new Error("Acceso Denegado");
    }
    return user;
  } catch (e) {
    console.error("⛔ Auth Error en Admin:", e);
    throw e; // Relanzamos para que el Layout maneje la redirección
  }
}

// --- LECTURA DE DATOS SEGURA ---

export async function getAdminDashboardStats() {
  try {
    await assertAdmin();
    const supabaseAdmin = getAdminClient();

    const [userReq, podReq, jobsReq] = await Promise.all([
        supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('micro_pods').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('podcast_creation_jobs')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'failed')
            // Filtro simple para evitar errores de fecha si falla
    ]);

    return { 
        userCount: userReq.count || 0, 
        podCount: podReq.count || 0, 
        failedJobs: jobsReq.count || 0 
    };
  } catch (error) {
    console.error("❌ Error fetching stats:", error);
    // Retornamos ceros para que la UI cargue aunque sea vacía
    return { userCount: 0, podCount: 0, failedJobs: 0 };
  }
}

export async function getUsersList() {
  try {
    await assertAdmin();
    const supabaseAdmin = getAdminClient();

    const { data: users, error } = await supabaseAdmin
      .from('profiles')
      .select(`
        id, full_name, email, avatar_url, created_at, role,
        user_usage ( podcasts_created_this_month )
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
        console.error("❌ Error SQL getUsersList:", error);
        return [];
    }
    
    return users || [];
  } catch (error) {
    console.error("❌ Error general getUsersList:", error);
    return [];
  }
}

// --- ACCIONES ---

export async function resetUserQuota(userId: string) {
  try {
    await assertAdmin();
    const supabaseAdmin = getAdminClient();
    
    const { error } = await supabaseAdmin
      .from('user_usage')
      .update({ podcasts_created_this_month: 0 })
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
    
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error("❌ Error resetUserQuota:", error);
    throw new Error("No se pudo resetear la cuota");
  }
}