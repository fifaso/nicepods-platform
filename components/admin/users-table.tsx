"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { resetUserQuota } from "@/lib/admin/actions"; 

interface UserTableProps {
  users: any[];
}

export function UsersTable({ users }: UserTableProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleResetQuota = async (userId: string) => {
    if(!confirm("¿Confirmas resetear la cuota de este usuario a 0?")) return;
    setIsLoading(userId);
    try {
      await resetUserQuota(userId);
      toast({ title: "Éxito", description: "Cuota reseteada correctamente." });
    } catch (e) {
      toast({ title: "Error", description: "No se pudo realizar la acción.", variant: "destructive" });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-900">
          <TableRow className="border-slate-800 hover:bg-slate-900">
            <TableHead className="text-slate-400">Usuario</TableHead>
            <TableHead className="text-slate-400">Rol</TableHead>
            <TableHead className="text-slate-400">Cuota (Mes)</TableHead>
            <TableHead className="text-slate-400 text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            // Accedemos de forma segura a los datos del join (array)
            const usageData = Array.isArray(user.user_usage) ? user.user_usage[0] : user.user_usage;
            const usage = usageData?.podcasts_created_this_month || 0;
            const limit = 3; 
            const isLimitReached = usage >= limit;

            return (
              <TableRow key={user.id} className="border-slate-800 hover:bg-slate-800/50">
                <TableCell className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback className="bg-slate-700 text-slate-300">{user.full_name?.substring(0,2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-200">{user.full_name || 'Sin nombre'}</span>
                    <span className="text-xs text-slate-500">{user.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-xs bg-slate-800 text-slate-300 hover:bg-slate-700">
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${isLimitReached ? 'bg-red-500' : 'bg-green-500'}`} 
                        style={{ width: `${Math.min((usage / limit) * 100, 100)}%` }}
                      />
                    </div>
                    <span className={`text-xs font-mono ${isLimitReached ? 'text-red-400' : 'text-slate-400'}`}>
                        {usage}/{limit}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-7 border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
                      onClick={() => handleResetQuota(user.id)}
                      disabled={isLoading === user.id}
                    >
                      <RotateCcw className={`h-3 w-3 mr-1 ${isLoading === user.id ? 'animate-spin' : ''}`} /> 
                      Reset
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}