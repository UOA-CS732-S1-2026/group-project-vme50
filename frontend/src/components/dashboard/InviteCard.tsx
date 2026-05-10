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

  onJoin: (id: string) => Promise<void>;
  onLeave: (id: string) => Promise<void>;
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
  onJoin,
  onLeave,
}: InviteCardProps) {
  const [openMap, setOpenMap] = useState(false);
  const [loading, setLoading] = useState<"join" | "leave" | null>(null);

  const isFull = current >= max;

  const handleJoin = async () => {
    setLoading("join");
    try {
      await onJoin(id);
    } finally {
      setLoading(null);
    }
  };

  const handleLeave = async () => {
    setLoading("leave");
    try {
      await onLeave(id);
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <div className="w-full rounded-2xl bg-white p-5 shadow-sm border border-gray-200 hover:shadow-md transition h-full flex flex-col">

        {/* TITLE */}
        <h3 className="text-lg font-bold text-gray-900 line-clamp-1 break-words">
          {title}
        </h3>

        {/* LOCATION */}
        <button
          onClick={() => setOpenMap(true)}
          className="text-sm text-blue-600 hover:text-blue-700 mt-1 flex items-center gap-1 transition cursor-pointer line-clamp-1 break-all"
        >
          📍 {location?.address || "No location"}
        </button>

        {/* DESCRIPTION */}
        <p className="text-sm text-gray-600 mt-2 line-clamp-3">
          {description}
        </p>

        {/* TIME + SLOTS */}
        <div className="flex justify-between text-xs mt-auto pt-4">
          <span className="text-gray-500">
            🕒 {new Date(time).toLocaleString()}
          </span>

          <span
            className={`px-2 py-1 rounded-full ${
              isFull ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
            }`}
          >
            {current}/{max}
          </span>
        </div>

{/* BUTTONS */}
{joined ? (
  <button
    onClick={handleLeave}
    disabled={loading !== null}
    className="relative w-full mt-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-60 cursor-pointer flex items-center justify-center"
  >
    {/* TEXT (always there, invisible when loading) */}
    <span className={loading === "leave" ? "invisible" : ""}>
      Leave Meal
    </span>

    {/* SPINNER */}
    {loading === "leave" && (
      <span className="absolute w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
    )}
  </button>
) : (
  <button
    onClick={handleJoin}
    disabled={isFull || loading !== null}
    className={`relative w-full mt-4 py-2 rounded-lg transition font-medium flex items-center justify-center ${
      isFull
        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
        : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm cursor-pointer"
    }`}
  >
    {/* TEXT (always there, invisible when loading) */}
    <span className={loading === "join" ? "invisible" : ""}>
      {isFull ? "Full" : "Join Meal"}
    </span>

    {/* SPINNER */}
    {loading === "join" && (
      <span className="absolute w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
    )}
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