import React, { useEffect, useMemo, useState } from "react";
import IconWeather from "./IconWeather";

export default function Daily({
  lat,
  lon,
  city,
  units = "metric",
  lang = "it",
  pageSize = 5,
  onMoodChange,
  onData,
}) {
  const [days, setDays] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof lat !== "number" || typeof lon !== "number") return;
    let cancel = false;
    setLoading(true);
    const metric = units === "metric";
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", lat);
    url.searchParams.set("longitude", lon);
    url.searchParams.set("timezone", "auto");
    url.searchParams.set("forecast_days", "10");
    url.searchParams.set(
      "daily",
      "weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_mean,windspeed_10m_max"
    );
    url.searchParams.set("temperature_unit", metric ? "celsius" : "fahrenheit");
    url.searchParams.set("windspeed_unit", metric ? "kmh" : "mph");

    fetch(url)
      .then((r) => r.json())
      .then((j) => {
        if (cancel) return;
        const arr = normalizeDaily(j, lang);
        setDays(arr);
        setPage(0);
        if (onMoodChange && arr[0]?.mood) onMoodChange(arr[0].mood);
        if (onData) onData(arr);
      })
      .finally(() => !cancel && setLoading(false));
    return () => {
      cancel = true;
    };
  }, [lat, lon, units, lang, onMoodChange, onData]);

  const totalPages = useMemo(() => Math.ceil(days.length / pageSize) || 1, [days, pageSize]);
  const slice = useMemo(() => {
    const start = page * pageSize;
    return days.slice(start, start + pageSize);
  }, [days, page, pageSize]);

  useEffect(() => {
    if (slice.length && onMoodChange) onMoodChange(slice[0].mood);
  }, [slice, onMoodChange]);

  const tUnit = units === "metric" ? "°C" : "°F";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="text-[13px] hint">
          Prossimi 10 giorni{city ? ` — ${city}` : ""}
        </div>
        <div className="flex gap-2">
          <button
            className="pill text-sm disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            ◀︎
          </button>
          <span className="text-sm">{page + 1}/{totalPages}</span>
          <button
            className="pill text-sm disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
          >
            ▶︎
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {loading
          ? Array.from({ length: pageSize }).map((_, i) => (
              <div key={i} className="hour-card skel h-28" />
            ))
          : slice.map((g, i) => (
              <div
                key={g.date}
                className={`hour-card flex flex-col items-center text-center gap-2 ${i === 0 ? "hour-card--now" : ""}`}
                onMouseEnter={() => onMoodChange && onMoodChange(g.mood)}
                onMouseLeave={() => onMoodChange && onMoodChange(slice[0].mood)}
              >
                <div className="font-semibold">{g.weekday}</div>
                <IconWeather type={g.mood} className="w-5 h-5 weather-icon" />
                <div className="text-[13px] opacity-90">{g.dateLabel}</div>
                <div className="flex items-center justify-center gap-3 mt-1">
                  <div className="text-lg font-bold">
                    {Math.round(g.tmax)}{tUnit}
                  </div>
                  <div className="text-sm opacity-80">
                    / {Math.round(g.tmin)}{tUnit}
                  </div>
                </div>
                <div className="text-xs hint mt-1 text-center">
                   <i className="fa-solid fa-cloud-rain mr-[2px]"></i>{g.pop ?? 0}% • <i className="fa-solid fa-wind mr-[2px]"></i>{Math.round(g.wind)} {units === "metric" ? "km/h" : "mph"}
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}

function normalizeDaily(j, lang = "it") {
  const d = j?.daily || {};
  const fmt = new Intl.DateTimeFormat(lang, { weekday: "short", day: "2-digit", month: "short" });
  const out = [];
  const n = d.time?.length || 0;
  for (let i = 0; i < n; i++) {
    const iso = d.time[i];
    const date = new Date(iso + "T12:00:00");
    const wmo = d.weathercode?.[i];
    out.push({
      date: iso,
      weekday: fmt.format(date).split(" ")[0],
      dateLabel: fmt.format(date),
      tmax: d.temperature_2m_max?.[i],
      tmin: d.temperature_2m_min?.[i],
      pop: d.precipitation_probability_mean?.[i],
      wind: d.windspeed_10m_max?.[i],
      mood: codeToMood(wmo),
    });
  }
  return out;
}

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