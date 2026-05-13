import { useEffect, useState } from "react";

import Topbar from "../components/dashboard/Topbar";
import InviteCard from "../components/dashboard/InviteCard";
import CreateMealModal from "../components/dashboard/CreateMealModal";

import { getMeals, createMeal, joinMeal, leaveMeal } from "../api/mealApi";
import { getUser } from "../utils/auth.util";

import { socket } from "../socket/socket";

function Dashboard() {
  const [meals, setMeals] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  // TOGGLE STATE
  const [view, setView] = useState<"all" | "mine">("all");

  const user = getUser();
  const userId = String(user?._id);

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    const fetchMeals = async () => {
      const res = await getMeals();
      setMeals(res.data);
    };

    fetchMeals();
  }, []);

  /* ================= SOCKET REALTIME ================= */
  useEffect(() => {
    socket.on("connect", () => {
      console.log("🟢 Socket connected:", socket.id);
    });

    /* MEAL SLOTS UPDATED */
    socket.on("mealSlotsUpdated", (data) => {
      console.log("📡 SOCKET UPDATE:", data);

      setMeals((prev) =>
        prev.map((meal) =>
          meal._id === data.mealId
            ? {
                ...meal,
                _realtimeCount: data.current,
                participants: data.participants,
              }
            : meal,
        ),
      );
    });

    /* NEW MEAL CREATED */
    socket.on("mealCreated", (newMeal) => {
      console.log("🆕 NEW MEAL:", newMeal);

      setMeals((prev) => [newMeal, ...prev]);
    });

    /* MEAL DELETED */
    socket.on("mealDeleted", (mealId) => {
      console.log("🗑️ MEAL DELETED:", mealId);

      setMeals((prev) => prev.filter((meal) => meal._id !== mealId));
    });

    return () => {
      socket.off("mealSlotsUpdated");
      socket.off("mealCreated");
      socket.off("mealDeleted");
      socket.off("connect");
    };
  }, []);

  /* ================= CREATE ================= */
  const handleCreateMeal = async (mealData: any) => {
    await createMeal(mealData);
    setShowModal(false);

    const res = await getMeals();
    setMeals(res.data);
  };

  /* ================= JOIN ================= */
  const handleJoin = async (id: string) => {
    await joinMeal(id);

    const res = await getMeals();
    setMeals(res.data);
  };

  /* ================= LEAVE ================= */
  const handleLeave = async (id: string) => {
    await leaveMeal(id);

    const res = await getMeals();
    setMeals(res.data);
  };

  /* ================= CHECK USER IN MEAL ================= */
  const isUserInMeal = (participants: any[]) => {
    if (!participants) return false;

    return participants.some((p: any) => {
      const pid = typeof p === "object" ? String(p._id) : String(p);
      return pid === userId;
    });
  };

  /* ================= FILTERED MEALS ================= */
  const filteredMeals =
    view === "mine" ? meals.filter((meal) => isUserInMeal(meal.participants)) : meals;

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-b from-gray-100 via-white to-gray-100 flex flex-col">
      <Topbar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HERO */}
        <div className="px-8 pt-6">
          <div className="bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl shadow-lg p-6 text-white">
            <h2 className="text-4xl font-bold tracking-tight">Welcome to Platemates</h2>

            <p className="mt-2 text-white/80 text-sm">Share meals, make friends, save money.</p>

            <button
              onClick={() => setShowModal(true)}
              className="mt-6 bg-white text-teal-600 font-semibold px-5 py-2 rounded-xl hover:bg-gray-100 transition shadow-sm cursor-pointer"
            >
              + Create Invite
            </button>
          </div>
        </div>

        {/* HEADER */}
        <div className="px-8 mt-4 flex items-end justify-between">
          {/* LEFT: TITLE */}
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              {view === "all" ? "Available Meals" : "My Meals"}
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              {view === "all" ? "Join sessions or leave your current ones" : "Meals you’ve joined"}
            </p>
          </div>

          {/* RIGHT: TOGGLE */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("all")}
              className={`px-3 py-1 rounded-full text-sm font-medium transition cursor-pointer ${
                view === "all"
                  ? "bg-teal-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All Meals
            </button>

            <button
              onClick={() => setView("mine")}
              className={`px-3 py-1 rounded-full text-sm font-medium transition cursor-pointer ${
                view === "mine"
                  ? "bg-teal-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              My Meals
            </button>

            <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full border ml-2">
              {filteredMeals.length} meals
            </div>
          </div>
        </div>

        {/* MEALS */}
        <div className="px-8 py-2">
          <div className="bg-white/70 backdrop-blur border border-gray-200 rounded-2xl shadow-sm p-4 max-h-[calc(100vh-360px)] overflow-y-auto">
            {filteredMeals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-5xl">🍱</div>

                <h3 className="mt-4 text-lg font-semibold text-gray-700">
                  {view === "all" ? "No meals available yet" : "You haven’t joined any meals yet"}
                </h3>

                <p className="text-sm text-gray-500 mt-1 max-w-md">
                  {view === "all"
                    ? "Be the first to create a meal and start inviting people around you."
                    : "Join a meal to see it appear here."}
                </p>

                <button
                  onClick={() => setShowModal(true)}
                  className="mt-5 bg-teal-500 text-white px-5 py-2.5 rounded-xl hover:bg-teal-600 transition"
                >
                  Create First Meal
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredMeals.map((meal) => {
                  const joined = isUserInMeal(meal.participants);

                  return (
                    <div
                      key={meal._id}
                      className="w-full bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition"
                    >
                      <InviteCard
                        id={meal._id}
                        title={meal.title}
                        description={meal.description}
                        location={meal.location}
                        time={meal.time}
                        current={meal._realtimeCount ?? meal.participants?.length ?? 0}
                        max={meal.slots}
                        joined={joined}
                        creator={meal.creator.name}
                        onJoin={handleJoin}
                        onLeave={handleLeave}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <CreateMealModal onClose={() => setShowModal(false)} onCreate={handleCreateMeal} />
      )}
    </div>
  );
}

export default Dashboard;
