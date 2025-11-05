import React, { useMemo, useState } from "react";
import Daily from "./components/Daily";
import DailyChart from "./components/DailyChart";
import SearchCity from "./components/SearchCity";
import LogoNuvolino from "./components/LogoNuvolino";
import RadarMap from "./components/RadarMap";

function CrosshairIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
    </svg>
  );
}

// --- helper per formattare Paese in IT (da codice ISO) ---
const regionNamesIT =
  typeof Intl !== "undefined" && Intl.DisplayNames
    ? new Intl.DisplayNames(["it"], { type: "region" })
    : null;

// --- REVERSE GEOCODING con fallback multiplo ---
async function reverseGeocodeSmart(lat, lon) {
  // 1) Open-Meteo Reverse
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=it&count=1`,
      { headers: { Accept: "application/json" } }
    );
    const data = await res.json();
    const r = data?.results?.[0];
    if (r) {
      const country =
        (r.country_code &&
          regionNamesIT &&
          regionNamesIT.of(String(r.country_code).toUpperCase())) ||
        r.country ||
        null;
      const city = r.name || r.admin2 || r.admin1 || null;
      if (city && country) {
        // Evita doppioni tipo "Roma (Italia)" se già presente
        return city.includes(country) ? city : `${city} (${country})`;
      }
      if (city) return city;
      if (country) return country;
    }
  } catch (e) {
    // ignora, passa al prossimo fallback
    console.warn("Reverse OM fallito:", e);
  }

  // 2) Nominatim (OpenStreetMap)
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
      {
        headers: {
          Accept: "application/json",
          // user-agent “gentile”: evita rate limit
          "User-Agent": "Nuvolino/1.0 (+https://example.com)",
          Referer: "https://example.com",
        },
      }
    );
    const d = await res.json();
    const a = d?.address || {};
    const city =
      a.city ||
      a.town ||
      a.village ||
      a.municipality ||
      a.county ||
      a.state ||
      null;
    const country = a.country || null;
    if (city && country) return `${city} (${country})`;
    if (city) return city;
    if (country) return country;
  } catch (e) {
    console.warn("Reverse Nominatim fallito:", e);
  }

  // 3) fallback finale
  return null;
}

export default function App() {
  const [coords, setCoords] = useState({ lat: 41.9028, lon: 12.4964 });
  const [city, setCity] = useState("Roma");
  const [units, setUnits] = useState("metric");
  const [mood, setMood] = useState("clear");
  const [daysData, setDaysData] = useState([]);

  const handleSelectCity = (opt) => {
    const { lat, lon, name } = opt || {};
    if (typeof lat === "number" && typeof lon === "number") {
      setCoords({ lat, lon });
    }
    if (name) setCity(name);
  };

  async function geolocalizza() {
    if (!navigator.geolocation) {
      alert("Geolocalizzazione non supportata");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lon: longitude });
        setCity("Aggiornamento…");
        const label = await reverseGeocodeSmart(latitude, longitude);
        setCity(label || `Lat ${latitude.toFixed(2)}, Lon ${longitude.toFixed(2)}`);
      },
      () => alert("Impossibile ottenere la posizione")
    );
  }

  // Click sulla mappa → aggiorna coord + nome
  async function handleMapClick(lat, lon) {
    setCoords({ lat, lon });
    setCity("Aggiornamento…");
    const label = await reverseGeocodeSmart(lat, lon);
    setCity(label || `Lat ${lat.toFixed(2)}, Lon ${lon.toFixed(2)}`);
  }

  // Sfondo dinamico dal mood (clear|clouds|rain|...)
  const containerBg = useMemo(() => {
    const ok = new Set([
      "clear", "clouds", "rain", "drizzle",
      "snow", "storm", "mist", "wind", "night",
    ]);
    return ok.has(mood) ? `bg-mood-${mood}` : "bg-mood-clear";
  }, [mood]);

  const tUnitLabel = units === "metric" ? "°C" : "°F";

  return (
    <div className={`${containerBg} min-h-screen text-white/95`}>
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* HEADER */}
        <header className="flex items-center justify-between mb-6">
          <LogoNuvolino size={86} textSize="lg" />
          <div className="flex items-center gap-3">
            <SearchCity
              placeholder="Cerca città…"
              className="w-64"
              onSelect={handleSelectCity}
            />
            <button
              type="button"
              onClick={geolocalizza}
              className="pill text-sm flex items-center gap-2"
              title="Usa la tua posizione"
            >
              <CrosshairIcon /> GPS
            </button>
            <button
              className="pill text-sm"
              title="Cambia unità"
              onClick={() =>
                setUnits((u) => (u === "metric" ? "imperial" : "metric"))
              }
            >
              {tUnitLabel}
            </button>
          </div>
        </header>

        {/* CARD METEO + GRAFICO */}
        <section
          className="rounded-3xl border border-white/30 bg-[rgba(255,255,255,0.18)]
                     backdrop-blur-md shadow-[0_40px_100px_rgba(0,0,0,0.45)]
                     p-6 flex flex-col gap-6"
        >
          <Daily
            key={`${coords.lat},${coords.lon},${city}`}
            lat={coords.lat}
            lon={coords.lon}
            city={city}
            units={units}
            lang="it"
            pageSize={5}
            onMoodChange={setMood}
            onData={setDaysData}
            iconLayout="center"
            iconSize={28}
          />
          <DailyChart days={daysData} units={units} />
        </section>

        {/* MAPPA RADAR */}
        <section
          className="rounded-3xl border border-white/30 bg-[rgba(255,255,255,0.18)]
                     backdrop-blur-md shadow-[0_40px_100px_rgba(0,0,0,0.45)]
                     p-6 mt-8 flex flex-col gap-3"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium opacity-90">Radar precipitazioni</h3>
            <span className="text-xs opacity-70">Clicca sulla mappa per cambiare zona</span>
          </div>
          <div className="h-[420px] overflow-hidden rounded-2xl border border-white/40 shadow-inner">
            <RadarMap coords={coords} onMapClick={handleMapClick} />
          </div>
        </section>

        <footer className="mt-6 text-center text-xs hint">
          © {new Date().getFullYear()} Nuvolino
        </footer>
      </div>
    </div>
  );
}