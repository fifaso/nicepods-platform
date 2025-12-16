"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, XCircle, User, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function FailedJobsDialog({ jobs, count }: { jobs: any[], count: number }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="bg-slate-900 border-slate-800 text-slate-200 shadow-lg cursor-pointer hover:border-red-500/50 transition-colors group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 group-hover:text-red-400 transition-colors">Alertas (24h)</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{count}</div>
            <p className="text-xs text-slate-500">Jobs fallidos (Clic para auditar)</p>
          </CardContent>
        </Card>
      </DialogTrigger>
      
      <DialogContent className="bg-slate-950 border-slate-800 text-slate-200 sm:max-w-2xl">
        <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
                <XCircle className="h-5 w-5" /> Auditoría de Fallos
            </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[400px] mt-4 pr-4">
            <div className="space-y-4">
                {jobs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                        <p>Sistemas nominales. No hay errores recientes.</p>
                    </div>
                ) : (
                    jobs.map((job) => (
                        <div key={job.id} className="p-4 rounded-lg bg-red-950/10 border border-red-900/30 text-sm hover:bg-red-950/20 transition-colors">
                            
                            {/* HEADER DEL ERROR: USUARIO + FECHA */}
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6 border border-red-900/50">
                                        <AvatarImage src={job.profiles?.avatar_url} />
                                        <AvatarFallback className="text-[9px] bg-red-900 text-red-200">
                                            {job.profiles?.email?.substring(0,2).toUpperCase() || '??'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-slate-300">
                                            {job.profiles?.full_name || job.profiles?.email || 'Usuario Desconocido'}
                                        </span>
                                        <span className="text-[10px] text-slate-500 font-mono">ID: {job.id.substring(0,8)}...</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-slate-500 bg-slate-900/50 px-2 py-1 rounded-full">
                                    <Clock className="h-3 w-3" />
                                    {new Date(job.created_at).toLocaleString()}
                                </div>
                            </div>

                            {/* CUERPO DEL ERROR */}
                            <div className="space-y-2">
                                <p className="font-medium text-red-300 text-xs uppercase tracking-wider">
                                    Intento: {job.job_title || 'Generación sin título'}
                                </p>
                                <div className="bg-black/40 p-3 rounded border border-red-900/20 font-mono text-xs text-red-200/80 break-words whitespace-pre-wrap max-h-32 overflow-y-auto">
                                    {job.error_message || 'Error no especificado por el sistema.'}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}