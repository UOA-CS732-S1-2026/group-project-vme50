import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { logoutUser } from "../../api/authApi";
import { getUser, clearAuth } from "../../utils/auth.util";
import { getInitials, getAvatarColor } from "../../utils/avatar.util";

function Topbar() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const user = getUser();

  const handleLogout = async () => {
    setLoading(true);

    try {
      await logoutUser();
    } catch (err) {
      console.error(err);
    }

    clearAuth();
    setOpen(false);
    navigate("/", { replace: true });
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-between bg-white px-6 py-4 shadow">
      {/* LEFT */}
      <div className="flex items-center gap-2">
        {/* FAVICON */}
        <img src="/favicon.svg" alt="Platemates logo" className="h-6 w-6" />

        {/* TITLE */}
        <h1 className="text-2xl font-bold text-teal-600">Platemates</h1>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">
        {/* USER NAME */}
        <span className="text-sm text-gray-700">{user?.name || ""}</span>

        {/* PROFILE AVATAR */}
        <div className="relative">
          <div
            onClick={() => setOpen(!open)}
            className={`
              flex h-10 w-10 cursor-pointer items-center justify-center
              rounded-full text-white font-semibold
              border-2 border-white shadow
              ${getAvatarColor(user?.name)}
            `}
          >
            {getInitials(user?.name)}
          </div>

          {/* DROPDOWN */}
          {open && (
            <div className="absolute right-0 mt-2 w-32 rounded-lg border bg-white shadow-md">
              <button
                onClick={handleLogout}
                disabled={loading}
                className="w-full px-4 py-2 text-left text-red-500 hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Logging out..." : "Logout"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Topbar;
