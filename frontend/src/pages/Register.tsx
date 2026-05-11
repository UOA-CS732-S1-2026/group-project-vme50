import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";

import { registerUser } from "../api/authApi";
import { isAuthenticated } from "../utils/auth.util";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      await registerUser(name, email, password);

      alert("Registration successful");
      navigate("/");
    } catch (err: any) {
      alert(err.response?.data?.message || "Registration failed");
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

          <p className="text-gray-500">Create your account</p>
        </div>

        {/* FORM */}
        <div className="space-y-5">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-teal-500"
          />

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
            onClick={handleRegister}
            disabled={loading}
            className="w-full rounded-xl bg-teal-500 p-4 font-semibold text-white hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </div>

        {/* LOGIN LINK */}
        <p className="mt-6 text-center text-gray-500">
          Already have an account?{" "}
          <Link to="/" className="font-semibold text-teal-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
