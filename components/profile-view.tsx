// components/profile-view.tsx
// VERSIÓN: 9.1 (Resonance Profile Master - Strict Type Integrity Edition)
// Misión: Renderizar la vista de podcast en perfil con sincronía total y sin errores de compilación.
// [RESOLUCIÓN]: Fix de error TS2430 (Incompatible Interface), TS2345 y restauración de variables de scope.

"use client";

import { User } from '@supabase/supabase-js';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// --- COMPONENTES DE INFRAESTRUCTURA UI ---
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';

// --- CONTEXTOS Y HOOKS ---
import { useAudio } from '@/contexts/audio-context';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { cn, getSafeAsset } from '@/lib/utils';

// --- TIPADO E ICONOGRAFÍA ---
import { PodcastScript, PodcastWithProfile, ResearchSource } from '@/types/podcast';
import {
  BookOpen,
  ChevronDown,
  CornerUpRight,
  Download,
  Globe,
  Heart,
  Loader2,
  Mic,
  Pencil,
  PlayCircle,
  Share2,
  Tag
} from 'lucide-react';

// --- COMPONENTES SATÉLITE ---
import { CreationMetadata } from './creation-metadata';
import { ScriptViewer } from './script-viewer';
import { TagCurationCanvas } from './tag-curation-canvas';

/**
 * INTERFAZ: ProfileExtendedPodcast
 * [FIX TS2430]: Utilizamos Omit para reconstruir la interfaz sin conflictos de tipos base.
 */
interface ProfileExtendedPodcast extends Omit<PodcastWithProfile, 'profiles'> {
  audio_ready: boolean;
  image_ready: boolean;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
    username: string;
    reputation_score?: number;
    is_verified?: boolean;
  } | null;
}

interface ProfilePodcastViewProps {
  podcastData: PodcastWithProfile;
  user: User | null;
  initialIsLiked: boolean;
}

export function PodcastView({ podcastData, user, initialIsLiked }: ProfilePodcastViewProps) {
  const router = useRouter();
  const { supabase } = useAuth();
  const { playPodcast, logInteractionEvent } = useAudio();
  const { toast } = useToast();

  // --- ESTADOS DE HIDRATACIÓN ---
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  // --- ESTADOS DE DATOS (Casting a la interfaz corregida) ---
  const [localPodcastData, setLocalPodcastData] = useState<ProfileExtendedPodcast>(podcastData as unknown as ProfileExtendedPodcast);
  const [isLiked, setIsLiked] = useState<boolean>(initialIsLiked);
  const [likeCount, setLikeCount] = useState<number>(Number(podcastData.like_count || 0));
  const [isLiking, setIsLiking] = useState<boolean>(false);

  // --- ESTADOS DE INTERFAZ ---
  const [isScriptExpanded, setIsScriptExpanded] = useState<boolean>(false);
  const [isSourcesExpanded, setIsSourcesExpanded] = useState<boolean>(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState<boolean>(false);
  const [isEditingTags, setIsEditingTags] = useState<boolean>(false);
  const channelRef = useRef<any>(null);

  /**
   * [SINCRO REALTIME]: Escucha de la Bóveda para actualizaciones de IA.
   */
  useEffect(() => {
    if (!supabase || !localPodcastData.id || !isClient) return;

    if (channelRef.current) supabase.removeChannel(channelRef.current);

    channelRef.current = supabase.channel(`pod_profile_sync_${localPodcastData.id}`)
      .on<ProfileExtendedPodcast>(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'micro_pods', filter: `id=eq.${localPodcastData.id}` },
        (payload) => {
          const newData = payload.new as ProfileExtendedPodcast;
          setLocalPodcastData(prev => ({ ...prev, ...newData }));
          if (newData.audio_ready) {
            setIsGeneratingAudio(false);
            toast({ title: "Narrativa Sincronizada" });
          }
        }
      ).subscribe();

    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current); };
  }, [supabase, localPodcastData.id, isClient, toast]);

  // --- DERIVACIONES (Rigor de Scope) ---
  const isOwner = useMemo(() => user?.id === localPodcastData.user_id, [user?.id, localPodcastData.user_id]);

  const displayTags = useMemo(() => {
    const tags = localPodcastData.user_tags?.length ? localPodcastData.user_tags : (localPodcastData.ai_tags || []);
    return tags;
  }, [localPodcastData.ai_tags, localPodcastData.user_tags]);

  const sources = useMemo<ResearchSource[]>(() => {
    return (localPodcastData.sources as unknown as ResearchSource[]) || [];
  }, [localPodcastData.sources]);

  /**
   * [FIX TS2345]: Normalización de guion sin parseos redundantes.
   */
  const normalizedScriptText = useMemo(() => {
    const raw = localPodcastData.script_text;
    if (!raw) return "";
    if (typeof raw === 'object' && raw !== null) {
      const scriptObj = raw as unknown as PodcastScript;
      return scriptObj.script_body || scriptObj.script_plain || "";
    }
    return String(raw);
  }, [localPodcastData.script_text]);

  // --- MANEJADORES DE ACCIÓN ---

  const handleSaveTags = useCallback(async (finalTags: string[]) => {
    if (!supabase) return;
    const { error } = await supabase.from('micro_pods').update({ user_tags: finalTags }).eq('id', localPodcastData.id);
    if (!error) {
      setLocalPodcastData(prev => ({ ...prev, user_tags: finalTags }));
      toast({ title: "Etiquetas actualizadas" });
    }
  }, [supabase, localPodcastData.id, toast]);

  const handleLike = async () => {
    if (!supabase || !user || isLiking) return;
    setIsLiking(true);
    const podId = localPodcastData.id;
    if (isLiked) {
      setIsLiked(false);
      setLikeCount(c => Math.max(0, c - 1));
      await supabase.from('likes').delete().match({ user_id: user.id, podcast_id: podId });
    } else {
      setIsLiked(true);
      setLikeCount(c => c + 1);
      await supabase.from('likes').insert({ user_id: user.id, podcast_id: podId });
    }
    setIsLiking(false);
  };

  const handleShare = async () => {
    try {
      await navigator.share({ title: localPodcastData.title, url: window.location.href });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Enlace Copiado" });
    }
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
      a.download = `NicePod-${localPodcastData.id}.wav`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      toast({ title: "Error en descarga", variant: "destructive" });
    }
  };

  const handleGenerateAudio = async () => {
    if (!supabase) return;
    setIsGeneratingAudio(true);
    await supabase.functions.invoke('generate-audio-from-script', { body: { podcast_id: localPodcastData.id } });
    toast({ title: "Forja Iniciada", description: "La voz se está materializando." });
  };

  if (!isClient) return null;

  return (
    <div className="container mx-auto max-w-7xl py-4 md:py-8 px-4 w-full animate-in fade-in duration-700">
      <div className="grid lg:grid-cols-3 gap-6 items-start">

        {/* COLUMNA IZQUIERDA: CUERPO */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card/40 backdrop-blur-3xl border-white/5 shadow-2xl rounded-[2.5rem] overflow-hidden w-full">
            <div className="aspect-video relative w-full bg-zinc-900">
              {localPodcastData.cover_image_url && (
                <Image src={localPodcastData.cover_image_url} alt="" fill className="object-cover opacity-80" priority />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            </div>

            <CardHeader className="p-6 md:p-10">
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-primary/20 text-primary border-none text-[9px] font-black uppercase tracking-widest">{localPodcastData.status}</Badge>
              </div>
              <CardTitle className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-none text-white">{localPodcastData.title}</CardTitle>
              <CardDescription className="pt-4 text-lg md:text-xl text-zinc-400 font-medium leading-snug italic">"{localPodcastData.description}"</CardDescription>
              <Separator className="my-8 opacity-10" />

              <div className="space-y-10">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">
                      <Tag className="h-3 w-3 text-primary" /> <span>Dimensiones Semánticas</span>
                    </div>
                    {isOwner && (
                      <Button variant="ghost" size="sm" onClick={() => setIsEditingTags(true)} className="h-8 rounded-xl text-[9px] font-black uppercase bg-white/5 border border-white/5"><Pencil className="h-3 w-3 mr-2" /> Editar</Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {displayTags.map(tag => <Badge key={tag} variant="outline" className="bg-white/5 border-white/10 px-4 py-1.5 text-[10px] font-bold uppercase">{tag}</Badge>)}
                  </div>
                </div>

                {sources.length > 0 && (
                  <Collapsible open={isSourcesExpanded} onOpenChange={setIsSourcesExpanded} className="rounded-3xl border border-white/5 bg-white/[0.02]">
                    <CollapsibleTrigger className="w-full">
                      <div className="flex justify-between items-center p-6 hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-3 text-primary"><Globe className="h-5 w-5" /><span className="font-black uppercase text-[10px] tracking-widest">Fuentes de Verdad ({sources.length})</span></div>
                        <ChevronDown className={cn("h-4 w-4 text-zinc-500 transition-transform", isSourcesExpanded && 'rotate-180')} />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-6 pb-6 space-y-3">
                      {sources.map((source, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-black/40 border border-white/5 text-left cursor-pointer" onClick={() => source.url && window.open(source.url, '_blank')}>
                          <p className="font-bold text-xs text-zinc-200">{source.title}</p>
                          <p className="text-[10px] text-zinc-500 mt-1 truncate">{source.url}</p>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-6 md:p-10 pt-0">
              <Separator className="mb-8 opacity-10" />
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" /> Trascripción</h3>
                <Button variant="ghost" size="sm" onClick={() => setIsScriptExpanded(!isScriptExpanded)} className="text-primary font-black uppercase text-[9px] tracking-widest">{isScriptExpanded ? 'Cerrar' : 'Leer Todo'}</Button>
              </div>
              <AnimatePresence>
                {isScriptExpanded && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 bg-black/60 rounded-[2.5rem] border border-white/5 shadow-inner">
                    <ScriptViewer scriptText={normalizedScriptText} />
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>

        {/* COLUMNA DERECHA: CONSOLA */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
          <Card className="bg-primary/5 border-primary/20 backdrop-blur-3xl rounded-[2.5rem] p-6 shadow-2xl">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 mb-6 flex items-center gap-2"><PlayCircle className="h-4 w-4" /> Control de Emisión</CardTitle>
            <div className="space-y-6">
              {localPodcastData.audio_url ? (
                <Button onClick={() => playPodcast(localPodcastData)} className="w-full h-16 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs shadow-lg hover:scale-[1.02] active:scale-95 transition-all"><PlayCircle className="mr-2 h-5 w-5 fill-current" /> Reproducir</Button>
              ) : (
                <Button onClick={handleGenerateAudio} disabled={isGeneratingAudio} className="w-full h-16 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs">{isGeneratingAudio ? <Loader2 className="animate-spin h-5 w-5" /> : <><Mic className="mr-2 h-5 w-5" /> Forjar Voz</>}</Button>
              )}
              <div className="flex justify-between items-center px-2">
                <button onClick={handleLike} className="flex flex-col items-center gap-1 group">
                  <Heart className={cn("h-6 w-6 transition-all", isLiked ? 'text-red-500 fill-current scale-110' : 'text-zinc-600 group-hover:text-red-400')} />
                  <span className="text-[10px] font-black text-zinc-500 tabular-nums">{likeCount}</span>
                </button>
                <div className="flex gap-4">
                  <button onClick={handleShare} className="p-3 rounded-full bg-white/5 text-zinc-500 hover:text-primary transition-colors"><Share2 size={18} /></button>
                  <button onClick={handleDownload} disabled={!localPodcastData.audio_url} className="p-3 rounded-full bg-white/5 text-zinc-500 hover:text-primary transition-colors disabled:opacity-20"><Download size={18} /></button>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-zinc-900/60 border-white/5 rounded-[2.5rem] p-6 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative h-12 w-12 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                <Image src={getSafeAsset(localPodcastData.profiles?.avatar_url, 'avatar')} alt="" fill className="object-cover" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase text-primary/80 tracking-widest mb-0.5">Autor</p>
                <p className="font-black text-white truncate text-sm uppercase">{localPodcastData.profiles?.full_name || "Anónimo"}</p>
                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Reputación: {localPodcastData.profiles?.reputation_score || 0} pts</p>
              </div>
            </div>
            <Separator className="opacity-10 mb-6" />
            <CreationMetadata data={localPodcastData.creation_data} />
            {isOwner && localPodcastData.status === 'published' && (
              <Button onClick={() => router.push(`/podcast/${localPodcastData.id}`)} className="w-full mt-6 h-12 rounded-xl bg-indigo-600 text-white font-black uppercase text-[9px] tracking-widest shadow-lg hover:bg-indigo-500 transition-all"><CornerUpRight className="mr-2 h-4 w-4" /> Ver en Bóveda Global</Button>
            )}
          </Card>
        </div>
      </div>

      {isClient && isOwner && (
        <TagCurationCanvas isOpen={isEditingTags} onOpenChange={setIsEditingTags} suggestedTags={localPodcastData.ai_tags || []} publishedTags={localPodcastData.user_tags || []} onSave={handleSaveTags} />
      )}
    </div>
  );
}