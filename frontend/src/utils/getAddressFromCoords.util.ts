/**
 * Reverse geocoding: converts lat/lng → human-readable NZ-style address
 * Uses OpenStreetMap Nominatim API
 */
export async function getAddressFromCoords(lat: number, lng: number) {
  try {
    /* ================= FETCH FROM OSM ================= */
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${lat}&lon=${lng}`,
    );

    if (!res.ok) {
      throw new Error(`Geocoding failed: ${res.status}`);
    }

    const data = await res.json();
    const addr = data.address;

    /* ================= EXTRACT ADDRESS PARTS ================= */
    const number = addr.house_number || "";
    const street = addr.road || addr.pedestrian || "";
    const suburb = addr.suburb || addr.neighbourhood || "";
    const city = addr.city || addr.town || addr.village || "";

    /* ================= FORMAT (NZ STYLE) =================
       Target format:
       "50 Pitt Street, Newton, Auckland"
    */
    const line1 = [number, street].filter(Boolean).join(" ");
    const line2 = suburb;
    const line3 = city;

    const formattedAddress = [line1, line2, line3].filter(Boolean).join(", ");

    /* ================= RETURN RESULT ================= */
    return formattedAddress || data.display_name;
  } catch (err) {
    /* ================= ERROR HANDLING ================= */
    console.error("Reverse geocoding failed:", err);
    return "Unknown location";
  }
}
