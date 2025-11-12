import React, { useEffect, useMemo, useState } from "react"; 
import IconWeather from "./IconWeather";

/**
 * Lista paginata dei prossimi giorni (usa i dati già normalizzati passati dal parent).
 * - Non effettua fetch: riceve `data` da useWeather via App.
 * - Aggiorna lo sfondo della sezione tramite `onMoodChange` quando cambia pagina/hover.
 * - Rimanda i dati completi al parent via `onData` per alimentarne il grafico.
 */
export default function Daily({
  city,
  units = "metric",
  pageSize = 5,
  onMoodChange,
  onData,    // App vuole i giorni per il grafico (stessi esatti dati mostrati)
  data,      // array di giorni già normalizzati (prodotto da useWeather)
}) {
  const [days, setDays] = useState([]);
  const [page, setPage] = useState(0);

  // Inizializza/aggiorna stato quando cambia `data` dal parent.
  useEffect(() => {
    if (Array.isArray(data) && data.length) {
      setDays(data);
      setPage(0);
      onMoodChange?.(data[0]?.mood);
      onData?.(data);
    } else {
      setDays([]);
    }
  }, [data, onMoodChange, onData]);

  // Calcolo pagine virtuali (UI).
  const totalPages = useMemo(
    () => Math.ceil((days?.length || 0) / pageSize) || 1,
    [days, pageSize]
  );

  // Slice degli elementi da mostrare nella pagina corrente.
  const slice = useMemo(() => {
    const start = page * pageSize;
    return (days || []).slice(start, start + pageSize);
  }, [days, page, pageSize]);

  // Quando cambia lo slice, imposta lo sfondo col mood del primo elemento visibile.
  useEffect(() => {
    if (slice.length && onMoodChange) onMoodChange(slice[0].mood);
  }, [slice, onMoodChange]);

  const tUnit = units === "metric" ? "°C" : "°F";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="text-[13px] hint">Prossimi 10 giorni{city ? ` — ${city}` : ""}</div>
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

      {!slice.length && <div className="hint text-sm">⚠️ Nessun dato giornaliero disponibile.</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {slice.map((g, i) => (
          <div
            key={g.date}
            className={`hour-card flex flex-col items-center text-center gap-2 ${i === 0 ? "hour-card--now" : ""}`}
            onMouseEnter={() => onMoodChange?.(g.mood)}   // hover → sfondo sezione
            onMouseLeave={() => onMoodChange?.(null)}     // leave → ripristina
          >
            <div className="font-semibold">{g.weekday}</div>
            <IconWeather type={g.mood} className="w-5 h-5 weather-icon" />
            <div className="text-[13px] opacity-90">{g.dateLabel}</div>
            <div className="flex items-center justify-center gap-3 mt-1">
              <div className="text-lg font-bold">
                {g.tmax != null ? Math.round(g.tmax) : "--"}{tUnit}
              </div>
              <div className="text-sm opacity-80">
                / {g.tmin != null ? Math.round(g.tmin) : "--"}{tUnit}
              </div>
            </div>
            <div className="text-xs hint mt-1 text-center">
              💧 {g.pop ?? 0}% • 💨 {g.wind != null ? Math.round(g.wind) : "--"} {units === "metric" ? "km/h" : "mph"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
