import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";

import { isAuthenticated, setAuth } from "../utils/auth.util";
import { loginUser } from "../api/authApi";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await loginUser(email, password);
      const { token, user } = response.data;

      setAuth(token, user);
      navigate("/dashboard");
    } catch (err: any) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-lg">
        {/* HEADER */}
        <div className="mb-8 text-center">
          {/* LOGO + TITLE */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <img src="/favicon.svg" alt="Platemates logo" className="h-7 w-7" />

            <h1 className="text-4xl font-bold text-teal-600">Platemates</h1>
          </div>

          <p className="text-gray-500">Welcome back</p>
        </div>

        {/* FORM */}
        <div className="space-y-5">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-teal-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-teal-500"
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full rounded-xl bg-teal-500 p-4 font-semibold text-white hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>

        {/* REGISTER LINK */}
        <p className="mt-6 text-center text-gray-500">
          No account?{" "}
          <Link to="/register" className="font-semibold text-teal-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
