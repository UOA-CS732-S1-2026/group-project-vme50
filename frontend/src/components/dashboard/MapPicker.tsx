/* ================= MAP PICKER COMPONENT =================
   Purpose:
   - Interactive map for selecting a location
   - Allows user to click on map → sets marker
   - Returns lat/lng to parent via onSelect
========================================================== */

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import { useState } from "react";

/* ================= CLICK HANDLER =================
   Handles user clicks on the map
   - updates marker position
   - sends coordinates to parent
================================================== */
function ClickHandler({ setPosition, onSelect }: any) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;

      const pos: LatLngExpression = [lat, lng];

      setPosition(pos);
      onSelect({ lat, lng });
    },
  });

  return null;
}

/* ================= MAIN COMPONENT ================= */
export default function MapPicker({ onSelect }: any) {
  /* ================= DEFAULT CENTER ================= */
  const defaultCenter: LatLngExpression = [-36.8485, 174.7633];

  /* ================= MARKER STATE =================
     Holds current selected position on map
  ================================================= */
  const [position, setPosition] = useState<LatLngExpression | null>(null);

  /* ================= SYNC WITH PARENT VALUE =================
     If parent passes saved coordinates (edit mode),
     update marker position
  ========================================================== */

  return (
    /* ================= MAP CONTAINER ================= */
    <MapContainer
      {...({
        center: position || defaultCenter,
        zoom: 13,
        style: { height: "300px", width: "100%" },
      } as any)} // NOTE: TS workaround for React-Leaflet typing issue
    >
      {/* ================= TILE LAYER ================= */}
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* ================= CLICK MODE =================
         Only active when onSelect is provided
      =============================================== */}
      {onSelect && <ClickHandler setPosition={setPosition} onSelect={onSelect} />}

      {/* ================= MARKER ================= */}
      {position && <Marker position={position} />}
    </MapContainer>
  );
}
