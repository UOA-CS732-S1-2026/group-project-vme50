/* ================= MAP MODAL COMPONENT =================
   Purpose:
   - Displays a popup modal with a map view
   - Shows location details (address + marker)
   - Used when clicking a meal location in InviteCard
======================================================== */

import MapView from "./MapView";

/* ================= PROPS ================= */
type Props = {
  open: boolean; // controls modal visibility
  onClose: () => void;
  lat: number;
  lng: number;
  address: string;
};

function MapModal({ open, onClose, lat, lng, address }: Props) {
  /* ================= CONDITIONAL RENDER =================
     If modal is not open → render nothing
  ====================================================== */
  if (!open) return null;

  return (
    /* ================= BACKDROP ================= */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      {/* ================= MODAL CONTAINER ================= */}
      <div className="w-full max-w-2xl rounded-2xl bg-white overflow-hidden shadow-xl">
        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between p-4">
          <h2 className="font-semibold text-gray-800">📍 Map Location</h2>

          <button
            onClick={onClose}
            className="text-red-500 hover:text-red-600 text-2xl font-bold transition cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* ================= ADDRESS DISPLAY ================= */}
        <div className="p-4 text-sm text-gray-600">{address}</div>

        {/* ================= MAP SECTION =================
           Uses MapView (read-only map with marker)
        ================================================= */}
        <div className="p-4">
          <MapView lat={lat} lng={lng} />
        </div>
      </div>
    </div>
  );
}

export default MapModal;
