import { useState } from "react";

/*
  Hook personalizzato per gestire la geolocalizzazione utente.
  - Restituisce coordinate lat/lon
  - Gestisce stati di caricamento ed errore
  - Utilizzato sia per la geolocalizzazione automatica (App.jsx)
    sia per il pulsante GPS (SearchBar)
*/

function useGeolocation() {
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState(null);

  // Funzione principale per ottenere la posizione corrente
  const getLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setError("Geolocalizzazione non supportata dal browser.");
        resolve(null);
        return;
      }

      setIsLocating(true);
      setError(null);

      // Timeout di sicurezza (max 10 secondi)
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          setIsLocating(false);
          resolve(coords);
        },
        (err) => {
          console.error("Errore nella geolocalizzazione:", err);
          setError("Impossibile determinare la posizione.");
          setIsLocating(false);
          resolve(null);
        },
        options
      );
    });
  };

  return { isLocating, error, getLocation };
}

export default useGeolocation;
