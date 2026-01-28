// supabase/functions/geo-suite/_shared/open-meteo.ts
import { WeatherSnapshot } from "./types.ts";

export async function getCurrentWeather(lat: number, lng: number): Promise<WeatherSnapshot> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,is_day,weather_code,wind_speed_10m&timezone=auto`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.current) throw new Error("No weather data");

    const code = data.current.weather_code;
    const condition = decodeWeatherCode(code);

    return {
      temp_c: data.current.temperature_2m,
      is_day: !!data.current.is_day,
      wind_speed: data.current.wind_speed_10m,
      condition: condition
    };
  } catch (e) {
    console.error("Weather Fail:", e);
    // Fallback neutro para no romper el flujo
    return { temp_c: 20, is_day: true, wind_speed: 0, condition: "Unknown" };
  }
}

function decodeWeatherCode(code: number): string {
  if (code === 0) return "Clear Sky";
  if (code <= 3) return "Cloudy";
  if (code <= 48) return "Foggy";
  if (code <= 67) return "Rainy";
  if (code <= 77) return "Snowy";
  return "Stormy";
}