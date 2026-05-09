import L from "leaflet";

/* ================= DEFAULT LEAFLET MARKER FIX =================
   Leaflet (by default) fails to load marker icons in bundlers
   like Vite / Webpack / React because image paths break.
   This fixes missing marker icons.
============================================================== */

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

/* ================= REMOVE BROKEN INTERNAL PATH =================
   Leaflet tries to auto-load images via _getIconUrl,
   which does NOT work in modern bundlers.
============================================================== */
delete (L.Icon.Default.prototype as any)._getIconUrl;

/* ================= MANUALLY SET ICON PATHS ================= */
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
