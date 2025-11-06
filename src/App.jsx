import { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import WeatherCard from './components/WeatherCard';
import useReverseGeocoding from './custom hooks/useReverseGeocoding';
import useWeather from './custom hooks/useWeather';
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

  return (
    <div className="app-container">
      <Navbar timezone={timezone} />
      {weatherLoading && <p className="loading">🌦️ Caricamento meteo...</p>}
      <SearchBar onSearch={handleCitySearch} onUseGps={handleUseGps} />
      {error && <p className="error">{error}</p>}
      {weather && <WeatherCard weather={weather} city={city} timezone={timezone} />}
    </div>
  );
}

export default App;
