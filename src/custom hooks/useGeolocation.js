import { useState } from "react";

function useGeolocation() {
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState("");

  const getLocation = () => {
    return new Promise((resolve) => {
      setIsLocating(true);
      setError("");

      if (!navigator.geolocation) {
        setError("Geolocalizzazione non supportata dal browser.");
        setIsLocating(false);
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          setIsLocating(false);
          resolve(coords);
        },
        () => {
          setError("Impossibile ottenere la posizione.");
          setIsLocating(false);
          resolve(null);
        }
      );
    });
  };

  return { isLocating, error, getLocation };
}

export default useGeolocation;
