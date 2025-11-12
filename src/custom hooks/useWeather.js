import { useState, useEffect } from "react";
import { mapOMToOWMStyle } from "../utils/weatherAdapter";

/**
 * Hook meteo centralizzato:
 * - UNA richiesta a Open-Meteo che include current + hourly + daily (10 giorni).
 * - Espone: weather (oggetto corrente + aqi opzionale) + timezone + hourlyNorm + dailyNorm.
 * - Minimizza richieste e normalizza i dati per tutti i componenti.
 */
function useWeather(coordinates) {
  const [weather, setWeather] = useState(null);
  const [timezone, setTimezone] = useState("Europe/Rome");
  const [weatherError, setWeatherError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Evita fetch se coordinate non valide.
    if (!coordinates || typeof coordinates.lat !== "number" || typeof coordinates.lon !== "number") return;

    const fetchWeather = async () => {
      setLoading(true);
      setWeatherError("");

      try {
        const url = new URL("https://api.open-meteo.com/v1/forecast");
        url.searchParams.set("latitude", String(coordinates.lat));
        url.searchParams.set("longitude", String(coordinates.lon));
        url.searchParams.set("timezone", "auto");

        // unità (convertibili se serve)
        url.searchParams.set("temperature_unit", "celsius");
        url.searchParams.set("windspeed_unit", "kmh");

        // current: campi per card "Adesso"
        url.searchParams.set(
          "current",
          [
            "temperature_2m",
            "apparent_temperature",
            "relative_humidity_2m",
            "precipitation",
            "precipitation_probability",
            "cloudcover",
            "wind_speed_10m",
            "wind_direction_10m",
            "uv_index",
            "surface_pressure",
            "weathercode",
          ].join(",")
        );

        // hourly: temp, prob. pioggia, vento, codice meteo
        url.searchParams.set(
          "hourly",
          ["temperature_2m", "precipitation_probability", "wind_speed_10m", "weathercode"].join(",")
        );

        // daily: 10 giorni, nessun passato
        url.searchParams.set("past_days", "0");
        url.searchParams.set("forecast_days", "10");
        url.searchParams.set(
          "daily",
          [
            "weathercode",
            "temperature_2m_max",
            "temperature_2m_min",
            "precipitation_probability_mean",
            "windspeed_10m_max",
            "sunrise",
            "sunset",
          ].join(",")
        );

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`);
        const data = await res.json();

        if (!data || !data.current) {
          setWeatherError("Dati meteo non disponibili.");
          setWeather(null);
          return;
        }

        // Icona + descrizione corrente (stile OpenWeather) in base al codice WMO + pop.
        const { icon, description } = mapOMToOWMStyle(
          data.current.weathercode,
          data.current.precipitation_probability ??
            data.hourly?.precipitation_probability?.[0] ??
            0
        );

        // Normalizza una volta sola (timezone + array hourly/daily pronti).
        const tz = data.timezone && data.timezone.includes("/") && data.timezone !== "auto"
          ? data.timezone
          : "Europe/Rome";
        const hourlyNorm = normalizeHourly(data, tz);
        const dailyNorm  = normalizeDaily(data, "it");

        // Oggetto per la card "Adesso"
        const currentObj = {
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
          // m/s → km/h
          wind_speed_10m: (data.current.wind_speed_10m ?? 0) * 3.6,
          wind_direction_10m: data.current.wind_direction_10m,
          uv_index: data.current.uv_index,
          iconType: icon,
          description,
          sunrise: data.daily?.sunrise?.[0],
          sunset:  data.daily?.sunset?.[0],
        };

        // (Opzionale) AQI – nessun crash se fallisce.
        let airQuality = null;
        try {
          const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${coordinates.lat}&longitude=${coordinates.lon}&current=european_aqi`;
          const airRes = await fetch(airUrl);
          if (airRes.ok) {
            const airData = await airRes.json();
            airQuality = airData?.current ? { european_aqi: airData.current.european_aqi } : null;
          }
        } catch {
          // Ignora errori AQI.
        }

        setTimezone(tz);
        setWeather({
          ...currentObj,
          air_quality: airQuality,
          hourlyNorm,
          dailyNorm,
        });
      } catch (err) {
        console.error(err);
        setWeatherError("Errore nella richiesta meteo.");
        setWeather(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [coordinates]);

  return { weather, timezone, weatherError, loading };
}

export default useWeather;

/* ---------- Normalizzazioni ---------- */

/**
 * Normalizza le ore in:
 * [{ iso, label, labelFull, temp, pop, wind, mood }]
 */
function normalizeHourly(j, tz) {
  const t   = j?.hourly?.time || [];
  const tmp = j?.hourly?.temperature_2m || [];
  const pop = j?.hourly?.precipitation_probability || [];
  const wnd = j?.hourly?.wind_speed_10m || [];
  const wmo = j?.hourly?.weathercode || [];

  const out = [];
  for (let i = 0; i < t.length; i++) {
    const iso = t[i]; // YYYY-MM-DDTHH:00
    const d   = new Date(iso);
    const hourLabel = d.toLocaleTimeString("it-IT", { timeZone: tz, hour: "2-digit", minute: "2-digit" });
    const dayLabel  = d.toLocaleDateString("it-IT", { timeZone: tz, weekday: "short", day: "2-digit", month: "short" });

    out.push({
      iso,
      label: hourLabel, // "Adesso" lo gestiamo in App/Hourly per il primo elemento del giorno
      labelFull: `${dayLabel} • ${hourLabel}`,
      temp: tmp[i],
      pop: pop[i],
      wind: typeof wnd[i] === "number" ? wnd[i] * 3.6 : null, // m/s → km/h
      mood: codeToMood(wmo[i]),
    });
  }
  return out;
}

/**
 * Normalizza i giorni in:
 * [{ date, weekday, dateLabel, tmax, tmin, pop, wind, mood }]
 */
function normalizeDaily(j, lang = "it") {
  const d = j?.daily || {};
  const n = d.time?.length || 0;
  const fmt = new Intl.DateTimeFormat(lang, { weekday: "short", day: "2-digit", month: "short" });

  const out = [];
  for (let i = 0; i < n; i++) {
    const iso = d.time[i]; // YYYY-MM-DD
    const date = new Date(iso + "T12:00:00");
    out.push({
      date: iso,
      weekday: fmt.format(date).split(" ")[0],
      dateLabel: fmt.format(date),
      tmax: d.temperature_2m_max?.[i],
      tmin: d.temperature_2m_min?.[i],
      pop:  d.precipitation_probability_mean?.[i],
      wind: d.windspeed_10m_max?.[i],
      mood: codeToMood(d.weathercode?.[i]),
    });
  }
  return out;
}

/** Mappa codice WMO → mood icona testuale usata da <IconWeather />. */
function codeToMood(c) {
  if (c === 0) return "clear";
  if ([1, 2, 3].includes(c)) return "clouds";
  if ([45, 48].includes(c)) return "mist";
  if ([51, 53, 55, 56, 57].includes(c)) return "drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(c)) return "rain";
  if ([71, 73, 75, 77, 85, 86].includes(c)) return "snow";
  if ([95, 96, 99].includes(c)) return "storm";
  return "clouds";
}
