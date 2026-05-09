/* ================= MAP VIEW COMPONENT =================
   Purpose:
   - Display a read-only map
   - Show a marker at a given lat/lng
   - Used in InviteCard / MapModal (view mode only)
======================================================= */

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import type { LatLngExpression } from "leaflet";

/* ================= PROPS ================= */
type Props = {
  lat: number;
  lng: number;
};

export default function MapView({ lat, lng }: Props) {
  /* ================= MARKER POSITION ================= */
  const position: LatLngExpression = [lat, lng];

  return (
    /* ================= MAP CONTAINER =================
       NOTE:
       - center is wrapped in `as any` to avoid TS mismatch
       - this is a known React-Leaflet typing issue
    =================================================== */
    <MapContainer
      {...({
        center: position,
        zoom: 15,
        style: { height: "300px", width: "100%" },
        scrollWheelZoom: false,
      } as any)}
    >
      {/* ================= TILE LAYER ================= */}
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* ================= MARKER ================= */}
      <Marker position={position} />
    </MapContainer>
  );
}
