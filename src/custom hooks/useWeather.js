import { useState, useEffect } from "react";
import { DateTime } from "luxon";
import tzlookup from "tz-lookup";
import { mapOMToOWMStyle } from "../utils/weatherAdapter";

function useWeather(coordinates) {
  const [weather, setWeather] = useState(null);
  const [timezone, setTimezone] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!coordinates) return;

    const fetchWeather = async () => {
      setLoading(true);
      setError("");

      try {
        // Trova timezone locale
        const tz = tzlookup(coordinates.lat, coordinates.lon);
        setTimezone(tz);

        // Chiamata meteo
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${
          coordinates.lat
        }&longitude=${
          coordinates.lon
        }&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,precipitation_probability,cloudcover,wind_speed_10m,wind_direction_10m,uv_index,surface_pressure,weathercode&daily=sunrise,sunset&timezone=${encodeURIComponent(
          tz
        )}`;

        const weatherRes = await fetch(weatherUrl);
        const data = await weatherRes.json();

        if (!data || !data.current || !data.daily) {
          setError("Dati meteo non disponibili.");
          setLoading(false);
          return;
        }

        // Chiamata qualità aria
        const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${
          coordinates.lat
        }&longitude=${
          coordinates.lon
        }&current=european_aqi&timezone=${encodeURIComponent(tz)}`;

        const airRes = await fetch(airUrl);
        const airData = await airRes.json();

        // Mappa icona e descrizione meteo
        const { icon, description } = mapOMToOWMStyle(
          data.current.weathercode,
          data.current.precipitation_probability ??
            data.hourly?.precipitation_probability?.[0] ??
            0
        );

        // Parse alba e tramonto (con Luxon)
        const parseSunTimeLuxon = (str, tz) => {
          if (!str) return "N/D";
          const dtLocal = DateTime.fromISO(str, { zone: tz });
          if (!dtLocal.isValid) return "N/D";
          return dtLocal.toFormat("HH:mm");
        };

        const sunriseLocal = parseSunTimeLuxon(data.daily.sunrise[0], tz);
        const sunsetLocal = parseSunTimeLuxon(data.daily.sunset[0], tz);

        setWeather({
          temperature_2m: data.current.temperature_2m,
          apparent_temperature: data.current.apparent_temperature,
          relative_humidity_2m: data.current.relative_humidity_2m,
          precipitation: data.current.precipitation,
          precipitation_probability:
            data.current.precipitation_probability ??
            data.hourly?.precipitation_probability?.[0] ??
            0,
          cloudcover: data.current.cloudcover,
          surface_pressure: data.current.surface_pressure,
          wind_speed_10m: data.current.wind_speed_10m * 3.6,
          wind_direction_10m: data.current.wind_direction_10m,
          uv_index: data.current.uv_index,
          iconType: icon,
          description: description,
          sunrise: sunriseLocal,
          sunset: sunsetLocal,
          air_quality: airData?.current
            ? {
                european_aqi: airData.current.european_aqi,
              }
            : null,
        });
      } catch (err) {
        console.error(err);
        setError("Errore nella richiesta.");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [coordinates]);

  return { weather, timezone, error, loading };
}

export default useWeather;
