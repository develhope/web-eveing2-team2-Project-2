import { useState } from "react";

/**
 * Ricerca coordinate da nome città.
 * - Ritorna: { coordinates, searchError, loading, fetchCoordinates(cityName) }.
 * - Usa headers corretti e lingua italiana.
 */
function useSearchedCity() {
  const [coordinates, setCoordinates] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchCoordinates = async (cityName) => {
    if (!cityName) return;

    setLoading(true);
    setSearchError("");
    setCoordinates(null);

    try {
      const url = `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(
        cityName
      )}&format=json&limit=1`;
      const response = await fetch(url, {
        headers: {
          "User-Agent": "meteo-app-react/1.0 (email@example.com)",
          "Accept-Language": "it",
        },
      });

      if (!response.ok) throw new Error("Errore durante la ricerca della città");

      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        setSearchError("Città non trovata.");
        return;
      }

      const coords = {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
      };
      setCoordinates(coords);
    } catch (err) {
      setSearchError("Errore nel recupero delle coordinate.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { coordinates, searchError, loading, fetchCoordinates };
}

export default useSearchedCity;
