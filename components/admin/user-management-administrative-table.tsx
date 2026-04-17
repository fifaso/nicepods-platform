/**
 * ARCHIVO: components/admin/user-management-administrative-table.tsx
 * VERSIÓN: 5.0 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: MADRID RESONANCE V7.0
 *
 * Misión: Terminal de gestión administrativa para control de usuarios y cuotas.
 * [REFORMA V5.0]: Sincronización axial completa con el contrato purificado V7.0.
 * Eliminación de fugas snake_case y alineación absoluta con la Doctrina ZAP.
 *
 * Nivel de Integridad: 100% (Soberanía Nominal V7.0)
 */

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
import { cn, getSafeAsset, formatTime } from "@/lib/utils";
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
import { ProfileData } from "@/types/profile";
import { PodcastWithProfile } from "@/types/podcast";

/**
 * AdministrativeUserSnapshot: Identidad enriquecida para el panel de gestión.
 */
interface AdministrativeUserSnapshot {
  identification: string; username: string; fullName: string | null; avatarUniformResourceLocator: string | null; reputationScoreValue: number; isVerifiedAccountStatus: boolean; authorityRole: string; creationTimestamp: string; userUsageTelemetrics?: {
    podcastsCreatedThisMonth: number;
  };
  podcastsCollection: PodcastWithProfile[];
  emailAddress?: string | null;
}

interface UserManagementAdministrativeTableComponentProperties {
    usersCollection: AdministrativeUserSnapshot[];
}

/**
 * UserManagementAdministrativeTable: Componente principal de auditoría y gestión.
 */
export function UserManagementAdministrativeTable({ usersCollection }: UserManagementAdministrativeTableComponentProperties) {
    const { toast } = useToast();

    // ESTADOS OPERATIVOS
    const [loadingUserIdentification, setLoadingUserIdentification] = useState<string | null>(null);
    const [selectedUserSnapshot, setSelectedUserSnapshot] = useState<AdministrativeUserSnapshot | null>(null);
    const [searchQueryText, setSearchQueryText] = useState<string>("");

    const filteredUsersCollection = useMemo(() => {
        const safeUsers = Array.isArray(usersCollection) ? usersCollection : [];

        if (!searchQueryText.trim()) return safeUsers;

        const lowerCaseSearchTerm = searchQueryText.toLowerCase();
        return safeUsers.filter((userItem) => {
            const nameMatch = userItem.fullName?.toLowerCase().includes(lowerCaseSearchTerm);
            const emailMatch = userItem.emailAddress?.toLowerCase().includes(lowerCaseSearchTerm);
            const usernameMatch = userItem.username?.toLowerCase().includes(lowerCaseSearchTerm);
            return nameMatch || emailMatch || usernameMatch;
        });
    }, [usersCollection, searchQueryText]);

    const handleResetQuotaAction = useCallback(async (userIdentification: string) => {
        if (!confirm("¿Confirmas el reseteo de cuota para este usuario?")) return;

        setLoadingUserIdentification(userIdentification);
        try {
            const resonanceResponse = await resetUserQuota(userIdentification);
            if (resonanceResponse.isOperationSuccessful) {
                toast({
                    title: "Cuota Restablecida",
                    description: "El usuario ahora puede crear nuevos podcasts.",
                    variant: "default"
                });
            } else {
                throw new Error(resonanceResponse.responseStatusMessage);
            }
        } catch (hardwareException: any) {
            toast({
                title: "Falla de Restablecimiento",
                description: hardwareException.message,
                variant: "destructive"
            });
        } finally {
            setLoadingUserIdentification(null);
        }
    }, [toast]);

    return (
        <>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-sm group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Localizar Voyager en la malla..."
                            value={searchQueryText}
                            onChange={(e) => setSearchQueryText(e.target.value)}
                            className="pl-10 bg-muted/20 border-border/40 rounded-xl h-12 text-sm font-medium"
                        />
                    </div>

                    <Badge variant="outline" className="h-10 px-6 rounded-xl border-border/40 bg-muted/10 text-muted-foreground font-black uppercase text-[10px] tracking-widest hidden md:flex">
                        <UsersIcon className="mr-2 h-3.5 w-3.5" />
                        {filteredUsersCollection.length} NODOS ACTIVOS
                    </Badge>
                </div>

                <div className="border border-border/40 rounded-[2.5rem] overflow-hidden bg-card/20 shadow-2xl backdrop-blur-md">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="border-border/40 hover:bg-transparent">
                                <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 pl-8">Voyager</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest">Estado ADN</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest">Producción (Mes)</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-right pr-8">Comandos</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsersCollection.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-48 text-center text-muted-foreground font-medium uppercase tracking-widest text-[10px] italic">
                                        Sin coincidencias en el radar.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUsersCollection.map((userItem) => {
                                    const createdCountValue = userItem.userUsageTelemetrics?.podcastsCreatedThisMonth || 0;
                                    return (
                                        <TableRow key={userItem.identification} className="border-border/20 hover:bg-white/5 transition-colors group">
                                            <TableCell className="py-5 pl-8">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-12 w-12 border-2 border-border/40 group-hover:border-primary/40 transition-all shadow-xl">
                                                        <AvatarImage src={userItem.avatarUniformResourceLocator || ''} />
                                                        <AvatarFallback className="bg-[#050505] text-primary font-black text-xs">
                                                            {userItem.username.substring(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-sm text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">
                                                            {userItem.fullName || 'Voyager Anónimo'}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground font-mono">
                                                            @{userItem.username}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 text-[8px] font-black uppercase tracking-widest">
                                                            {userItem.authorityRole}
                                                        </Badge>
                                                        {userItem.isVerifiedAccountStatus && <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-bold">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(userItem.creationTimestamp).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-2 rounded-full bg-muted/40 overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary"
                                                            style={{ width: `${Math.min(100, (createdCountValue / 10) * 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className="font-mono text-xs font-black text-foreground">
                                                        {createdCountValue}<span className="text-muted-foreground opacity-30 mx-1">/</span>10
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-8">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => setSelectedUserSnapshot(userItem)}
                                                        className="h-9 w-9 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => handleResetQuotaAction(userItem.identification)}
                                                        disabled={loadingUserIdentification === userItem.identification}
                                                        className="h-9 w-9 rounded-xl hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all"
                                                    >
                                                        <RotateCcw className={cn("h-4 w-4", loadingUserIdentification === userItem.identification && "animate-spin")} />
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

            <Sheet open={!!selectedUserSnapshot} onOpenChange={(openStatus) => !openStatus && setSelectedUserSnapshot(null)}>
                <SheetContent className="bg-background/95 backdrop-blur-3xl border-l-border/40 text-foreground w-full sm:max-w-xl p-0 overflow-hidden rounded-l-[3rem]">
                    {selectedUserSnapshot && (
                        <div className="flex flex-col h-full">
                            <div className="p-8 border-b border-border/40 bg-muted/10">
                                <SheetHeader>
                                    <div className="flex items-center gap-6 text-left">
                                        <div className="relative h-20 w-20 rounded-[1.5rem] overflow-hidden border-2 border-primary/20 shadow-2xl">
                                            <Image
                                                src={getSafeAsset(selectedUserSnapshot.avatarUniformResourceLocator, 'avatar')}
                                                alt={selectedUserSnapshot.fullName || 'Curador'}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <SheetTitle className="text-2xl font-black uppercase tracking-tighter">
                                                {selectedUserSnapshot.fullName || 'Curador Sin Nombre'}
                                            </SheetTitle>
                                            <SheetDescription className="text-sm font-medium text-muted-foreground">
                                                {selectedUserSnapshot.emailAddress}
                                            </SheetDescription>
                                            <div className="flex gap-2 pt-2">
                                                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/10 text-[9px] font-black uppercase">
                                                    UID: {selectedUserSnapshot.identification.substring(0, 8)}
                                                </Badge>
                                                <Badge variant="outline" className="text-[9px] font-black uppercase">
                                                    {selectedUserSnapshot.authorityRole}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </SheetHeader>
                            </div>

                            <div className="flex-1 overflow-hidden flex flex-col p-8 pt-6">
                                <h4 className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                                    <Mic className="h-4 w-4 text-primary" /> Historial de Crónicas
                                </h4>

                                <ScrollArea className="flex-1 pr-4">
                                    <div className="space-y-4 pb-10">
                                        {selectedUserSnapshot.podcastsCollection && selectedUserSnapshot.podcastsCollection.length > 0 ? (
                                            selectedUserSnapshot.podcastsCollection.map((podcastItem) => (
                                                <div
                                                    key={podcastItem.identification}
                                                    className="p-5 rounded-[2rem] bg-card/40 border border-border/40 hover:border-primary/30 transition-all shadow-sm group"
                                                >
                                                    <div className="flex justify-between items-start mb-3">
                                                        <h5 className="font-black text-sm text-foreground uppercase tracking-tight line-clamp-2 leading-tight">
                                                            {podcastItem.titleTextContent}
                                                        </h5>
                                                        <Badge
                                                            className={cn(
                                                                "text-[8px] font-black uppercase px-2",
                                                                podcastItem.publicationStatus === 'published' ? "bg-emerald-500/10 text-emerald-500" : "bg-orange-500/10 text-orange-500"
                                                            )}
                                                        >
                                                            {podcastItem.publicationStatus === 'published' ? 'LIVE' : 'DRAFT'}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-border/10">
                                                        <span className="text-[10px] font-bold text-muted-foreground">
                                                            {new Date(podcastItem.creationTimestamp).toLocaleDateString()}
                                                        </span>
                                                        {podcastItem.audioUniformResourceLocator && (
                                                            <a
                                                                href={podcastItem.audioUniformResourceLocator}
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

                            <div className="p-8 border-t border-border/40 bg-muted/5 flex justify-end">
                                <Button
                                    variant="ghost"
                                    className="rounded-xl font-black text-[10px] uppercase tracking-widest px-8"
                                    onClick={() => setSelectedUserSnapshot(null)}
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
