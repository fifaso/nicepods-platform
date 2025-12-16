import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, Users, LayoutDashboard, LogOut } from 'lucide-react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 1. Verificación de Seguridad en el Servidor
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // EL PORTERO: Si no es admin, redirige al home público.
  if (profile?.role !== 'admin') {
    redirect('/'); 
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex font-sans">
      {/* SIDEBAR ADMIN MINIMALISTA */}
      <aside className="w-64 border-r border-slate-800 flex flex-col fixed h-full bg-slate-950 z-50">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-red-500/20 p-2 rounded-lg">
            <ShieldAlert className="h-6 w-6 text-red-500" />
          </div>
          <span className="font-bold text-lg tracking-tight">Torre de Control</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 bg-slate-900 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Link>
          <button disabled className="flex w-full items-center gap-3 px-4 py-3 text-slate-500 cursor-not-allowed rounded-lg text-sm font-medium">
            <Users className="h-4 w-4" /> Usuarios (Pronto)
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link href="/" className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300">
            <LogOut className="h-3 w-3" /> Volver a NicePod Público
          </Link>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}