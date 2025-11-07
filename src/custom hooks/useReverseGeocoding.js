import { useEffect, useState } from "react";

function useReverseGeocoding(coordinates) {
  const [cityName, setCityName] = useState("");
  const [loading, setLoading] = useState(false);
  const [geoError, setGeoError] = useState("");

  useEffect(() => {
    if (!coordinates) return;

    const fetchCityName = async () => {
      setLoading(true);
      setGeoError("");

      try {
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${coordinates.lat}&lon=${coordinates.lon}&format=json&addressdetails=1`;
        const response = await fetch(url, {
          headers: {
            "User-Agent": "meteo-app-react/1.0 (email@example.com)",
            "Accept-Language": "it",
          },
        });

        if (!response.ok)
          throw new Error("Errore nella risposta del reverse geocoding");

        const data = await response.json();

        const name =
          data.address.city ||
          data.address.town ||
          data.address.village ||
          "Posizione sconosciuta";

        setCityName(name);
      } catch (error) {
        console.error("Errore nel reverse geocoding:", error);
        setCityName("Posizione sconosciuta");
        setGeoError("Errore nel reverse geocoding.");
      } finally {
        setLoading(false);
      }
    };

    fetchCityName();
  }, [coordinates]);

  return { cityName, loading, geoError };
}

export default useReverseGeocoding;
