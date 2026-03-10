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
        const tz = tzlookup(coordinates.lat, coordinates.lon);
        setTimezone(tz);

        // 👉 Estendiamo la richiesta Open-Meteo per includere gli hourly
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${
          coordinates.lat
        }&longitude=${
          coordinates.lon
        }&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,precipitation_probability,cloudcover,wind_speed_10m,wind_direction_10m,uv_index,surface_pressure,weathercode&hourly=temperature_2m,precipitation_probability,wind_speed_10m,weathercode&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,weathercode&timezone=${encodeURIComponent(
          tz
        )}`;

        const weatherRes = await fetch(weatherUrl);
        const data = await weatherRes.json();

        if (!data || !data.current || !data.daily || !data.hourly) {
          setError("Dati meteo non disponibili.");
          setLoading(false);
          return;
        }

        // AQI (opzionale)
        const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${
          coordinates.lat
        }&longitude=${
          coordinates.lon
        }&current=european_aqi&timezone=${encodeURIComponent(tz)}`;
        const airRes = await fetch(airUrl);
        const airData = await airRes.json();

        // 🕒 Normalizza dati orari
        const hourlyNorm = data.hourly.time.map((t, i) => {
          const dt = DateTime.fromISO(t, { zone: tz });
          const { icon: mood } = mapOMToOWMStyle(data.hourly.weathercode[i]);
          return {
            iso: t,
            label: dt.toFormat("HH:mm"),
            labelFull: dt.toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY),
            temp: data.hourly.temperature_2m[i],
            pop: data.hourly.precipitation_probability[i],
            wind: data.hourly.wind_speed_10m[i] * 3.6, // m/s → km/h
            mood,
          };
        });

        // 📆 Normalizza dati giornalieri
        const dailyNorm = data.daily.time.map((t, i) => {
          const dt = DateTime.fromISO(t, { zone: tz });
          const { icon: mood } = mapOMToOWMStyle(data.daily.weathercode[i]);
          return {
            date: t,
            label: dt.toFormat("ccc d"),
            tempMax: data.daily.temperature_2m_max[i],
            tempMin: data.daily.temperature_2m_min[i],
            pop: data.daily.precipitation_probability_max[i],
            sunrise: data.daily.sunrise[i],
            sunset: data.daily.sunset[i],
            mood,
          };
        });

        // 🌅 Alba/tramonto del giorno
        const parseSunTimeLuxon = (str) => {
          const dt = DateTime.fromISO(str, { zone: tz });
          return dt.isValid ? dt.toFormat("HH:mm") : "N/D";
        };
        const sunriseLocal = parseSunTimeLuxon(data.daily.sunrise[0]);
        const sunsetLocal = parseSunTimeLuxon(data.daily.sunset[0]);

        // 🌦️ Stato attuale
        const { icon, description } = mapOMToOWMStyle(
          data.current.weathercode,
          data.current.precipitation_probability ??
            data.hourly.precipitation_probability?.[0] ??
            0
        );

        setWeather({
          temperature_2m: data.current.temperature_2m,
          apparent_temperature: data.current.apparent_temperature,
          relative_humidity_2m: data.current.relative_humidity_2m,
          precipitation: data.current.precipitation,
          precipitation_probability:
            data.current.precipitation_probability ??
            data.hourly.precipitation_probability?.[0] ??
            0,
          cloudcover: data.current.cloudcover,
          surface_pressure: data.current.surface_pressure,
          wind_speed_10m: data.current.wind_speed_10m * 3.6,
          wind_direction_10m: data.current.wind_direction_10m,
          uv_index: data.current.uv_index,
          iconType: icon,
          description,
          sunrise: sunriseLocal,
          sunset: sunsetLocal,
          air_quality: airData?.current
            ? { european_aqi: airData.current.european_aqi }
            : null,

          // 👇 aggiungiamo i due array normalizzati
          hourlyNorm,
          dailyNorm,
        });
      } catch (err) {
        console.error("Errore fetch meteo:", err);
        setError("Errore nella richiesta meteo.");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [coordinates]);

  return { weather, timezone, error, loading };
}

export default useWeather;
