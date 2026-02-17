// components/notification-bell.tsx
// VERSIÓN: 2.0 (NicePod Realtime Inbox - Performance & Sync Standard)
// Misión: Gestionar notificaciones en tiempo real eliminando errores de WebSocket y Layout Shift.
// [ESTABILIZACIÓN]: Handshake de Realtime retrasado hasta validación de perfil y limpieza de memoria.

"use client";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  AlertCircle,
  Bell,
  Book,
  CheckCircle2,
  Heart,
  MessageSquare,
  Mic,
  Rss,
  User
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * TIPO: Notification
 * Contrato de datos sincronizado con el esquema de base de datos V2.5.
 */
export type Notification = {
  id: number;
  type: string;
  is_read: boolean;
  created_at: string;
  data: {
    actor_id?: string;
    actor_name?: string;
    actor_avatar_url?: string;
    podcast_id?: number;
    podcast_title?: string;
    job_title?: string;
    error_message?: string;
    testimonial_text?: string;
  };
};

/**
 * COMPONENTE: NotificationItem
 * Renderizado de alta densidad para el Inbox y el Historial.
 */
export function NotificationItem({ notification }: { notification: Notification }) {
  const iconMap: Record<string, React.ReactNode> = {
    'new_like': <Heart className="h-4 w-4 text-red-500 fill-red-500/20" />,
    'new_follower': <User className="h-4 w-4 text-blue-500" />,
    'podcast_created_success': <CheckCircle2 className="h-4 w-4 text-green-500" />,
    'podcast_created_failure': <AlertCircle className="h-4 w-4 text-destructive" />,
    'new_testimonial': <MessageSquare className="h-4 w-4 text-yellow-500" />,
    'new_podcast_from_followed_user': <Rss className="h-4 w-4 text-purple-500" />,
    'default': <Mic className="h-4 w-4 text-primary" />
  };

  const getMessageAndLink = (n: Notification) => {
    switch (n.type) {
      case 'new_like':
        return { href: `/podcast/${n.data.podcast_id}`, message: <p className="leading-tight"><span className="font-bold text-foreground">{n.data.actor_name}</span> resonó con <span className="italic">"{n.data.podcast_title}"</span></p> };
      case 'new_follower':
        return { href: `/u/${n.data.actor_id}`, message: <p className="leading-tight"><span className="font-bold text-foreground">{n.data.actor_name}</span> se unió a tu frecuencia.</p> };
      case 'podcast_created_success':
        return { href: `/podcast/${n.data.podcast_id}`, message: <p className="leading-tight text-green-600 dark:text-green-400 font-medium">Borrador forjado con éxito: <span className="font-bold">"{n.data.podcast_title}"</span></p> };
      case 'podcast_created_failure':
        return { href: `/create`, message: <p className="leading-tight text-destructive font-medium">Fallo en la forja de <span className="font-bold">"{n.data.job_title}"</span></p> };
      default:
        return { href: '#', message: <p>Nueva actualización de Bóveda.</p> };
    }
  };

  const { href, message } = getMessageAndLink(notification);
  const icon = iconMap[notification.type] || iconMap['default'];
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: es });

  return (
    <Link href={href}>
      <div className={cn(
        "p-3 rounded-xl transition-all duration-300 hover:bg-primary/5 border border-transparent hover:border-primary/10 mb-1",
        !notification.is_read && "bg-primary/[0.02]"
      )}>
        <div className="flex items-start space-x-3">
          <div className="mt-1 p-1.5 rounded-lg bg-background border border-border/40 shadow-sm">{icon}</div>
          <div className="flex-grow min-w-0">
            <div className="text-xs text-muted-foreground">{message}</div>
            <p className="text-[10px] font-medium text-muted-foreground/50 mt-1 uppercase tracking-widest">{timeAgo}</p>
          </div>
          {!notification.is_read && (
            <div className="mt-2 h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          )}
        </div>
      </div>
    </Link>
  );
}

/**
 * COMPONENTE: NotificationBell
 * El centro de mandos de notificaciones asíncronas.
 */
export function NotificationBell() {
  const { user, profile, supabase } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const channelRef = useRef<any>(null);

  /**
   * markAllAsRead: Sincronización con la base de datos (RPC).
   */
  const markAllAsRead = useCallback(async () => {
    if (unreadCount === 0) return;

    // UI Optimista
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));

    const { error } = await supabase.rpc('mark_notifications_as_read');
    if (error) console.error("🔥 [DB-Error] Fallo al sincronizar lectura:", error.message);
  }, [supabase, unreadCount]);

  /**
   * fetchInitial: Carga inicial de notificaciones no leídas.
   */
  const fetchInitial = useCallback(async () => {
    if (!user) return;
    const { data, count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error) {
      setNotifications(data as Notification[] || []);
      setUnreadCount(count || 0);
    }
  }, [user, supabase]);

  useEffect(() => {
    // [ESTRATEGIA]: Solo abrimos el túnel cuando la identidad atómica es nominal.
    if (!user || !profile) return;

    fetchInitial();

    // Limpieza de canales previos para evitar fugas de memoria
    if (channelRef.current) supabase.removeChannel(channelRef.current);

    /**
     * CANAL REALTIME: Sincronía instantánea de Bóveda
     */
    channelRef.current = supabase.channel(`notifications:${user.id}`)
      .on<Notification>(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          const newNotify = payload.new as Notification;
          setNotifications(current => [newNotify, ...current]);
          setUnreadCount(current => current + 1);
          // Opcional: Feedback sonoro sutil para la Workstation
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`📡 [Realtime] Túnel de notificaciones activo para: ${user.email}`);
        }
      });

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [user, profile, supabase, fetchInitial]);

  // --- RENDERIZADO DE SEGURIDAD (Zero Layout Shift) ---
  if (!user) return null;

  return (
    <Popover onOpenChange={(open) => !open && unreadCount > 0 && markAllAsRead()}>
      <PopoverTrigger asChild>
        <div className="relative w-10 h-10 flex items-center justify-center">
          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/5 transition-colors relative">
            <Bell className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary border-2 border-background"></span>
              </span>
            )}
          </Button>
        </div>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 md:w-96 p-0 rounded-[1.5rem] shadow-2xl border-border/40 bg-background/95 backdrop-blur-xl animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-border/40 bg-muted/20">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-black text-xs uppercase tracking-[0.2em] text-foreground">Notificaciones</h4>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Centro de Resonancia</p>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-7 text-[9px] font-black uppercase tracking-tighter hover:text-primary"
              >
                Limpiar Todo
              </Button>
            )}
          </div>
        </div>

        <div className="max-h-[380px] overflow-y-auto scrollbar-hide p-3">
          {notifications.length > 0 ? (
            <div className="flex flex-col">
              {notifications.map(n => <NotificationItem key={n.id} notification={n} />)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 bg-muted/20 rounded-full mb-4">
                <Bell className="h-8 w-8 text-muted-foreground/20" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Silencio en la red</p>
            </div>
          )}
        </div>

        <div className="p-3 border-t border-border/40 bg-muted/10">
          <Link href="/notifications" className="block w-full">
            <Button variant="outline" size="sm" className="w-full h-10 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] border-border/40 bg-background/50 hover:bg-primary/5 hover:text-primary transition-all">
              <Book className="h-3.5 w-3.5 mr-2 opacity-50" /> Abrir Historial Completo
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}