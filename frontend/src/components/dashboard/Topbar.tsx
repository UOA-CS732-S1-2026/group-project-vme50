import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { logoutUser } from "../../api/authApi";
import { getMyProfile } from "../../api/userApi";

import { clearAuth } from "../../utils/auth.util";
import { getInitials } from "../../utils/avatar.util";

function Topbar() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getMyProfile();
        setUser(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();
  }, []);

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
      <div className="flex items-center gap-2">
        <img src="/favicon.svg" alt="Platemates logo" className="h-6 w-6" />
        <h1 className="text-2xl font-bold text-teal-600">Platemates</h1>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-700">{user?.name || ""}</span>

        <div className="relative">
          <div
            onClick={() => setOpen(!open)}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-white font-semibold text-white shadow"
            style={{ backgroundColor: user?.avatarColor || "#10b981" }}
          >
            {getInitials(user?.name)}
          </div>

          {open && (
            <div className="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-lg border bg-white shadow-md">
              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/profile");
                }}
                className="w-full cursor-pointer px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
              >
                Profile
              </button>

              <button
                onClick={handleLogout}
                disabled={loading}
                className="w-full cursor-pointer px-4 py-2 text-left text-red-500 hover:bg-gray-100 disabled:opacity-50"
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