import { useState } from "react";
import useGeolocation from "../custom hooks/useGeolocation";

/**
 * Campo ricerca + pulsante GPS:
 * - La ricerca delega completamente ad `onSearch`.
 * - Il GPS usa l’hook `useGeolocation` e notifica le coords via `onUseGps`.
 */
function SearchBar({ onSearch, onUseGps }) {
  const [city, setCity] = useState("");
  const { isLocating, error: geoError, getLocation } = useGeolocation();

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = city.trim();
    if (!q) return;
    if (onSearch) onSearch(q); // delega la fetch al parent
    setCity("");
  };

  const handleGpsClick = async () => {
    const coords = await getLocation();
    if (coords && onUseGps) onUseGps(coords);
  };

  return (
    <div className="search-container">
      <button
        type="button"
        className="gps-button"
        onClick={handleGpsClick}
        disabled={isLocating}
        title="Usa la tua posizione"
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

      {geoError && <p className="error">{geoError}</p>}
    </div>
  );
}

export default SearchBar;
