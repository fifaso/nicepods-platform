// components/admin/users-table.tsx
// VERSIÓN: 1.2 (Strict Admin Master - Fixed Imports & Case Sensitivity)
// Misión: Terminal de gestión administrativa para control de usuarios y cuotas.

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle
} from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { resetUserQuota } from "@/lib/admin/actions";
import { cn, getSafeAsset } from "@/lib/utils";
import {
    Calendar,
    Eye,
    Mic,
    PlayCircle,
    RotateCcw,
    Search,
    ShieldCheck,
    Users as UsersIcon
} from "lucide-react";
import Image from "next/image";
import { useCallback, useMemo, useState } from "react";

/**
 * UserTableProps: Contrato de datos para la tabla administrativa.
 */
interface UserTableProps {
    users: any[];
}

/**
 * UsersTable: Componente principal de auditoría y gestión.
 */
export function UsersTable({ users }: UserTableProps) {
    const { toast } = useToast();

    // ESTADOS OPERATIVOS
    const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");

    /**
     * [CONTROL LÓGICO]: filteredUsers
     * Filtra la lista de usuarios en base al término de búsqueda (Nombre, Email o Handle).
     * Memoizado para evitar cálculos costosos en re-renders de UI.
     */
    const filteredUsers = useMemo(() => {
        const safeUsers = Array.isArray(users) ? users : [];

        if (!searchTerm.trim()) return safeUsers;

        const lowerTerm = searchTerm.toLowerCase();
        return safeUsers.filter((user) => {
            const nameMatch = user.full_name?.toLowerCase().includes(lowerTerm);
            const emailMatch = user.email?.toLowerCase().includes(lowerTerm);
            const usernameMatch = user.username?.toLowerCase().includes(lowerTerm);
            return nameMatch || emailMatch || usernameMatch;
        });
    }, [users, searchTerm]);

    /**
     * handleResetQuota
     * Invoca la Server Action para resetear los límites de un usuario específico.
     */
    const handleResetQuota = useCallback(async (userId: string) => {
        if (!confirm("¿Confirmas el reseteo de cuota para este usuario?")) return;

        setLoadingUserId(userId);
        try {
            await resetUserQuota(userId);
            toast({
                title: "Cuota Restablecida",
                description: "El usuario ahora puede crear nuevos podcasts.",
                variant: "default"
            });
        } catch (error: any) {
            console.error("🔥 [Admin-Error]:", error.message);
            toast({
                title: "Error de Sistema",
                description: "No se pudo actualizar la cuota.",
                variant: "destructive"
            });
        } finally {
            setLoadingUserId(null);
        }
    }, [toast]);

    return (
        <>
            <div className="rounded-2xl border border-border/40 bg-card/30 backdrop-blur-xl overflow-hidden shadow-2xl animate-in fade-in duration-500">

                {/* BARRA DE HERRAMIENTAS (Search & Stats) */}
                <div className="p-5 border-b border-border/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/20">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                            <Input
                                placeholder="Buscar curador..."
                                className="pl-10 h-11 bg-background/50 border-border/40 rounded-xl"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                        <UsersIcon className="h-3.5 w-3.5" />
                        Registros: <span className="text-foreground">{filteredUsers.length}</span>
                    </div>
                </div>

                {/* TABLA DE USUARIOS */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/40">
                            <TableRow className="border-border/40 hover:bg-transparent">
                                <TableHead className="text-[10px] font-black uppercase tracking-wider text-muted-foreground py-4">Usuario / Identidad</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-wider text-muted-foreground text-center">Registro</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-wider text-muted-foreground text-center">Publicaciones</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Estado de Cuota</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-wider text-muted-foreground text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-24 text-muted-foreground italic">
                                        No hay señales en esta frecuencia.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUsers.map((user) => {
                                    // Normalización del objeto de uso mensual
                                    const usageData = Array.isArray(user.user_usage) ? user.user_usage[0] : user.user_usage;
                                    const usage = usageData?.podcasts_created_this_month || 0;
                                    const totalPodcasts = user.micro_pods?.length || 0;
                                    const limit = 3;
                                    const progressPercent = Math.min((usage / limit) * 100, 100);

                                    return (
                                        <TableRow key={user.id} className="border-border/20 hover:bg-white/5 transition-colors group">
                                            <TableCell>
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-10 w-10 border border-border/40 shadow-sm group-hover:border-primary/40 transition-all">
                                                        <AvatarImage src={getSafeAsset(user.avatar_url, 'avatar')} />
                                                        <AvatarFallback className="bg-primary/10 text-primary font-black text-[10px]">
                                                            {user.full_name?.substring(0, 2).toUpperCase() || 'ID'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="font-black text-foreground text-sm truncate tracking-tight uppercase">
                                                            {user.full_name || 'Anónimo'}
                                                        </span>
                                                        <span className="text-[11px] text-muted-foreground truncate font-medium">
                                                            {user.email}
                                                        </span>
                                                        {user.role === 'admin' && (
                                                            <div className="flex items-center gap-1 mt-1">
                                                                <ShieldCheck className="h-3 w-3 text-blue-500" />
                                                                <span className="text-[8px] text-blue-500 font-black uppercase tracking-tighter">Acceso Admin</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex flex-col items-center justify-center text-xs font-bold text-muted-foreground/80">
                                                    <span className="flex items-center gap-1.5">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(user.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="outline" className="bg-background/40 border-border/40 font-black text-[10px]">
                                                    {totalPodcasts} PODS
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden border border-border/20">
                                                        <div
                                                            className={cn(
                                                                "h-full rounded-full transition-all duration-1000",
                                                                usage >= limit ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-primary"
                                                            )}
                                                            style={{ width: `${progressPercent}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">
                                                        {usage} / {limit} Misión
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => setSelectedUser(user)}
                                                        className="h-9 w-9 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => handleResetQuota(user.id)}
                                                        disabled={loadingUserId === user.id}
                                                        className="h-9 w-9 rounded-xl hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all"
                                                    >
                                                        <RotateCcw className={cn("h-4 w-4", loadingUserId === user.id && "animate-spin")} />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* DETALLE DEL USUARIO (Sheet Drawer) */}
            <Sheet open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
                <SheetContent className="bg-background/95 backdrop-blur-3xl border-l-border/40 text-foreground w-full sm:max-w-xl p-0 overflow-hidden rounded-l-[3rem]">
                    {selectedUser && (
                        <div className="flex flex-col h-full">
                            {/* HEADER DE FICHA */}
                            <div className="p-8 border-b border-border/40 bg-muted/10">
                                <SheetHeader>
                                    <div className="flex items-center gap-6 text-left">
                                        <div className="relative h-20 w-20 rounded-[1.5rem] overflow-hidden border-2 border-primary/20 shadow-2xl">
                                            <Image
                                                src={getSafeAsset(selectedUser.avatar_url, 'avatar')}
                                                alt={selectedUser.full_name || 'Curador'}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <SheetTitle className="text-2xl font-black uppercase tracking-tighter">
                                                {selectedUser.full_name || 'Curador Sin Nombre'}
                                            </SheetTitle>
                                            <SheetDescription className="text-sm font-medium text-muted-foreground">
                                                {selectedUser.email}
                                            </SheetDescription>
                                            <div className="flex gap-2 pt-2">
                                                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/10 text-[9px] font-black uppercase">
                                                    UID: {selectedUser.id.substring(0, 8)}
                                                </Badge>
                                                <Badge variant="outline" className="text-[9px] font-black uppercase">
                                                    {selectedUser.role}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </SheetHeader>
                            </div>

                            {/* LISTADO DE PODCASTS DEL USUARIO */}
                            <div className="flex-1 overflow-hidden flex flex-col p-8 pt-6">
                                <h4 className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                                    <Mic className="h-4 w-4 text-primary" /> Historial de Crónicas
                                </h4>

                                <ScrollArea className="flex-1 pr-4">
                                    <div className="space-y-4 pb-10">
                                        {selectedUser.micro_pods && selectedUser.micro_pods.length > 0 ? (
                                            selectedUser.micro_pods.map((pod: any) => (
                                                <div
                                                    key={pod.id}
                                                    className="p-5 rounded-[2rem] bg-card/40 border border-border/40 hover:border-primary/30 transition-all shadow-sm group"
                                                >
                                                    <div className="flex justify-between items-start mb-3">
                                                        <h5 className="font-black text-sm text-foreground uppercase tracking-tight line-clamp-2 leading-tight">
                                                            {pod.title}
                                                        </h5>
                                                        <Badge
                                                            className={cn(
                                                                "text-[8px] font-black uppercase px-2",
                                                                pod.status === 'published' ? "bg-emerald-500/10 text-emerald-500" : "bg-orange-500/10 text-orange-500"
                                                            )}
                                                        >
                                                            {pod.status === 'published' ? 'LIVE' : 'DRAFT'}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-border/10">
                                                        <span className="text-[10px] font-bold text-muted-foreground">
                                                            {new Date(pod.created_at).toLocaleDateString()}
                                                        </span>
                                                        {pod.audio_url && (
                                                            <a
                                                                href={pod.audio_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-4 py-2 rounded-xl"
                                                            >
                                                                <PlayCircle className="h-3 w-3" /> Audio
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-20 bg-muted/5 rounded-[2rem] border border-dashed border-border/40">
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Sin actividad narrativa</p>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </div>

                            {/* BOTÓN DE CIERRE */}
                            <div className="p-8 border-t border-border/40 bg-muted/5 flex justify-end">
                                <Button
                                    variant="ghost"
                                    className="rounded-xl font-black text-[10px] uppercase tracking-widest px-8"
                                    onClick={() => setSelectedUser(null)}
                                >
                                    Cerrar Panel
                                </Button>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </>
    );
}