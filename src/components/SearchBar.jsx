import { useState } from 'react';
import "../styles/SearchBar.css";
import useGeolocation from '../custom hooks/useGeolocation';

function SearchBar({ onSearch, onUseGps }) {
  const [city, setCity] = useState('');
  const { isLocating, error, getLocation } = useGeolocation();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (city.trim()) {
      onSearch(city); // solo ricerca manuale
      setCity('');
    }
  };

  const handleGpsClick = async () => {
    const coords = await getLocation(); // facciamo restituire le coords
    if (coords) onUseGps(coords); // chiama App per gestire il flusso GPS
  };

  return (
    <div className="search-container">
      <button
        type="button"
        className="gps-button"
        onClick={handleGpsClick}
        disabled={isLocating}
      >
        <i className="fa-solid fa-location-crosshairs"></i>
      </button>

      <form onSubmit={handleSubmit} className="search-bar">
        <i className="fa-solid fa-magnifying-glass"></i>
        <input
          type="text"
          placeholder="Cerca la tua città"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </form>

      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default SearchBar;
