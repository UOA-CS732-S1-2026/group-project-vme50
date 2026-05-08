import Topbar from "../components/dashboard/Topbar";

function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* TOPBAR */}
      <Topbar />

      {/* HEADER */}
      <div className="px-8 pt-8">
        <h2 className="text-3xl font-bold text-gray-800">Welcome to Platemates</h2>

        <p className="mt-2 text-gray-500">Share meals, make friends, save money.</p>

        <button className="mt-6 rounded-xl bg-teal-500 px-5 py-3 font-semibold text-white hover:bg-teal-600">
          + Invite Meal
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
