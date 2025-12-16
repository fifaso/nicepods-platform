"use client";

import { useState, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RotateCcw, Eye, PlayCircle, Search, Calendar, Mic } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { resetUserQuota } from "@/lib/admin/actions";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UserTableProps {
  users: any[];
}

export function UsersTable({ users }: UserTableProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const safeUsers = Array.isArray(users) ? users : [];

  // Filtrado y Ordenamiento en Cliente (Suficiente para <1000 users)
  const filteredUsers = useMemo(() => {
    return safeUsers.filter(user => 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [safeUsers, searchTerm]);

  const handleResetQuota = async (userId: string) => {
    if(!confirm("¿Resetear cuota?")) return;
    setIsLoading(userId);
    try {
      await resetUserQuota(userId);
      toast({ title: "Éxito", description: "Cuota reseteada." });
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <>
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
        {/* BARRA DE HERRAMIENTAS */}
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                    <Input 
                        placeholder="Buscar usuario..." 
                        className="pl-9 h-9 w-64 bg-slate-950 border-slate-700 text-slate-200 focus:border-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <div className="text-xs text-slate-500 font-mono">
                Total: <span className="text-slate-300">{filteredUsers.length}</span>
            </div>
        </div>
        
        <div className="overflow-x-auto">
            <Table>
            <TableHeader className="bg-slate-900/80">
                <TableRow className="border-slate-800 hover:bg-slate-900">
                <TableHead className="text-slate-400 w-[250px]">Usuario</TableHead>
                <TableHead className="text-slate-400 text-center">Registro</TableHead>
                <TableHead className="text-slate-400 text-center">Podcasts</TableHead>
                <TableHead className="text-slate-400">Cuota</TableHead>
                <TableHead className="text-slate-400 text-right">Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredUsers.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                        No se encontraron usuarios.
                    </TableCell>
                </TableRow>
                ) : (
                filteredUsers.map((user) => {
                    const usageData = Array.isArray(user.user_usage) ? user.user_usage[0] : user.user_usage;
                    const usage = usageData?.podcasts_created_this_month || 0;
                    const totalPodcasts = user.micro_pods?.length || 0;
                    const limit = 3;
                    const isLimitReached = usage >= limit;

                    return (
                    <TableRow key={user.id} className="border-slate-800 hover:bg-slate-800/30">
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9 border border-slate-700">
                                <AvatarImage src={user.avatar_url} />
                                <AvatarFallback className="bg-slate-800 text-xs">{user.email?.substring(0,2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="font-medium text-slate-200 text-sm">{user.full_name || 'Sin Nombre'}</span>
                                    <span className="text-[11px] text-slate-500">{user.email}</span>
                                    {user.role === 'admin' && <span className="text-[9px] text-blue-400 font-bold uppercase mt-0.5">Admin</span>}
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="text-center">
                            <div className="flex flex-col items-center justify-center text-xs text-slate-400">
                                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(user.created_at).toLocaleDateString()}</span>
                            </div>
                        </TableCell>
                        <TableCell className="text-center">
                            <Badge variant="secondary" className="bg-slate-800 text-slate-300 border-slate-700">
                                {totalPodcasts}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden">
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
                                <Button size="sm" variant="ghost" onClick={() => setSelectedUser(user)} title="Ver Ficha">
                                    <Eye className="h-4 w-4 text-slate-400 hover:text-white" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => handleResetQuota(user.id)} disabled={isLoading === user.id} title="Resetear">
                                    <RotateCcw className={`h-4 w-4 text-slate-400 hover:text-red-400 ${isLoading === user.id ? 'animate-spin' : ''}`} />
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

      {/* FICHA DETALLADA (SHEET) */}
      <Sheet open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <SheetContent className="bg-slate-950 border-l-slate-800 text-slate-200 w-full sm:max-w-lg">
            {selectedUser && (
                <>
                    <SheetHeader className="mb-6 border-b border-slate-800 pb-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16 border-2 border-slate-700">
                                <AvatarImage src={selectedUser.avatar_url} />
                                <AvatarFallback>{selectedUser.email?.substring(0,1)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <SheetTitle className="text-white text-xl">{selectedUser.full_name}</SheetTitle>
                                <SheetDescription className="text-slate-400">{selectedUser.email}</SheetDescription>
                                <div className="flex gap-2 mt-2">
                                    <Badge variant="outline" className="border-slate-700 text-xs">ID: {selectedUser.id}</Badge>
                                </div>
                            </div>
                        </div>
                    </SheetHeader>
                    
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Mic className="h-4 w-4" /> Historial de Creaciones
                    </h4>
                    <ScrollArea className="h-[60vh] pr-4">
                        <div className="space-y-3">
                            {selectedUser.micro_pods && selectedUser.micro_pods.length > 0 ? (
                                selectedUser.micro_pods.map((pod: any) => (
                                    <div key={pod.id} className="p-4 rounded-lg bg-slate-900/50 border border-slate-800 hover:border-slate-600 transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <h5 className="font-semibold text-sm text-white line-clamp-2">{pod.title}</h5>
                                            <Badge 
                                                className={`text-[9px] capitalize ${pod.status === 'published' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}
                                            >
                                                {pod.status.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-800/50">
                                            <span className="text-[10px] text-slate-500">{new Date(pod.created_at).toLocaleDateString()}</span>
                                            {pod.audio_url && (
                                                <a 
                                                    href={pod.audio_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors bg-blue-950/30 px-2 py-1 rounded"
                                                >
                                                    <PlayCircle className="h-3 w-3" /> Reproducir
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 text-slate-600 bg-slate-900/20 rounded-lg border border-dashed border-slate-800">
                                    <Mic className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">Sin podcasts creados aún.</p>
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