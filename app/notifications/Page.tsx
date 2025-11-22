// app/notifications/page.tsx
// La página de servidor para el historial completo de notificaciones.

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NotificationHistoryClient } from "./notification-history-client";
// Reutilizamos el tipo 'Notification' que definiremos como exportable en notification-bell.tsx
import type { Notification } from "@/components/notification-bell";

export default async function NotificationsPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login?redirect=/notifications');
  }

  // Obtenemos TODAS las notificaciones del usuario.
  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error al cargar el historial de notificaciones:", error);
  }

  return (
    <div className="container mx-auto max-w-3xl py-8 md:py-12 px-4">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-primary">Historial de Notificaciones</h1>
        <p className="text-lg text-muted-foreground mt-2">Todas tus actualizaciones, en un solo lugar.</p>
      </header>
      <NotificationHistoryClient initialNotifications={notifications as Notification[] || []} />
    </div>
  );
}