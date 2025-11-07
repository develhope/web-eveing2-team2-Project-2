import React from "react";
import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onMapClick && onMapClick(lat, lng);
    },
  });
  return null;
}

export default function RadarMap({ coords, onMapClick }) {
  if (!coords?.lat || !coords?.lon) return null;

  return (
    <div className="h-full w-full">
      <MapContainer
        center={[coords.lat, coords.lon]}
        zoom={7}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <TileLayer
          attribution="© RainViewer"
          url="https://tilecache.rainviewer.com/v2/radar/{z}/{x}/{y}/1/1_1.png"
          opacity={0.5}
        />
        <MapClickHandler onMapClick={onMapClick} />
      </MapContainer>
    </div>
  );
}