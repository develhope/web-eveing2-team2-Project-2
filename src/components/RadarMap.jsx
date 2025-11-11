import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix icone default Leaflet rotte in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function RadarMap({ coords, onMapClick }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) {
      // Inizializza la mappa
      const map = L.map("radar-map", {
        center: [coords.lat, coords.lon],
        zoom: 6,
        zoomControl: true,
        attributionControl: false,
      });

      // Layer base (mappa)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/">OSM</a>',
      }).addTo(map);

      // Layer radar pioggia da RainViewer
      const rainLayer = L.tileLayer(
        "https://tilecache.rainviewer.com/v2/radar/{z}/{x}/{y}/1/1_1.png",
        { opacity: 0.5, zIndex: 10 }
      );
      rainLayer.addTo(map);

      // Marker blu per la posizione corrente
      const marker = L.marker([coords.lat, coords.lon], {
        icon: L.icon({
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        }),
      }).addTo(map);

      // Click sulla mappa → callback a App.jsx
      map.on("click", function (e) {
        const { lat, lng } = e.latlng;
        if (onMapClick) onMapClick(lat, lng);
        marker.setLatLng([lat, lng]);
      });

      mapRef.current = map;
    } else {
      // Se già creata, aggiorna solo la posizione del marker
      mapRef.current.setView([coords.lat, coords.lon], mapRef.current.getZoom());
    }
  }, [coords, onMapClick]);

  return (
    <div
      id="radar-map"
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "16px",
        overflow: "hidden",
      }}
    />
  );
}

export default RadarMap;
