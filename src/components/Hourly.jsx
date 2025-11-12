import React, { useEffect, useMemo, useState } from "react";
import IconWeather from "./IconWeather";

/**
 * Lista oraria paginata (5 card per pagina).
 * Riceve l’array già filtrato a “oggi fino alle 23” dal parent.
 * L’hover può cambiare lo sfondo della sezione tramite `onMoodChange`.
 */
export default function Hourly({
  city,
  units = "metric",
  data,           // array normalizzato dal parent
  pageSize = 5,   // 5 ore per pagina
  onMoodChange,
}) {
  const [list, setList] = useState([]);
  const [page, setPage] = useState(0);

  // Inizializzazione/aggiornamento dati quando cambia `data`.
  useEffect(() => {
    if (Array.isArray(data) && data.length) {
      setList(data);
      setPage(0);
      if (onMoodChange && data[0]?.mood) onMoodChange(data[0].mood);
    } else {
      setList([]);
    }
  }, [data, onMoodChange]);

  const totalPages = useMemo(
    () => Math.ceil((list?.length || 0) / pageSize) || 1,
    [list, pageSize]
  );

  const slice = useMemo(() => {
    const start = page * pageSize;
    return (list || []).slice(start, start + pageSize);
  }, [list, page, pageSize]);

  // Aggiorna mood sezione quando cambia lo slice.
  useEffect(() => {
    if (slice.length && onMoodChange) onMoodChange(slice[0].mood);
  }, [slice, onMoodChange]);

  const tUnit = units === "metric" ? "°C" : "°F";
  const wUnit = units === "metric" ? "km/h" : "mph";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="text-[13px] hint">Ora per ora{city ? ` — ${city}` : ""}</div>
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

      {!slice.length && <div className="hint text-sm">⚠️ Nessun dato orario disponibile.</div>}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {slice.map((h, idx) => (
          <div
            key={h.iso}
            className={`hour-card flex flex-col items-center text-center gap-2 ${idx === 0 ? "hour-card--now" : ""}`}
            onMouseEnter={() => onMoodChange?.(h.mood)}
            onMouseLeave={() => onMoodChange?.(null)}
            title={`${h.labelFull} • 💧 ${h.pop ?? 0}% • 💨 ${Math.round(h.wind ?? 0)} ${wUnit}`}
          >
            <div className="font-semibold">{h.label}</div>
            <div style={{ lineHeight: 0, display: "flex", justifyContent: "center" }}>
              <IconWeather type={h.mood} className="w-8 h-8 weather-icon" />
            </div>
            <div className="text-base font-semibold">
              {h.temp != null ? Math.round(h.temp) : "--"}{tUnit}
            </div>
            <div className="text-xs hint mt-1 text-center">
              💧 {h.pop ?? 0}% • 💨 {h.wind != null ? Math.round(h.wind) : "--"} {wUnit}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
