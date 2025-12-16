"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, XCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

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
            <p className="text-xs text-slate-500">Jobs fallidos (Clic para ver)</p>
          </CardContent>
        </Card>
      </DialogTrigger>
      
      <DialogContent className="bg-slate-950 border-slate-800 text-slate-200 sm:max-w-lg">
        <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
                <XCircle className="h-5 w-5" /> Registro de Fallos Recientes
            </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[300px] mt-4 pr-4">
            <div className="space-y-3">
                {jobs.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">No hay errores recientes registrados.</p>
                ) : (
                    jobs.map((job) => (
                        <div key={job.id} className="p-3 rounded bg-red-950/20 border border-red-900/50 text-xs">
                            <div className="flex justify-between text-slate-400 mb-1">
                                <span>{new Date(job.created_at).toLocaleTimeString()}</span>
                                <span className="font-mono">{job.id}</span>
                            </div>
                            <p className="font-semibold text-red-200 mb-1">{job.job_title || 'Sin Título'}</p>
                            <p className="text-slate-300 font-mono bg-black/20 p-2 rounded break-all">
                                {job.error_message || 'Error desconocido'}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}