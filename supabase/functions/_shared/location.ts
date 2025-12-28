// supabase/functions/_shared/location.ts
// VERSIÓN: 1.0 (NicePod Spatial Engine - Reverse Geocoding)

/**
 * Estructura de respuesta de localización humanizada.
 */
export interface HumanizedPlace {
  placeName: string;
  cityName: string;
  country: string;
}

/**
 * Traduce coordenadas geográficas (Lat/Lng) a nombres de lugares legibles.
 * Utiliza el servicio Nominatim de OpenStreetMap con User-Agent corporativo.
 */
export async function getPlaceFromCoordinates(latitude: number, longitude: number): Promise<HumanizedPlace> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'NicePod-Situational-Engine/1.0 (admin@nicepod.io)'
      }
    });

    if (!response.ok) throw new Error("Servicio de geocodificación no disponible.");

    const data = await response.json();
    const address = data.address || {};

    return {
      placeName: data.display_name?.split(',')[0] || "Ubicación actual",
      cityName: address.city || address.town || address.village || "Área metropolitana",
      country: address.country || "Planeta Tierra"
    };
  } catch (error) {
    console.error("Critical Location Error:", error);
    // Fallback robusto para no detener el flujo si el servicio de mapas falla
    return {
      placeName: "Lugar de interés",
      cityName: "Exploración Local",
      country: ""
    };
  }
}