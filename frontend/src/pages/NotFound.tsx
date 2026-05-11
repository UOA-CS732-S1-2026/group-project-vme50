import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
      {/* 404 */}
      <h1 className="text-7xl font-extrabold text-emerald-500">404</h1>

      {/* TITLE */}
      <h2 className="mt-4 text-2xl font-bold text-gray-800">Page Not Found</h2>

      {/* DESCRIPTION */}
      <p className="mt-2 text-gray-500 max-w-md">
        The page you are looking for does not exist or may have been moved.
      </p>

      {/* BUTTON */}
      <Link
        to="/"
        className="mt-6 px-6 py-3 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition shadow-sm"
      >
        Go to Login Page
      </Link>
    </div>
  );
}

export default NotFound;
