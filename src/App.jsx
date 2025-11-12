import React, { useEffect, useMemo, useState, useCallback } from "react";

// --- Layout: Navbar (SearchBar + GPS + toggle) + card corrente
import Navbar from "./components/Navbar";
import WeatherCard from "./components/WeatherCard";

// --- Hooks: ricerca coord, reverse geocoding, meteo centralizzato
import useSearchedCity from "./custom hooks/useSearchedCity";
import useReverseGeocoding from "./custom hooks/useReverseGeocoding";
import useWeather from "./custom hooks/useWeather.js";

// --- Sezioni: ora-per-ora, 10-giorni + grafico, mappa radar
import Hourly from "./components/Hourly";
import Daily from "./components/Daily";
import DailyChart from "./components/DailyChart";
import RadarMap from "./components/RadarMap";

// --- Stili globali
import "./index.css";

export default function App() {
  // Default Roma
  const [coordinates, setCoordinates] = useState({ lat: 41.9028, lon: 12.4964 });
  const [city, setCity] = useState("Roma");
  const [units] = useState("metric");
  const [error, setError] = useState("");

  // ============ SFONDO ============
  // Lo sfondo meteo NON segue “Adesso”.
  // Cambia solo quando si passa con il mouse sui prossimi giorni (e/o sull’orario se abilitato).
  const [hoverMood, setHoverMood] = useState(null);

  // Dati per il grafico: arrivano direttamente dal componente Daily.
  const [daysDataForChart, setDaysDataForChart] = useState([]);

  // Ricerca per città
  const { coordinates: searchedCoordinates, searchError, fetchCoordinates } = useSearchedCity();

  // Reverse geocoding (da GPS/click mappa) → city name
  const { cityName, geoError } = useReverseGeocoding(coordinates);

  // Fetch meteo centralizzata (current + hourly + daily)
  const { weather, timezone, weatherError, loading: weatherLoading } = useWeather(coordinates);

  // Aggiorna coords quando viene scelta una città dalla search.
  useEffect(() => {
    if (searchedCoordinates) setCoordinates(searchedCoordinates);
  }, [searchedCoordinates]);

  // Aggiorna label città quando cambia da reverse geocoding.
  useEffect(() => {
    if (cityName) setCity(cityName);
  }, [cityName]);

  // Errore unico visualizzato in pagina (search/reverse/weather).
  useEffect(() => {
    setError(searchError || geoError || weatherError || "");
  }, [searchError, geoError, weatherError]);

  // Handlers stabili
  const handleCitySearch   = useCallback((q) => fetchCoordinates(q), [fetchCoordinates]);
  const handleUseGps       = useCallback((coords) => setCoordinates(coords), []);
  const handleMapClick     = useCallback((lat, lon) => setCoordinates({ lat, lon }), []);
  const handleDailyData    = useCallback((arr) => setDaysDataForChart(arr || []), []);
  const handleForecastMood = useCallback((m) => setHoverMood(m), []);

  // Bg sezione solo quando c'è hover dei forecast (priorità alla dark-mode del body).
  const containerBg = useMemo(() => {
    if (!hoverMood) return "";
    const ok = new Set(["clear", "clouds", "rain", "drizzle", "snow", "storm", "mist", "wind", "night"]);
    return ok.has(hoverMood) ? `bg-mood-${hoverMood}` : "";
  }, [hoverMood]);

  // ====== DATI PER FIGLI ======
  // Helper per evitare undefined
  const asArray = (x) => (Array.isArray(x) ? x : []);
  const hourlyAll = asArray(weather?.hourlyNorm);
  const dailyAll  = asArray(weather?.dailyNorm);

  // Orario limitato a OGGI: da ora fino alle 23:59 locali.
  const todayHourly = useMemo(() => {
    if (!hourlyAll.length) return [];
    try {
      const now = new Date();
      const y = now.getFullYear();
      const m = now.getMonth();
      const d = now.getDate();
      const end = new Date(y, m, d, 23, 59, 59, 999);
      return hourlyAll.filter(h => {
        const t = new Date(h.iso);
        return t.getFullYear() === y && t.getMonth() === m && t.getDate() === d && t <= end;
      });
    } catch {
      return hourlyAll;
    }
  }, [hourlyAll]);

  return (
    <div className={`min-h-screen text-white/95`}>
      {/* NAVBAR full-width (SearchBar + GPS centrati, toggle a destra) */}
      <Navbar timezone={timezone} onSearch={handleCitySearch} onUseGps={handleUseGps} />

      {/* wrapper centrale delle sezioni */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {weatherLoading && <p className="loading">🌦️ Caricamento meteo...</p>}
        {error && <p className="error">{error}</p>}

        {/* CARD "Adesso" — NON influenza lo sfondo */}
        {weather && <WeatherCard weather={weather} city={city} timezone={timezone} />}

        {/* ORA PER ORA (5 card per pagina). Per disattivare lo sfondo su hover: togli onMoodChange. */}
        <section className={`rounded-3xl border border-white/30 bg-[rgba(255,255,255,0.18)] backdrop-blur-md shadow-[0_40px_100px_rgba(0,0,0,0.45)] p-6 mt-6 flex flex-col gap-6 ${containerBg}`}>
          <Hourly
            city={city}
            units={units}
            data={todayHourly}     // oggi fino alle 23
            pageSize={5}          // 5 per pagina
            onMoodChange={handleForecastMood}
          />
        </section>

        {/* PROSSIMI 10 GIORNI + GRAFICO (usa esattamente i dati rimandati da Daily) */}
        <section className={`rounded-3xl border border-white/30 bg-[rgba(255,255,255,0.18)] backdrop-blur-md shadow-[0_40px_100px_rgba(0,0,0,0.45)] p-6 mt-6 flex flex-col gap-6 ${containerBg}`}>
          <Daily
            city={city}
            units={units}
            pageSize={5}
            data={dailyAll}
            onMoodChange={handleForecastMood}
            onData={handleDailyData}
          />
          <DailyChart days={daysDataForChart} units={units} />
        </section>

        {/* MAPPA RADAR */}
        <section className="rounded-3xl border border-white/30 bg-[rgba(255,255,255,0.18)] backdrop-blur-md shadow-[0_40px_100px_rgba(0,0,0,0.45)] p-6 mt-8 flex flex-col gap-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium opacity-90">Mappa</h3>
            <span className="text-xs opacity-70">Clicca sulla mappa per cambiare zona</span>
          </div>
          <div className="h-[420px] overflow-hidden rounded-2xl border border-white/40 shadow-inner">
            <RadarMap coords={coordinates} onMapClick={handleMapClick} />
          </div>
        </section>

        <footer className="mt-6 text-center text-xs hint">© {new Date().getFullYear()} Nuvolino</footer>
      </div>
    </div>
  );
}
