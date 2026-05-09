import { useState } from "react";
import MapModal from "./MapModal";

interface Location {
  address: string;
  lat: number;
  lng: number;
}

interface InviteCardProps {
  id: string;
  title: string;
  description: string;
  location: Location;
  time: string;
  current: number;
  max: number;

  joined: boolean;
  disabledJoin: boolean;

  onJoin: (id: string) => void;
  onLeave: (id: string) => void;
}

function InviteCard({
  id,
  title,
  description,
  location,
  time,
  current,
  max,
  joined,
  disabledJoin,
  onJoin,
  onLeave,
}: InviteCardProps) {
  const [openMap, setOpenMap] = useState(false);

  const isFull = current >= max;

  return (
    <>
      <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-200 hover:shadow-md transition">
        {/* TITLE */}
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>

        {/* LOCATION */}
        <button
          onClick={() => setOpenMap(true)}
          className="text-sm text-blue-600 hover:text-blue-700 mt-1 flex items-center gap-1 transition cursor-pointer"
        >
          📍 {location?.address || "No location"}
        </button>

        {/* DESCRIPTION */}
        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{description}</p>

        {/* TIME + SLOTS */}
        <div className="flex justify-between text-xs mt-4">
          <span className="text-gray-500">🕒 {new Date(time).toLocaleString()}</span>

          <span
            className={`px-2 py-1 rounded-full ${
              isFull ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
            }`}
          >
            {current}/{max}
          </span>
        </div>

        {/* BUTTON LOGIC (FINAL FIX) */}
        {joined ? (
          <button
            onClick={() => onLeave(id)}
            className="w-full mt-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 cursor-pointer"
          >
            Leave Meal
          </button>
        ) : (
          <button
            onClick={() => onJoin(id)}
            disabled={isFull || disabledJoin}
            className={`w-full mt-4 py-2 rounded-lg transition font-medium ${
              isFull || disabledJoin
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm cursor-pointer"
            }`}
          >
            {isFull ? "Full" : disabledJoin ? "Already in a Meal" : "Join Meal"}
          </button>
        )}
      </div>

      {/* MAP */}
      {openMap && location?.lat && location?.lng && (
        <MapModal
          open={openMap}
          onClose={() => setOpenMap(false)}
          lat={location.lat}
          lng={location.lng}
          address={location.address}
        />
      )}
    </>
  );
}

export default InviteCard;
