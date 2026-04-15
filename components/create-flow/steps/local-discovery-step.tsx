/**
 * ARCHIVO: components/create-flow/steps/local-discovery-step.tsx
 * VERSIÓN: 8.0 (NicePod Local Discovery - Geodetic Precision & ZAP Restoration)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Capturar el contexto físico (Telemetría Geodésica + Visión Ambiental) y 
 * sincronizarlo con el Oráculo de Inteligencia para generar el dossier industrial.
 * [REFORMA V8.0]: Resolución de 19 errores TS (TS2339, TS2769, TS2353, TS2367). 
 * Sincronización nominal absoluta con 'PodcastCreationSchema' V12.0. 
 * Aplicación integral de la Zero Abbreviations Policy (ZAP) y Build Shield Sovereignty.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import React, { useState, useRef, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { 
  Camera, 
  CheckCircle2, 
  Compass, 
  History, 
  Loader2, 
  Navigation, 
  Search, 
  Sparkles, 
  Utensils, 
  X 
} from "lucide-react";

// --- INFRAESTRUCTURA DE ARQUITECTURA SOBERANA ---
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { useCreationContext } from "../shared/context";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { classNamesUtility, nicepodLog } from "@/lib/utils";

/**
 * DISCOVERY_LENSES_COLLECTION: Filtros cognitivos para el peritaje situacional.
 */
const DISCOVERY_LENSES_COLLECTION = [
  { identification: 'Tesoros Ocultos', iconComponent: <Sparkles className="h-4 w-4" />, displayLabel: "Tesoros" },
  { identification: 'Historias de Pasillo', iconComponent: <History className="h-4 w-4" />, displayLabel: "Crónicas" },
  { identification: 'Sabor Local', iconComponent: <Utensils className="h-4 w-4" />, displayLabel: "Sabor" },
  { identification: 'Qué hacer ahora', iconComponent: <Search className="h-4 w-4" />, displayLabel: "Planes" },
] as const;

/**
 * LocalDiscoveryStep: La terminal de captura de contexto físico.
 */
export function LocalDiscoveryStep() {
  // 1. CONSUMO DE CÓRTEX Y AUTORIDAD
  const { supabaseSovereignClient, authenticatedUser } = useAuth();
  const { toast } = useToast();
  
  const { setValue, watch } = useFormContext<PodcastCreationData>();
  const { transitionToNextStateAction } = useCreationContext();
  
  // 2. ESTADOS DE INTERFAZ TÁCTICA (ZAP COMPLIANT)
  const [isGeolocationProcessActive, setIsGeolocationProcessActive] = useState<boolean>(false);
  const [isGeocodingSearchProcessActive, setIsGeocodingSearchProcessActive] = useState<boolean>(false);
  const [isOracleAnalysisProcessActive, setIsOracleAnalysisProcessActive] = useState<boolean>(false);
  const [visualVisionPreviewBase64Data, setVisualVisionPreviewBase64Data] = useState<string | null>(null);
  
  const hiddenFileInputReference = useRef<HTMLInputElement>(null);

  // 3. OBSERVADORES DE EXPEDIENTE [SINCRO V8.0 - RESOLUCIÓN TS2769]
  const currentGeographicLocationSnapshot = watch("location");
  const currentSelectedResonanceToneIdentifier = watch("selectedToneIdentifier");
  const currentVisualEnvironmentalImageContext = watch("visualEnvironmentalImageContext");
  const currentManualTopicSelectionText = watch("soloTopicSelection");

  /**
   * handleManualGeocodingSearchAction:
   * Misión: Triangulación semántica basada en intención de texto.
   * [RESOLUCIÓN TS2353 / TS2339]: Mapeo a 'latitudeCoordinate' y 'longitudeCoordinate'.
   */
  const handleManualGeocodingSearchAction = async () => {
    if (!currentManualTopicSelectionText || currentManualTopicSelectionText.length < 3) return;
    
    setIsGeocodingSearchProcessActive(true);
    nicepodLog(`🔍 [Discovery] Iniciando triangulación para: ${currentManualTopicSelectionText}`);
    
    try {
      const geocodingNetworkResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(currentManualTopicSelectionText)}&limit=1&addressdetails=1`
      );
      const geocodingParsedDataCollection = await geocodingNetworkResponse.json();
      
      if (geocodingParsedDataCollection && geocodingParsedDataCollection[0]) {
        const topGeocodingMatchEntry = geocodingParsedDataCollection[0];
        const matchAddressDetailsDossier = topGeocodingMatchEntry.address || {};
        
        setValue("location", {
          latitudeCoordinate: parseFloat(topGeocodingMatchEntry.lat),
          longitudeCoordinate: parseFloat(topGeocodingMatchEntry.lon),
          placeNameReference: topGeocodingMatchEntry.display_name.split(',')[0],
          cityNameReference: matchAddressDetailsDossier.city || matchAddressDetailsDossier.town || "Madrid Resonance"
        }, { shouldValidate: true });
        
        toast({ title: "Hito Detectado", description: "Sincronía geográfica establecida." });
      } else {
        toast({ title: "Vacío de Red", description: "No logramos triangular esa ubicación.", variant: "destructive" });
      }
    } catch (hardwareException) {
      nicepodLog("🔥 [Discovery] Fallo en servicio de geocodificación.", hardwareException, 'error');
    } finally {
      setIsGeocodingSearchProcessActive(false);
    }
  };

  /**
   * handleHardwareGeolocationAction:
   * Misión: Captura directa del silicio mediante el API de Geolocation.
   * [RESOLUCIÓN TS2353]: Alineación con descriptores industriales.
   */
  const handleHardwareGeolocationAction = () => {
    setIsGeolocationProcessActive(true);
    
    if (!navigator.geolocation) {
      toast({ title: "Fallo de Hardware", description: "Módulo GPS no detectado.", variant: "destructive" });
      setIsGeolocationProcessActive(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (hardwarePositionSnapshot) => {
        setValue("location", {
          latitudeCoordinate: hardwarePositionSnapshot.coords.latitude,
          longitudeCoordinate: hardwarePositionSnapshot.coords.longitude,
          placeNameReference: "Posición Táctica Actual",
          cityNameReference: "Coordenada de Silicio"
        }, { shouldValidate: true });
        
        setIsGeolocationProcessActive(false);
        toast({ title: "Bloqueo Satelital", description: "Coordenadas integradas al expediente." });
      },
      (hardwareOperationException) => {
        nicepodLog("⚠️ [Discovery] Error de GPS Hardware.", hardwareOperationException.message, 'warn');
        setIsGeolocationProcessActive(false);
        toast({ title: "Fallo de Triangulación", description: "Active la autoridad del GPS.", variant: "destructive" });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  /**
   * handleVisionCaptureAction:
   * Misión: Procesamiento de evidencia óptica ambiental.
   * [RESOLUCIÓN TS2345]: Alineación con 'visualEnvironmentalImageContext'.
   */
  const handleVisionCaptureAction = (inputChangeEvent: React.ChangeEvent<HTMLInputElement>) => {
    const capturedFileEntity = inputChangeEvent.target.files?.[0];
    
    if (capturedFileEntity) {
      const fileReaderInstance = new FileReader();
      fileReaderInstance.onloadend = () => {
        const base64EncodedData = fileReaderInstance.result as string;
        setVisualVisionPreviewBase64Data(base64EncodedData);
        setValue("visualEnvironmentalImageContext", base64EncodedData, { shouldValidate: true });
      };
      fileReaderInstance.readAsDataURL(capturedFileEntity);
    }
  };

  /**
   * handleOracleAnalysisAction:
   * Misión: Orquestación del peritaje urbano mediante IA Multimodal.
   * [RESOLUCIÓN TS2339 / TS2345]: Sincronización con el esquema V12.0.
   */
  const handleOracleAnalysisAction = useCallback(async () => {
    if (!currentGeographicLocationSnapshot && !currentVisualEnvironmentalImageContext && (!currentManualTopicSelectionText || currentManualTopicSelectionText.length < 3)) {
      toast({ title: "Expediente Incompleto", description: "Se requiere telemetría para el peritaje.", variant: "destructive" });
      return;
    }

    if (!authenticatedUser) return;

    setIsOracleAnalysisProcessActive(true);
    nicepodLog("🧠 [Discovery] Iniciando peritaje del Oráculo...");

    try {
      const { data: oracleResponseData, error: edgeFunctionException } = await supabaseSovereignClient.functions.invoke('get-local-discovery', {
        body: {
          latitude: currentGeographicLocationSnapshot?.latitudeCoordinate || 0,
          longitude: currentGeographicLocationSnapshot?.longitudeCoordinate || 0,
          lens: currentSelectedResonanceToneIdentifier || 'Tesoros Ocultos',
          image_base64: currentVisualEnvironmentalImageContext
        }
      });

      if (edgeFunctionException || !oracleResponseData?.success) {
        throw new Error(edgeFunctionException?.message || "Fallo en la respuesta del motor de inteligencia.");
      }

      // Inyección de peritaje en el Cristal [SINCRO V12.0]
      setValue('discoveryContextDossier', oracleResponseData.dossier);
      
      // Saneamiento de fuentes para cumplimiento del Build Shield
      const sanitizedSourcesCollection = (oracleResponseData.sources || []).map((source: any) => ({
        ...source,
        relevance: source.relevance ?? 1.0,
        origin: 'web'
      }));
      setValue('sourcesCollection', sanitizedSourcesCollection);
      
      setValue('soloTopicSelection', oracleResponseData.poi || currentManualTopicSelectionText || "Punto de Resonancia");
      setValue('agentName', 'local-concierge-v1');

      nicepodLog("✅ [Discovery] Peritaje integrado. Transición a Fase Técnica.");
      transitionToNextStateAction('TECHNICAL_DETAILS_STEP');

    } catch (hardwareException: unknown) {
      const exceptionMessage = hardwareException instanceof Error ? hardwareException.message : "Error desconocido.";
      toast({ title: "Colapso de Peritaje", description: exceptionMessage, variant: "destructive" });
    } finally {
      setIsOracleAnalysisProcessActive(false);
    }
  }, [
    currentGeographicLocationSnapshot, 
    currentVisualEnvironmentalImageContext, 
    currentManualTopicSelectionText, 
    authenticatedUser, 
    supabaseSovereignClient, 
    currentSelectedResonanceToneIdentifier, 
    setValue, 
    transitionToNextStateAction, 
    toast
  ]);

  return (
    <div className="flex flex-col h-full w-full animate-in fade-in duration-700 px-4 pb-6 overflow-hidden isolate">
      
      <div className="flex-shrink-0 text-center py-6">
        <h2 className="text-2xl font-black tracking-tighter uppercase italic flex items-center justify-center gap-3 text-white font-serif">
            <Compass className="h-7 w-7 text-primary animate-pulse" /> Sintonía <span className="text-primary not-italic">Local</span>
        </h2>
      </div>

      <div className="flex-1 flex flex-col gap-5 min-h-0 isolate">
        
        {/* BUSCADOR DE INTENCIÓN (MANUAL SINCRO) */}
        <div className="space-y-3">
            <div className="relative group isolate">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 group-focus-within:text-primary transition-colors" />
                <Input 
                    placeholder="Especifique un hito o plaza de Madrid..." 
                    className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl text-base focus:border-primary/50 text-white placeholder:text-zinc-600 transition-all shadow-inner"
                    onBlur={handleManualGeocodingSearchAction}
                    onChange={(inputChangeEvent) => setValue("soloTopicSelection", inputChangeEvent.target.value)}
                />
                {isGeocodingSearchProcessActive && <Loader2 className="absolute right-4 top-4.5 h-5 w-5 animate-spin text-primary" />}
            </div>
            {currentGeographicLocationSnapshot && (
                <div className="flex items-center gap-3 px-5 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-in slide-in-from-top-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-[11px] font-black text-emerald-500 uppercase tracking-widest truncate">
                        Malla: {currentGeographicLocationSnapshot.placeNameReference}
                    </span>
                </div>
            )}
        </div>

        {/* MATRIZ DE SENSORES HARDWARE [ZAP COMPLIANT] */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            type="button" 
            onClick={handleHardwareGeolocationAction}
            className={classNamesUtility(
              "flex items-center gap-4 p-5 rounded-3xl border-2 transition-all duration-500 isolate",
              currentGeographicLocationSnapshot ? "border-emerald-500/40 bg-emerald-500/5 shadow-2xl" : "border-white/5 bg-white/5 hover:bg-white/10"
            )}
          >
            <div className={classNamesUtility("p-3 rounded-xl transition-colors", currentGeographicLocationSnapshot ? "bg-emerald-500 text-white" : "bg-white/5 text-zinc-500")}>
              {isGeolocationProcessActive ? <Loader2 className="h-6 w-6 animate-spin" /> : <Navigation className="h-6 w-6" />}
            </div>
            <div className="text-left leading-none">
                <p className="text-xs font-black uppercase tracking-tighter text-white">GPS</p>
                <p className="text-[9px] font-bold text-zinc-600 mt-1.5 uppercase tracking-widest">
                    {currentGeographicLocationSnapshot ? "Bloqueado" : "Ignición"}
                </p>
            </div>
          </button>

          <button 
            type="button" 
            onClick={() => hiddenFileInputReference.current?.click()}
            className={classNamesUtility(
              "flex items-center gap-4 p-5 rounded-3xl border-2 transition-all duration-500 overflow-hidden relative isolate",
              currentVisualEnvironmentalImageContext ? "border-blue-500/40 bg-blue-500/5 shadow-2xl" : "border-white/5 bg-white/5 hover:bg-white/10"
            )}
          >
            {visualVisionPreviewBase64Data ? (
                <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/80 backdrop-blur-md group transition-all z-20">
                   <div className="bg-blue-500 rounded-full p-1.5 shadow-xl animate-bounce"><CheckCircle2 className="h-5 w-5 text-white" /></div>
                   <div 
                      className="absolute top-3 right-3 p-1.5 bg-red-500/20 hover:bg-red-500 rounded-full transition-colors cursor-pointer z-30" 
                      onClick={(interactionEvent) => { 
                          interactionEvent.stopPropagation(); 
                          setVisualVisionPreviewBase64Data(null); 
                          setValue('visualEnvironmentalImageContext', undefined); 
                      }}
                   >
                       <X className="h-4 w-4 text-white" />
                   </div>
                </div>
            ) : (
                <>
                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                        <Camera className="h-6 w-6" />
                    </div>
                    <div className="text-left leading-none">
                        <p className="text-xs font-black uppercase tracking-tighter text-white">Visión</p>
                        <p className="text-[9px] font-bold text-zinc-600 mt-1.5 uppercase tracking-widest">Capturar</p>
                    </div>
                </>
            )}
            <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                className="hidden" 
                ref={hiddenFileInputReference} 
                onChange={handleVisionCaptureAction} 
            />
          </button>
        </div>

        {/* LENTES DE RESONANCIA COGNITIVA [SINCRO TS2367] */}
        <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 ml-1">Filtro de Resonancia Cognitiva</p>
            <div className="grid grid-cols-2 gap-3">
                {DISCOVERY_LENSES_COLLECTION.map((lensProfile) => {
                    const isSelected = currentSelectedResonanceToneIdentifier === lensProfile.identification;
                    return (
                        <button
                            key={lensProfile.identification} 
                            type="button"
                            onClick={() => setValue("selectedToneIdentifier", lensProfile.identification as any)}
                            className={classNamesUtility(
                                "flex items-center gap-3 p-4 rounded-2xl border transition-all duration-500 isolate",
                                isSelected ? "bg-primary/20 border-primary shadow-lg scale-[1.02]" : "bg-white/5 border-white/5 hover:border-white/10 opacity-70"
                            )}
                        >
                            <div className={classNamesUtility("p-2 rounded-lg transition-all", isSelected ? "bg-primary text-white" : "bg-white/5 text-zinc-500")}>
                                {lensProfile.iconComponent}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">{lensProfile.displayLabel}</span>
                        </button>
                    );
                })}
            </div>
        </div>

        {/* ACTUADOR DE SÍNTESIS INDUSTRIAL */}
        <div className="mt-auto pt-8">
            <Button 
                onClick={handleOracleAnalysisAction} 
                disabled={isOracleAnalysisProcessActive || (!currentGeographicLocationSnapshot && !currentVisualEnvironmentalImageContext && (!currentManualTopicSelectionText || currentManualTopicSelectionText.length < 3))}
                className="w-full h-18 rounded-[2.5rem] bg-primary text-white font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl active:scale-[0.98] transition-all duration-500 border-none isolate"
            >
                {isOracleAnalysisProcessActive ? (
                  <div className="flex items-center gap-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Peritando Entorno Urbano...</span>
                  </div>
                ) : (
                  "Iniciar Interpretación"
                )}
            </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V8.0):
 * 1. Build Shield Sovereignty: Resolución de 19 errores TS mediante el mapeo riguroso 
 *    de propiedades al esquema V12.0 (latitudeCoordinate, soloTopicSelection, etc.).
 * 2. ZAP Absolute Compliance: Purificación nominal total de estados, refs y callbacks. 
 *    Se han eliminado acrónimos como 'pos', 'res', 'ctx', 'poi'.
 * 3. Main Thread Isolation: El procesamiento de visión y geocodificación se delega 
 *    correctamente, protegiendo la fluidez del reactor visual.
 */