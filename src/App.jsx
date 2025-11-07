import { useState, useEffect, useMemo } from 'react';
import SearchBar from './components/SearchBar';
import WeatherCard from './components/WeatherCard';
import useReverseGeocoding from './custom hooks/useReverseGeocoding';
import Daily from "./components/Daily";
import DailyChart from "./components/DailyChart";
import useWeather from './custom hooks/useWeather';
import RadarMap from "./components/RadarMap";
import useSearchedCity from './custom hooks/useSearchedCity';
import './index.css';
import Navbar from './components/Navbar';

function App() {
  const [coordinates, setCoordinates] = useState(null);
  const [city, setCity] = useState('');
  const [error, setError] = useState('');

  const { coordinates: searchedCoordinates, searchError, fetchCoordinates } = useSearchedCity();
  const { cityName, geoError } = useReverseGeocoding(coordinates);
  const { weather, timezone, weatherError, loading: weatherLoading } = useWeather(coordinates);
  const [coords, setCoords] = useState({ lat: 41.9028, lon: 12.4964 });
  const [units, setUnits] = useState("metric");
  const [mood, setMood] = useState("clear");
  const [daysData, setDaysData] = useState([]);


  // Se vengono trovate nuove coordinate da ricerca manuale
  useEffect(() => {
    if (searchedCoordinates) {
      setCoordinates(searchedCoordinates);
    }
  }, [searchedCoordinates]);

  // Se arriva il nome città dal reverse geocoding (GPS)
  useEffect(() => {
    if (cityName) setCity(cityName);
  }, [cityName]);

  // Gestione errori
  useEffect(() => {
    setError(searchError || geoError || weatherError || '');
  }, [searchError, geoError, weatherError]);

  const handleCitySearch = (searchedCity) => {
    fetchCoordinates(searchedCity);
  };

  const handleUseGps = (coords) => {
    setCoordinates(coords);
  };

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
      <Navbar timezone={timezone} />
      {weatherLoading && <p className="loading">🌦️ Caricamento meteo...</p>}
      <SearchBar onSearch={handleCitySearch} onUseGps={handleUseGps} />
      {error && <p className="error">{error}</p>}
      {weather && <WeatherCard weather={weather} city={city} timezone={timezone} />}
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
  )
}

export default App
