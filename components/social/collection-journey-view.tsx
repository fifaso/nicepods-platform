/**
 * ARCHIVO: components/social/collection-journey-view.tsx
 * VERSIÓN: 2.0 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: MADRID RESONANCE V7.0
 *
 * Misión: Renderizar la experiencia de viaje por una colección de crónicas.
 * [REFORMA V2.0]: Sincronización axial completa con el contrato purificado V7.0.
 * Eliminación de fugas snake_case y alineación absoluta con la Doctrina ZAP.
 *
 * Nivel de Integridad: 100% (Soberanía Nominal V7.0)
 */

"use client";

import { Button } from "@/components/ui/button";
import { useAudio } from "@/contexts/audio-context";
import { cn } from "@/lib/utils";
import { Clock, Layers, Mic, PlayCircle, Users } from "lucide-react";
import Image from "next/image";
import { PodcastWithProfile } from "@/types/podcast";
import { Collection } from "@/types/profile";

/**
 * INTERFAZ: CollectionJourneyViewComponentProperties
 */
interface CollectionJourneyViewComponentProperties {
    collectionSnapshot: Collection & { profiles?: { username: string } };
    podcastsCollection: PodcastWithProfile[];
}

export function CollectionJourneyView({ collectionSnapshot, podcastsCollection }: CollectionJourneyViewComponentProperties) {
    const { playPodcastAction, currentActivePodcast, isAudioPlayingStatus } = useAudio();

    const handleStartJourneyAction = () => {
        if (podcastsCollection.length > 0) {
            playPodcastAction(podcastsCollection[0], podcastsCollection);
        }
    };

    const totalDurationInSecondsMagnitude = podcastsCollection.reduce((accumulatorValue, podcastItem) => accumulatorValue + (podcastItem.playbackDurationSecondsTotal || 0), 0);
    const formatDurationLabelAction = (secondsMagnitude: number) => Math.floor(secondsMagnitude / 60) + " min";

    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-1000">

            <div className="text-center space-y-6">
                <div className="flex justify-center mb-8">
                    <div className="relative h-48 w-48 group">
                        <div className="absolute -inset-4 bg-primary/20 rounded-[3rem] blur-3xl group-hover:bg-primary/30 transition duration-1000"></div>
                        <div className="relative h-full w-full bg-zinc-900 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
                            {collectionSnapshot.coverImageUniformResourceLocator ? (
                                <Image src={collectionSnapshot.coverImageUniformResourceLocator} alt="" fill className="object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-zinc-900">
                                    <Layers size={48} className="text-primary/40" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-white leading-none">
                        {collectionSnapshot.title}
                    </h1>
                    <div className="flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                        <span className="flex items-center gap-1"><Users size={12} /> {collectionSnapshot.profiles?.username}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {formatDurationLabelAction(totalDurationInSecondsMagnitude)} TOTAL</span>
                    </div>
                </div>

                <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed italic">
                    "{collectionSnapshot.descriptionTextContent}"
                </p>

                <div className="pt-6">
                    <Button
                        onClick={handleStartJourneyAction}
                        size="lg"
                        className="h-20 px-12 rounded-[2rem] bg-primary text-white font-black text-2xl hover:scale-105 transition-transform shadow-[0_0_50px_rgba(var(--primary),0.3)] group"
                    >
                        <PlayCircle className="mr-4 h-8 w-8 group-hover:animate-pulse" />
                        INICIAR VIAJE
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary/60 text-center mb-8">Composición del Hilo</h3>
                <div className="grid gap-3">
                    {podcastsCollection.map((podcastItem, itemIndexMagnitude) => {
                        const isCurrentlyPlayingStatus = currentActivePodcast?.identification === podcastItem.identification;
                        return (
                            <div
                                key={podcastItem.identification}
                                onClick={() => playPodcastAction(podcastItem, podcastsCollection)}
                                className={cn(
                                    "group p-6 bg-white/5 border transition-all cursor-pointer rounded-[2rem] flex items-center gap-6",
                                    isCurrentlyPlayingStatus ? "border-primary bg-primary/10 shadow-lg" : "border-white/5 hover:border-white/20 hover:bg-white/10"
                                )}
                            >
                                <span className={cn("text-3xl font-black opacity-10 transition-opacity group-hover:opacity-30", isCurrentlyPlayingStatus && "text-primary opacity-100")}>
                                    {String(itemIndexMagnitude + 1).padStart(2, '0')}
                                </span>
                                <div className="relative h-16 w-16 rounded-2xl overflow-hidden shadow-xl flex-shrink-0">
                                    {podcastItem.coverImageUniformResourceLocator ? <Image src={podcastItem.coverImageUniformResourceLocator} alt="" fill className="object-cover" /> : <Mic size={24} />}
                                    {isCurrentlyPlayingStatus && isAudioPlayingStatus && (
                                        <div className="absolute inset-0 bg-primary/40 flex items-center justify-center">
                                            <div className="flex gap-1">
                                                <div className="w-1 h-4 bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <div className="w-1 h-4 bg-white animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <div className="w-1 h-4 bg-white animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className={cn("font-bold text-lg uppercase tracking-tight truncate", isCurrentlyPlayingStatus && "text-primary")}>{podcastItem.titleTextContent}</h3>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1 opacity-60">
                                        {podcastItem.profiles?.fullName} • {formatDurationLabelAction(podcastItem.playbackDurationSecondsTotal || 0)}
                                    </p>
                                </div>
                                <div className="hidden sm:block">
                                    <PlayCircle size={32} className={cn("text-white/10 transition-colors", isCurrentlyPlayingStatus ? "text-primary" : "group-hover:text-white/40")} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
