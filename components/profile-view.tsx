// components/profile-view.tsx
// VERSIÓN: 8.0 (Resonance Master - Production Final & Unabridged)

"use client";

import { User } from '@supabase/supabase-js';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { useAudio } from '@/contexts/audio-context';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { cn, formatTime, getSafeAsset } from '@/lib/utils';
import { PodcastWithProfile } from '@/types/podcast';
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Download,
  ExternalLink,
  Globe,
  Heart,
  Loader2,
  Mic,
  Pencil,
  PlayCircle,
  Share2,
  Sparkles,
  Tag
} from 'lucide-react';
import { CreationMetadata } from './creation-metadata';
import { ScriptViewer } from './script-viewer';
import { TagCurationCanvas } from './tag-curation-canvas';

interface PodcastViewProps {
  podcastData: PodcastWithProfile;
  user: User | null;
  initialIsLiked: boolean;
}

interface SourceItem {
  title?: string;
  url?: string;
  snippet?: string;
}

export function PodcastView({ podcastData, user, initialIsLiked }: PodcastViewProps) {
  const router = useRouter();
  const { supabase } = useAuth();
  const { playPodcast, logInteractionEvent } = useAudio();
  const { toast } = useToast();

  // --- ESTADOS DE DATOS SINCRONIZADOS ---
  const [localPodcastData, setLocalPodcastData] = useState<PodcastWithProfile>(podcastData);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(localPodcastData.like_count || 0);
  const [isLiking, setIsLiking] = useState(false);

  // --- ESTADOS DE INTERFAZ (UI) ---
  const [isScriptExpanded, setIsScriptExpanded] = useState(false);
  const [isSourcesExpanded, setIsSourcesExpanded] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isEditingTags, setIsEditingTags] = useState(false);

  // Sincronización reactiva con las propiedades del componente
  useEffect(() => {
    setLocalPodcastData(podcastData);
    setLikeCount(podcastData.like_count || 0);
    setIsLiked(initialIsLiked);
  }, [podcastData, initialIsLiked]);

  // Suscripción Real-time a la tabla micro_pods para estados de IA y metadatos
  useEffect(() => {
    if (!supabase || !localPodcastData.id) return;

    const channel = supabase.channel(`pod_display_${localPodcastData.id}`)
      .on<PodcastWithProfile>(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'micro_pods',
          filter: `id=eq.${localPodcastData.id}`
        },
        (payload) => {
          const newData = payload.new as PodcastWithProfile;
          setLocalPodcastData(prev => ({ ...prev, ...newData }));
          if (newData.audio_url) {
            setIsGeneratingAudio(false);
            toast({ title: "Motor de Voz Listo", description: "La narrativa ha sido forjada exitosamente." });
          }
        }
      ).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase, localPodcastData.id, toast]);

  const isOwner = user?.id === localPodcastData.user_id;

  // --- DERIVACIÓN DE DATOS (MAPPING) ---

  const displayTags = useMemo(() => {
    return localPodcastData.user_tags?.length ? localPodcastData.user_tags : (localPodcastData.ai_tags || []);
  }, [localPodcastData.ai_tags, localPodcastData.user_tags]);

  const displaySources: SourceItem[] = useMemo(() => {
    const rawSources = (localPodcastData as any).sources;
    return Array.isArray(rawSources) ? rawSources : [];
  }, [localPodcastData]);

  const normalizedScriptText = useMemo(() => {
    const raw = localPodcastData.script_text;
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return parsed.script_body || raw;
    } catch { return raw; }
  }, [localPodcastData.script_text]);

  const profileUrl = useMemo(() => {
    const handle = localPodcastData.profiles?.username;
    return handle ? `/profile/${handle}` : null;
  }, [localPodcastData.profiles]);

  // --- MANEJADORES DE ACCIÓN (BUSINESS LOGIC) ---

  const handleSaveTags = useCallback(async (finalTags: string[]) => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from('micro_pods')
        .update({ user_tags: finalTags })
        .eq('id', localPodcastData.id);
      if (error) throw error;
      setLocalPodcastData(prev => ({ ...prev, user_tags: finalTags }));
      toast({ title: "Curación Guardada", description: "Los conceptos de resonancia han sido anclados." });
    } catch (err) {
      toast({ title: "Error de Persistencia", description: "No pudimos actualizar las etiquetas.", variant: "destructive" });
    }
  }, [supabase, localPodcastData.id, toast]);

  const handleLike = async () => {
    if (!supabase || !user) {
      toast({ title: "Acción Protegida", description: "Debes ingresar para participar en la resonancia.", variant: "destructive" });
      return;
    }
    setIsLiking(true);

    try {
      if (isLiked) {
        setIsLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
        await supabase.from('likes').delete().match({ user_id: user.id, podcast_id: localPodcastData.id });
      } else {
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
        await supabase.from('likes').insert({ user_id: user.id, podcast_id: localPodcastData.id });
        // Sincronización con AudioContext 3.0
        await logInteractionEvent('liked');
      }
    } catch (error) {
      toast({ title: "Error de Sincronización", variant: "destructive" });
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: localPodcastData.title,
      text: localPodcastData.description || "Escucha este Micro-pod en NicePod",
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        await logInteractionEvent('shared');
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({ title: "Enlace Copiado", description: "Listo para compartir resonancia." });
      }
    } catch (err) { console.warn("Share failed", err); }
  };

  const handleDownload = async () => {
    if (!localPodcastData.audio_url) return;
    toast({ title: "Iniciando descarga..." });
    try {
      const response = await fetch(localPodcastData.audio_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nicepod-${localPodcastData.id}.webm`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast({ title: "Error en descarga", variant: "destructive" });
    }
  };

  const handleGenerateAudio = async () => {
    if (!supabase) return;
    setIsGeneratingAudio(true);
    try {
      const { data: job } = await supabase
        .from('podcast_creation_jobs')
        .select('id')
        .eq('micro_pod_id', localPodcastData.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!job) throw new Error("Referencia de creación no encontrada.");

      await supabase.functions.invoke('generate-audio-from-script', { body: { job_id: job.id } });
      toast({ title: "Forja Iniciada", description: "El motor de voz está procesando la narrativa." });
    } catch (error) {
      toast({ title: "Fallo de comunicación", variant: "destructive" });
      setIsGeneratingAudio(false);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl py-8 md:py-16 px-4 animate-in fade-in duration-1000">
      <div className="grid lg:grid-cols-3 gap-10 items-start relative">

        {/* COLUMNA IZQUIERDA: CUERPO NARRATIVO */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-card/40 backdrop-blur-3xl border-white/5 shadow-2xl overflow-hidden rounded-[3rem]">

            {/* CARÁTULA INMERSIVA */}
            {localPodcastData.cover_image_url && (
              <div className="aspect-[21/9] relative w-full bg-zinc-900 group">
                <Image
                  src={localPodcastData.cover_image_url}
                  alt={localPodcastData.title}
                  fill
                  className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
              </div>
            )}

            <CardHeader className="p-8 md:p-12 relative z-10">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <Badge className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest bg-primary/20 text-primary border-none shadow-sm">
                  {localPodcastData.status.replace('_', ' ')}
                </Badge>
                {localPodcastData.creation_mode === 'geo_mode' && (
                  <Badge variant="outline" className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border-primary/30 text-white flex items-center gap-2 backdrop-blur-md">
                    <Sparkles size={12} className="text-primary animate-pulse" /> Resonancia Local
                  </Badge>
                )}
              </div>

              <CardTitle className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none text-white">
                {localPodcastData.title}
              </CardTitle>

              <CardDescription className="pt-6 text-xl md:text-2xl text-zinc-400 font-medium leading-relaxed max-w-2xl italic">
                "{localPodcastData.description}"
              </CardDescription>

              <Separator className="my-10 opacity-10" />

              <div className="space-y-12">
                {/* BLOQUE ETIQUETAS */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
                      <Tag className="h-4 w-4 text-primary" />
                      <span>Conceptos de Inteligencia</span>
                    </div>
                    {isOwner && (
                      <Button variant="ghost" size="sm" onClick={() => setIsEditingTags(true)} className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 transition-all border border-white/5">
                        <Pencil className="h-3.5 w-3.5 mr-2 text-primary" /> Editar
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {displayTags.length > 0 ? displayTags.map(tag => (
                      <Badge key={tag} variant="outline" className="bg-white/5 border-white/5 px-5 py-2.5 text-xs font-bold text-zinc-300 hover:text-primary hover:border-primary/30 transition-all cursor-default">
                        {tag}
                      </Badge>
                    )) : <span className="text-xs text-zinc-600 italic">No hay etiquetas analizadas.</span>}
                  </div>
                </div>

                {/* BLOQUE FUENTES DE INVESTIGACIÓN */}
                {displaySources.length > 0 && (
                  <div className="rounded-[2.5rem] border border-white/5 bg-white/[0.02] overflow-hidden transition-all duration-500 hover:bg-white/[0.04]">
                    <Collapsible open={isSourcesExpanded} onOpenChange={setIsSourcesExpanded}>
                      <CollapsibleTrigger className="w-full">
                        <div className="flex justify-between items-center p-8 hover:bg-white/5 transition-colors group">
                          <div className="flex items-center gap-4 text-primary">
                            <Globe className="h-6 w-6" />
                            <span className="font-black uppercase text-xs tracking-widest">Fuentes de Verdad ({displaySources.length})</span>
                          </div>
                          <ChevronDown className={cn("h-5 w-5 text-zinc-500 transition-transform duration-500", isSourcesExpanded && 'rotate-180')} />
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-8 pb-8 space-y-4">
                        {displaySources.map((source, idx) => (
                          <div key={idx} className="p-5 rounded-3xl bg-black/40 border border-white/5 flex flex-col gap-3 hover:border-primary/30 transition-all cursor-pointer group/source" onClick={() => source.url && window.open(source.url, '_blank')}>
                            <div className="flex justify-between items-start gap-4">
                              <span className="font-bold text-sm text-zinc-200 group-hover/source:text-primary transition-colors">{source.title || "Evidencia Detectada"}</span>
                              {source.url && <ExternalLink size={14} className="text-zinc-600 group-hover/source:text-primary" />}
                            </div>
                            {source.snippet && <p className="text-xs text-zinc-500 leading-relaxed border-l-2 border-primary/20 pl-4">{source.snippet}</p>}
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                )}
              </div>
            </CardHeader>

            {/* BLOQUE TRANSCRIPCIÓN */}
            <CardContent className="p-8 md:p-12 pt-0">
              <Separator className="mb-12 opacity-10" />
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-primary" /> Transcripción de Inteligencia
                </h3>
                <Button variant="ghost" onClick={() => setIsScriptExpanded(!isScriptExpanded)} className="text-primary font-black uppercase text-[10px] tracking-widest gap-2 bg-primary/5 px-6 rounded-full hover:bg-primary/10 transition-colors">
                  {isScriptExpanded ? 'Cerrar' : 'Leer Guion'}
                  <ChevronDown className={cn("h-4 w-4 transition-transform duration-500", isScriptExpanded && 'rotate-180')} />
                </Button>
              </div>
              <AnimatePresence>
                {isScriptExpanded && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="p-8 bg-black/60 rounded-[3rem] border border-white/5 shadow-inner"
                  >
                    <ScriptViewer scriptText={normalizedScriptText} />
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>

        {/* COLUMNA DERECHA: CONSOLA DE OPERACIONES */}
        <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-28">

          {/* REPRODUCTOR TÁCTICO */}
          <Card className="bg-primary/5 border-primary/20 backdrop-blur-3xl rounded-[3rem] shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" />
            <CardHeader className="pb-4 pt-8 px-8">
              <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-3 text-white opacity-60">
                <PlayCircle className="h-5 w-5 text-primary animate-pulse" /> Control de Emisión
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 p-8">
              {localPodcastData.audio_url ? (
                <Button onClick={() => playPodcast(localPodcastData)} className="w-full h-20 rounded-[2rem] bg-primary text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all text-sm">
                  <PlayCircle className="mr-3 h-6 w-6 fill-current" /> Reproducir
                </Button>
              ) : (
                <Button onClick={handleGenerateAudio} disabled={isGeneratingAudio} className="w-full h-20 rounded-[2rem] bg-white text-black font-black uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all text-sm disabled:opacity-50">
                  {isGeneratingAudio ? <Loader2 className="animate-spin h-6 w-6" /> : <><Mic className="mr-3 h-6 w-6" /> Forjar Voz</>}
                </Button>
              )}

              <div className="flex justify-between items-center px-4">
                <div className="flex flex-col items-center gap-2">
                  <button onClick={handleLike} disabled={isLiking} className="group p-4 rounded-full bg-white/5 border border-white/10 hover:bg-red-500/10 transition-all active:scale-75">
                    <Heart className={cn("h-7 w-7 transition-all", isLiked ? 'text-red-500 fill-current scale-110' : 'text-zinc-500 group-hover:text-red-400')} />
                  </button>
                  <span className="text-xs font-black tabular-nums text-zinc-400 tracking-tighter">{likeCount}</span>
                </div>
                <div className="flex gap-4">
                  <button onClick={handleShare} className="p-4 rounded-full bg-white/5 border border-white/10 hover:bg-primary/10 transition-all active:scale-75"><Share2 className="h-6 w-6 text-zinc-500 hover:text-primary" /></button>
                  <button onClick={handleDownload} disabled={!localPodcastData.audio_url} className="p-4 rounded-full bg-white/5 border border-white/10 hover:bg-primary/10 transition-all active:scale-75 disabled:opacity-20"><Download className="h-6 w-6 text-zinc-500 hover:text-primary" /></button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PERFIL DEL CREADOR */}
          <Card className="bg-zinc-900/60 border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 rounded-[1.5rem] bg-zinc-800 overflow-hidden border border-white/10 relative shadow-lg">
                <Image
                  src={getSafeAsset(localPodcastData.profiles?.avatar_url, 'avatar')}
                  alt={localPodcastData.profiles?.full_name || "Creador"}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary/80 mb-1 flex items-center gap-2">
                  <CheckCircle2 size={12} /> Cronista Verificado
                </p>
                {profileUrl ? (
                  <Link href={profileUrl} className="font-black text-white truncate text-lg hover:text-primary transition-colors flex items-center gap-2 group">
                    {localPodcastData.profiles?.full_name}
                    <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ) : (
                  <p className="font-black text-white truncate text-lg">{localPodcastData.profiles?.full_name || "Anónimo"}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                <span className="block text-[9px] font-black uppercase text-zinc-600 tracking-widest mb-1">Publicado</span>
                <p className="text-sm font-bold text-zinc-300">{new Date(localPodcastData.created_at).toLocaleDateString()}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                <span className="block text-[9px] font-black uppercase text-zinc-600 tracking-widest mb-1">Duración</span>
                <p className="text-sm font-bold text-zinc-300">{formatTime(localPodcastData.duration_seconds || 0)}</p>
              </div>
            </div>
            <div className="mt-8">
              <CreationMetadata data={localPodcastData.creation_data} />
            </div>
          </Card>
        </div>
      </div>

      {/* CANVAS DE CURACIÓN (Solo Propietarios) */}
      {isOwner && (
        <TagCurationCanvas
          isOpen={isEditingTags}
          onOpenChange={setIsEditingTags}
          suggestedTags={localPodcastData.ai_tags || []}
          publishedTags={localPodcastData.user_tags || []}
          onSave={handleSaveTags}
        />
      )}
    </div>
  );
}