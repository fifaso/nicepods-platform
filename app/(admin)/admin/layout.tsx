// app/(admin)/admin/layout.tsx
import { AdminNav } from '@/components/admin/admin-nav'; // <--- Importamos el nuevo componente
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  // 1. Verificación de Seguridad (Server Side)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col md:flex-row font-sans">

      {/* NAVEGACIÓN RESPONSIVA (Maneja Móvil y Desktop internamente) */}
      <AdminNav />

      {/* CONTENIDO PRINCIPAL */}
      {/* [CLAVE]: md:ml-64 solo aplica en escritorio. En móvil ocupa todo el ancho. */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
        {children}
      </main>

    </div>
  );
}