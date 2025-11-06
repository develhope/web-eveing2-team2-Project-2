import { useState, useEffect } from "react";
import { mapOMToOWMStyle } from "../utils/weatherAdapter";

function useWeather(coordinates) {
  const [weather, setWeather] = useState(null);
  const [timezone, setTimezone] = useState("Europe/Rome");
  const [weatherError, setWeatherError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!coordinates) return;

    const fetchWeather = async () => {
      setLoading(true);
      setWeatherError("");

      try {
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coordinates.lat}&longitude=${coordinates.lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,precipitation_probability,cloudcover,wind_speed_10m,wind_direction_10m,uv_index,surface_pressure,weathercode&daily=sunrise,sunset&timezone=auto`;

        const weatherRes = await fetch(weatherUrl);
        const data = await weatherRes.json();

        if (!data || !data.current || !data.daily) {
          setWeatherError("Dati meteo non disponibili.");
          return;
        }

        const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${coordinates.lat}&longitude=${coordinates.lon}&current=european_aqi`;
        const airRes = await fetch(airUrl);
        const airData = await airRes.json();

        // Mappa meteo → icona + descrizione
        const { icon, description } = mapOMToOWMStyle(
          data.current.weathercode,
          data.current.precipitation_probability ??
            data.hourly?.precipitation_probability?.[0] ??
            0
        );

        setWeather({
          // Dati principali
          temperature_2m: data.current.temperature_2m,
          apparent_temperature: data.current.apparent_temperature,
          relative_humidity_2m: data.current.relative_humidity_2m,

          // Precipitazioni e probabilità (con fallback)
          precipitation: data.current.precipitation,
          precipitation_probability:
            data.current.precipitation_probability ??
            data.hourly?.precipitation_probability?.[0] ??
            0,

          // Nuvolosità e pressione
          cloudcover: data.current.cloudcover,
          surface_pressure: data.current.surface_pressure,

          // Vento (convertito da m/s → km/h)
          wind_speed_10m: data.current.wind_speed_10m * 3.6,
          wind_direction_10m: data.current.wind_direction_10m,

          // UV Index
          uv_index: data.current.uv_index,

          // Icona e descrizione meteo
          iconType: icon,
          description: description,

          // Alba e tramonto
          sunrise: data.daily.sunrise[0],
          sunset: data.daily.sunset[0],

          // Qualità dell’aria (se disponibile)
          air_quality: airData?.current
            ? {
                european_aqi: airData.current.european_aqi,
              }
            : null,
        });

        let tz = data.timezone;

        // A volte Open-Meteo restituisce solo "auto" o "GMT"
        if (!tz || ["auto", "GMT"].includes(tz) || !tz.includes("/")) {
          // fallback su Europe/Rome, ma verifica offset DST fornito
          const offsetHours = (data.utc_offset_seconds ?? 3600) / 3600;
          // Se offset = 2 → è ora legale (CEST)
          // offset = 1 → ora solare (CET)
          console.log("Offset orario:", offsetHours, "h");
          tz = "Europe/Rome";
        }
        setTimezone(tz);
      } catch (error) {
        console.error(error);
        setWeatherError("Errore nella richiesta meteo.");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [coordinates]);

  return { weather, timezone, weatherError, loading };
}

export default useWeather;
