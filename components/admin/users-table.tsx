"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RotateCcw, Search, Eye, PlayCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { resetUserQuota } from "@/lib/admin/actions";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UserTableProps {
  users: any[];
}

export function UsersTable({ users }: UserTableProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const safeUsers = Array.isArray(users) ? users : [];

  const handleResetQuota = async (userId: string) => {
    if(!confirm("¿Resetear cuota?")) return;
    setIsLoading(userId);
    try {
      await resetUserQuota(userId);
      toast({ title: "Éxito", description: "Cuota reseteada." });
    } catch (e) {
      toast({ title: "Error", description: "Fallo al resetear.", variant: "destructive" });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <>
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-sm font-medium text-slate-400">Últimos Registros</h3>
            <div className="text-xs text-slate-500">{safeUsers.length} usuarios</div>
        </div>
        
        {/* Tabla Responsive: Overflow-x auto para móviles */}
        <div className="overflow-x-auto">
            <Table>
            <TableHeader className="bg-slate-900/80">
                <TableRow className="border-slate-800 hover:bg-slate-900">
                <TableHead className="text-slate-400 w-[200px]">Identidad</TableHead>
                <TableHead className="text-slate-400 hidden md:table-cell">Rol</TableHead>
                <TableHead className="text-slate-400">Uso</TableHead>
                <TableHead className="text-slate-400 text-right">Control</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {safeUsers.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                        No hay usuarios o error de conexión.
                    </TableCell>
                </TableRow>
                ) : (
                safeUsers.map((user) => {
                    // Extracción segura de datos
                    const usageData = Array.isArray(user.user_usage) ? user.user_usage[0] : user.user_usage;
                    const usage = usageData?.podcasts_created_this_month || 0;
                    const limit = 3;
                    const isLimitReached = usage >= limit;

                    return (
                    <TableRow key={user.id} className="border-slate-800 hover:bg-slate-800/30 transition-colors">
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8 border border-slate-700">
                                <AvatarImage src={user.avatar_url} />
                                <AvatarFallback className="bg-slate-800 text-xs">{user.full_name?.substring(0,1)}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col max-w-[120px] md:max-w-xs">
                                    <span className="font-medium text-slate-200 text-sm truncate">{user.full_name || 'Anónimo'}</span>
                                    <span className="text-[10px] text-slate-500 truncate">{user.email}</span>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                            <Badge variant="outline" className="border-slate-700 text-slate-400 text-[10px]">
                                {user.role}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <div className="w-16 md:w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full ${isLimitReached ? 'bg-red-500' : 'bg-emerald-500'}`} 
                                    style={{ width: `${Math.min((usage / limit) * 100, 100)}%` }}
                                />
                                </div>
                                <span className="text-[10px] font-mono text-slate-400">{usage}/{limit}</span>
                            </div>
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                                <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800"
                                    onClick={() => setSelectedUser(user)}
                                    title="Ver Detalles"
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-slate-800"
                                    onClick={() => handleResetQuota(user.id)}
                                    disabled={isLoading === user.id}
                                    title="Resetear Cuota"
                                >
                                    <RotateCcw className={`h-4 w-4 ${isLoading === user.id ? 'animate-spin' : ''}`} />
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

      {/* PANEL LATERAL DE DETALLES (RAYOS X) */}
      <Sheet open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <SheetContent className="bg-slate-950 border-l-slate-800 text-slate-200 w-full sm:max-w-md">
            {selectedUser && (
                <>
                    <SheetHeader className="mb-6">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16 border-2 border-slate-700">
                                <AvatarImage src={selectedUser.avatar_url} />
                                <AvatarFallback>{selectedUser.full_name?.substring(0,1)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <SheetTitle className="text-white">{selectedUser.full_name}</SheetTitle>
                                <SheetDescription>{selectedUser.email}</SheetDescription>
                                <div className="flex gap-2 mt-2">
                                    <Badge className="bg-slate-800">{selectedUser.role}</Badge>
                                    <Badge variant="outline" className="border-slate-700 text-slate-400">
                                        ID: {selectedUser.id.substring(0,8)}...
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </SheetHeader>
                    
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Historial de Podcasts</h4>
                    <ScrollArea className="h-[60vh] pr-4">
                        <div className="space-y-3">
                            {selectedUser.micro_pods && selectedUser.micro_pods.length > 0 ? (
                                selectedUser.micro_pods.map((pod: any) => (
                                    <div key={pod.id} className="p-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <h5 className="font-semibold text-sm text-white line-clamp-1">{pod.title}</h5>
                                            <Badge 
                                                variant="secondary" 
                                                className={`text-[10px] ${pod.status === 'published' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}
                                            >
                                                {pod.status}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-slate-500">
                                            <span>{new Date(pod.created_at).toLocaleDateString()}</span>
                                            {pod.audio_url && (
                                                <a 
                                                    href={pod.audio_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-blue-400 hover:underline"
                                                >
                                                    <PlayCircle className="h-3 w-3" /> Escuchar
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-slate-500 border border-dashed border-slate-800 rounded-lg">
                                    <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
                                    <p>Sin contenido creado</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </>
            )}
        </SheetContent>
      </Sheet>
    </>
  );
}