// supabase/functions/geo-suite/_shared/types.ts

export interface GeoCoordinates {
  lat: number;
  lng: number;
  altitude?: number;
  heading?: number; // 0-360
}

export interface WeatherSnapshot {
  temp_c: number;
  condition: string; // 'Sunny', 'Rainy', 'Foggy'
  is_day: boolean;
  wind_speed: number;
}

export interface DetectedPOI {
  id: string; // Google Place ID o OSM ID
  name: string;
  category: string;
  distance_meters: number;
  confidence: number;
}

export interface ContextDossier {
  trace_id: string;
  timestamp: string;
  user_id: string;
  location: GeoCoordinates;

  // Capa Física (Inputs Duros)
  weather: WeatherSnapshot;
  detected_place: DetectedPOI;

  // Capa Cognitiva (Inputs de la Bóveda)
  historical_facts: string[]; // Facts recuperados de 'madrid_vault_knowledge'
  active_events: string[];    // Eventos efímeros cercanos

  // Estado
  vision_analysis?: any; // Si subió foto
  stage: 'raw_ingest' | 'semantic_filtered' | 'script_ready';
}