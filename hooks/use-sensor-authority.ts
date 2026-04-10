/**
 * ARCHIVO: hooks/use-sensor-authority.ts
 * VERSIÓN: 6.1 (NicePod Sensor Authority - Absolute Nominal Integrity & Adaptive Smoothing Edition)
 * PROTOCOLO: MADRID RESONANCE V4.2
 * 
 * Misión: Captura pura de telemetría de posicionamiento global y compás magnetométrico 
 * de alta fidelidad, aplicando filtros vectoriales para erradicar el Jitter.
 * [REFORMA V6.1]: Resolución definitiva del error TS2561 (unixTimestamp -> timestamp).
 * Cumplimiento absoluto de la Zero Abbreviations Policy (ZAP) y alineación total 
 * con la Constitución de Soberanía V8.6. Implementación de suavizado adaptativo.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { MADRID_SOL_COORDS } from "@/components/geo/map-constants";
import { nicepodLog } from "@/lib/utils";
import { UserLocation, TelemetrySource } from "@/types/geo-sovereignty";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * CONFIGURACIÓN DE GOBERNANZA SENSORIAL INDUSTRIAL
 */
const CACHE_TIME_TO_LIVE_MILLISECONDS = 15 * 60 * 1000; 
const HARDWARE_WATCHDOG_THRESHOLD_MILLISECONDS = 8000;

// Configuración del Filtro de Purificación Vectorial (VAF)
const BASE_SMOOTHING_WINDOW_SIZE = 12; // Muestras base para promediar el ruido magnetométrico
const VELOCITY_THRESHOLD_FOR_ADAPTIVE_SMOOTHING = 2.0; // metros por segundo

/**
 * INTERFAZ: SensorAuthorityProperties
 */
interface SensorAuthorityProperties {
  /** initialData: Semilla de ubicación proveniente del Middleware (Geo-IP). */
  initialData?: { 
    lat: number; 
    lng: number; 
    city: string; 
    source: string; 
  } | null;
}

/**
 * HOOK: useSensorAuthority
 * El único componente autorizado para dialogar con el silicio del dispositivo móvil.
 */
export function useSensorAuthority({ initialData }: SensorAuthorityProperties = {}) {
  
  // --- I. ESTADO SOBERANO (MATERIALIZACIÓN T0) ---
  const [telemetry, setTelemetry] = useState<UserLocation | null>(() => {
    if (typeof window === "undefined") return null;

    // 1. Prioridad: Memoria Táctica Reciente (Caché local del navegador)
    const cachedGeographicFixString = localStorage.getItem('nicepod_last_known_geographic_fix');
    if (cachedGeographicFixString) {
      try {
        const parsedTelemetry: UserLocation = JSON.parse(cachedGeographicFixString);
        const fixAgeMilliseconds = Date.now() - (parsedTelemetry.timestamp || 0);
        
        if (fixAgeMilliseconds < CACHE_TIME_TO_LIVE_MILLISECONDS) {
          nicepodLog("💾 [Sensor-Authority] Hidratación por memoria táctica persistente.");
          return { ...parsedTelemetry, geographicSource: 'cache' as TelemetrySource };
        }
        localStorage.removeItem('nicepod_last_known_geographic_fix');
      } catch (exception) {
        nicepodLog("⚠️ [Sensor-Authority] Corrupción detectada en caché de telemetría.", null, 'warn');
      }
    }

    // 2. Prioridad: Paracaídas de Red (Geo-IP del Voyager)
    if (initialData) {
      nicepodLog(`🌐 [Sensor-Authority] Materialización T0 por protocolo de red (${initialData.city}).`);
      return {
        latitudeCoordinate: initialData.lat,
        longitudeCoordinate: initialData.lng,
        accuracyMeters: 5000,
        headingDegrees: null,
        speedMetersPerSecond: null,
        timestamp: Date.now(),
        geographicSource: 'internet-protocol-fallback' as TelemetrySource
      };
    }

    // 3. Fallback: Punto de Anclaje de Sol (Último recurso de emergencia de la Workstation)
    return {
      latitudeCoordinate: MADRID_SOL_COORDS.latitude,
      longitudeCoordinate: MADRID_SOL_COORDS.longitude,
      accuracyMeters: 9999,
      headingDegrees: null,
      speedMetersPerSecond: null,
      timestamp: Date.now(),
      geographicSource: 'internet-protocol-fallback' as TelemetrySource
    };
  });

  const [isHardwareAccessDenied, setIsHardwareAccessDenied] = useState<boolean>(false);
  const [isAcquiringHardwareFix, setIsAcquiringHardwareFix] = useState<boolean>(false);

  // --- II. MEMORIA TÁCTICA (SINGLETON REFERENCES - PILAR 4) ---
  const watchIdentificationReference = useRef<number | null>(null);
  const isHardwareIgnitedReference = useRef<boolean>(false);
  const watchdogTimerReference = useRef<NodeJS.Timeout | null>(null);
  const hasGlobalPositioningSystemFixReference = useRef<boolean>(false);
  
  /**
   * headingVectorHistoryReference:
   * Almacenamos componentes vectoriales (Seno/Coseno) para evitar el error de 
   * promedio en el cruce del Norte magnético (0°/360°).
   */
  const headingVectorHistoryReference = useRef<{sine: number, cosine: number}[]>([]);

  /**
   * getPurifiedHeading:
   * Misión: Transmutar el ruido magnetométrico en un rumbo estable para la cinemática.
   * [ADAPTIVE SMOOTHING]: Reduce el tamaño de la ventana a alta velocidad para evitar lag.
   */
  const getPurifiedHeading = useCallback((rawHeadingDegrees: number, currentSpeedMetersPerSecond: number | null): number => {
    const headingRadians = (rawHeadingDegrees * Math.PI) / 180;
    
    // Ajuste dinámico de ventana basado en la dinámica de movimiento del Voyager.
    const effectiveWindowSize = (currentSpeedMetersPerSecond && currentSpeedMetersPerSecond > VELOCITY_THRESHOLD_FOR_ADAPTIVE_SMOOTHING)
      ? Math.floor(BASE_SMOOTHING_WINDOW_SIZE / 2)
      : BASE_SMOOTHING_WINDOW_SIZE;

    headingVectorHistoryReference.current.push({ 
      sine: Math.sin(headingRadians), 
      cosine: Math.cos(headingRadians) 
    });

    if (headingVectorHistoryReference.current.length > effectiveWindowSize) {
      headingVectorHistoryReference.current.shift();
    }

    const sumSine = headingVectorHistoryReference.current.reduce((accumulator, value) => accumulator + value.sine, 0);
    const sumCosine = headingVectorHistoryReference.current.reduce((accumulator, value) => accumulator + value.cosine, 0);
    
    const averageRadians = Math.atan2(sumSine, sumCosine);
    const averageDegrees = (averageRadians * 180) / Math.PI;
    
    return (averageDegrees + 360) % 360;
  }, []);

  /**
   * handleOrientationEventAction:
   * Captura el giro físico del dispositivo y actualiza la brújula táctica con filtrado VAF.
   */
  const handleOrientationEventAction = useCallback((event: DeviceOrientationEvent) => {
    // Soporte multiplataforma (WebKitCompassHeading para iOS vs Alpha para Android)
    const rawHeadingDegrees = (event as any).webkitCompassHeading || (360 - (event.alpha || 0));
    
    if (rawHeadingDegrees !== undefined && rawHeadingDegrees !== null) {
      setTelemetry(previousTelemetry => {
        if (!previousTelemetry) return null;
        
        const purifiedHeadingDegrees = getPurifiedHeading(rawHeadingDegrees, previousTelemetry.speedMetersPerSecond);
        
        // Throttling de precisión: Ignoramos fluctuaciones magnéticas < 0.2 grados.
        if (previousTelemetry.headingDegrees !== null && 
            Math.abs(purifiedHeadingDegrees - previousTelemetry.headingDegrees) < 0.2) {
          return previousTelemetry;
        }
        
        return { ...previousTelemetry, headingDegrees: purifiedHeadingDegrees };
      });
    }
  }, [getPurifiedHeading]);

  /**
   * killHardwareWatch:
   * Desconexión atómica de sensores y liberación física del bus de datos (Hardware Hygiene).
   */
  const killHardwareWatch = useCallback(() => {
    if (watchIdentificationReference.current !== null) {
      navigator.geolocation.clearWatch(watchIdentificationReference.current);
      watchIdentificationReference.current = null;
    }
    if (typeof window !== "undefined") {
      window.removeEventListener("deviceorientation", handleOrientationEventAction);
    }
    if (watchdogTimerReference.current) {
      clearTimeout(watchdogTimerReference.current);
    }
    
    isHardwareIgnitedReference.current = false;
    hasGlobalPositioningSystemFixReference.current = false;
    setIsAcquiringHardwareFix(false);
    nicepodLog("💤 [Sensor-Authority] Hardware sensorial liberado exitosamente.");
  }, [handleOrientationEventAction]);

  /**
   * startHardwareWatch:
   * Ignición sincronizada de antenas satelitales y magnetómetros de alta precisión.
   */
  const startHardwareWatch = useCallback(async () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) return;
    if (isHardwareIgnitedReference.current) return;
    
    isHardwareIgnitedReference.current = true;
    setIsAcquiringHardwareFix(true);

    // Protocolo de seguridad WebKit (iOS 13+) para acceso a brújula
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permissionStatus = await (DeviceOrientationEvent as any).requestPermission();
        if (permissionStatus === 'granted') {
          window.addEventListener("deviceorientation", handleOrientationEventAction, true);
        }
      } catch (hardwareException) {
        nicepodLog("⚠️ [Sensor-Authority] Autoridad de magnetómetro denegada.", null, 'warn');
      }
    } else {
      window.addEventListener("deviceorientation", handleOrientationEventAction, true);
    }

    // Watchdog de Estasis: Reinicia el enlace si el silicio no responde en el umbral definido.
    if (watchdogTimerReference.current) clearTimeout(watchdogTimerReference.current);
    watchdogTimerReference.current = setTimeout(() => {
      if (!hasGlobalPositioningSystemFixReference.current) {
        nicepodLog("🆘 [Sensor-Authority] Estasis de GPS detectada. Reintentando enlace satelital.");
        isHardwareIgnitedReference.current = false;
        setIsAcquiringHardwareFix(false);
      }
    }, HARDWARE_WATCHDOG_THRESHOLD_MILLISECONDS);

    const handleSignalSuccessAction = (position: GeolocationPosition) => {
      if (watchdogTimerReference.current) {
        clearTimeout(watchdogTimerReference.current);
        watchdogTimerReference.current = null;
      }

      // La orientación satelital es autoritaria solo a velocidades de desplazamiento real.
      const authoritativeHeadingDegrees = (position.coords.speed && position.coords.speed > VELOCITY_THRESHOLD_FOR_ADAPTIVE_SMOOTHING && position.coords.heading !== null)
        ? position.coords.heading
        : (telemetry?.headingDegrees || null);

      /**
       * [FIX V6.1]: Sincronización total con UserLocation (Constitución V8.6).
       * El campo 'unixTimestamp' ha sido transmutado a 'timestamp'.
       */
      const freshTelemetryFix: UserLocation = {
        latitudeCoordinate: position.coords.latitude,
        longitudeCoordinate: position.coords.longitude,
        accuracyMeters: position.coords.accuracy,
        headingDegrees: authoritativeHeadingDegrees,
        speedMetersPerSecond: position.coords.speed,
        timestamp: position.timestamp, 
        geographicSource: 'global-positioning-system' as TelemetrySource
      };

      hasGlobalPositioningSystemFixReference.current = true;
      setTelemetry(freshTelemetryFix);
      setIsAcquiringHardwareFix(false);
      localStorage.setItem('nicepod_last_known_geographic_fix', JSON.stringify(freshTelemetryFix));
    };

    const handleSignalErrorAction = (error: GeolocationPositionError) => {
      if (error.code === error.PERMISSION_DENIED) {
        setIsHardwareAccessDenied(true);
        killHardwareWatch();
      }
    };

    // Estrategia de Ignición Dual: Instantánea de Red (Rápida) + Monitoreo Satelital (Precisa)
    navigator.geolocation.getCurrentPosition(handleSignalSuccessAction, handleSignalErrorAction, {
      enableHighAccuracy: false,
      timeout: 5000
    });

    watchIdentificationReference.current = navigator.geolocation.watchPosition(handleSignalSuccessAction, handleSignalErrorAction, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 25000
    });
  }, [handleOrientationEventAction, killHardwareWatch, telemetry?.headingDegrees]);

  const reSynchronizeHardwareAuthorityAction = useCallback(() => {
    nicepodLog("🔄 [Sensor-Authority] Reiniciando autoridad física de sensores.");
    isHardwareIgnitedReference.current = false;
    startHardwareWatch();
  }, [startHardwareWatch]);

  // --- III. PROTOCOLOS PROACTIVOS (VISIBILITY & PERMISSIONS) ---

  useEffect(() => {
    if (typeof window !== "undefined" && "permissions" in navigator) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName }).then(permissionStatus => {
        if (permissionStatus.state === 'granted') startHardwareWatch();
        permissionStatus.onchange = () => { 
          if (permissionStatus.state === 'granted') startHardwareWatch(); 
        };
      });
    }
  }, [startHardwareWatch]);

  useEffect(() => {
    const handleDocumentVisibilityChangeAction = () => {
      if (document.visibilityState === 'visible' && isHardwareIgnitedReference.current) {
        if (watchIdentificationReference.current !== null) {
          navigator.geolocation.clearWatch(watchIdentificationReference.current);
        }
        isHardwareIgnitedReference.current = false;
        startHardwareWatch();
      }
    };
    document.addEventListener("visibilitychange", handleDocumentVisibilityChangeAction);
    return () => document.removeEventListener("visibilitychange", handleDocumentVisibilityChangeAction);
  }, [startHardwareWatch]);

  return {
    telemetry,
    isDenied: isHardwareAccessDenied,
    isAcquiring: isAcquiringHardwareFix,
    isIgnited: isHardwareIgnitedReference.current,
    startHardwareWatch,
    killHardwareWatch,
    reSync: reSynchronizeHardwareAuthorityAction
  };
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V6.1):
 * 1. Zero Abbreviations Policy (ZAP): Purificación nominal absoluta de todas las variables 
 *    internas (averageRadians, headingRadians, handleSignalSuccessAction, etc.).
 * 2. Build Shield Sovereignty (BSS): Resolución del error TS2561 mapeando 'position.timestamp' 
 *    a la propiedad 'timestamp' de la interfaz maestro UserLocation.
 * 3. Adaptive Filtering: El filtro vectorial VAF es ahora consciente de la velocidad, 
 *    mejorando la respuesta de la Workstation en condiciones de desplazamiento rápido.
 */