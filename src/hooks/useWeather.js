import { useState } from "react";

export default function useWeather() {
  const [coords, setCoords] = useState({ lat: 41.9, lon: 12.5, label: "Roma" });
  const [meteo, setMeteo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // Ricerca per città
  async function fetchByCity(city) {
    try {
      setLoading(true);
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=it`
      );
      const data = await res.json();
      const { latitude, longitude, name } = data.results[0];
      await fetchByCoords(latitude, longitude, name);
    } catch (error) {
      console.error(error);
      setErr("Errore nella ricerca città");
    } finally {
      setLoading(false);
    }
  }

  // Ricerca per coordinate (clic mappa o GPS)
  async function fetchByCoords(lat, lon, label = "Posizione selezionata") {
    try {
      setLoading(true);
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_mean,windspeed_10m_max,weathercode&timezone=auto`
      );
      const data = await res.json();
      setMeteo(data);
      setCoords({ lat, lon, label });
    } catch (error) {
      console.error(error);
      setErr("Errore nel caricamento dati meteo");
    } finally {
      setLoading(false);
    }
  }

  // Pulsante GPS
  function geolocalizza() {
    if (!navigator.geolocation) {
      alert("Geolocalizzazione non supportata");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetchByCoords(latitude, longitude, "Posizione attuale");
      },
      () => alert("Impossibile ottenere la posizione")
    );
  }

  return { coords, meteo, loading, err, fetchByCity, fetchByCoords, geolocalizza };
}