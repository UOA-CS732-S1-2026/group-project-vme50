import { useEffect, useState } from "react";

import Topbar from "../components/dashboard/Topbar";
import InviteCard from "../components/dashboard/InviteCard";
import CreateMealModal from "../components/dashboard/CreateMealModal";

import { getMeals, createMeal, joinMeal, leaveMeal } from "../api/mealApi";
import { getUser } from "../utils/auth.util";

function Dashboard() {
  const [meals, setMeals] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 via-white to-gray-100">
      <Topbar />

      {/* HERO */}
      <div className="px-8 pt-8">
        <div className="bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl shadow-lg p-8 text-white">
          <h2 className="text-4xl font-bold tracking-tight">Welcome to Platemates</h2>

          <p className="mt-2 text-white/80 text-sm">Share meals, make friends, save money.</p>

          <button
            onClick={() => setShowModal(true)}
            className="mt-6 bg-white text-teal-600 font-semibold px-5 py-3 rounded-xl hover:bg-gray-100 transition shadow-sm cursor-pointer"
          >
            + Invite Meal
          </button>
        </div>
      </div>

      {/* HEADER */}
      <div className="px-8 mt-10">
        <div className="flex items-end justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Available Meals</h3>
            <p className="text-sm text-gray-500 mt-1">Join a session or leave your current one</p>
          </div>

          <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full border">
            {meals.length} meals
          </div>
        </div>
      </div>

      {/* MEALS */}
      <div className="px-8 py-6">
        <div className="bg-white/70 backdrop-blur border border-gray-200 rounded-2xl shadow-sm p-6">
          {meals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-5xl">🍱</div>

              <h3 className="mt-4 text-lg font-semibold text-gray-700">No meals available yet</h3>

              <p className="text-sm text-gray-500 mt-1 max-w-md">
                Be the first to create a meal and start inviting people around you.
              </p>

              <button
                onClick={() => setShowModal(true)}
                className="mt-5 bg-teal-500 text-white px-5 py-2.5 rounded-xl hover:bg-teal-600 transition"
              >
                Create First Meal
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {meals.map((meal) => {
                const joined = isUserInMeal(meal.participants);

                return (
                  <div
                    key={meal._id}
                    className="bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition"
                  >
                    <InviteCard
                      id={meal._id}
                      title={meal.title}
                      description={meal.description}
                      location={meal.location}
                      time={meal.time}
                      current={meal.participants?.length || 0}
                      max={meal.slots}
                      joined={joined}
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

      {/* MODAL */}
      {showModal && (
        <CreateMealModal onClose={() => setShowModal(false)} onCreate={handleCreateMeal} />
      )}
    </div>
  );
}

export default Dashboard;
