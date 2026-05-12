import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

import ProtectedRoute from "./components/redirect/ProtectedRoute";
import PageTitle from "./hooks/usePageTitle";

import "./utils/fixLeafletIcon.util";
import Profile from "./pages/Profile";

function App() {
  return (
    <BrowserRouter>
      <PageTitle>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* PROTECTED ROUTE */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
               </ProtectedRoute>
            }
          />

          {/* NOT FOUND */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </PageTitle>
    </BrowserRouter>
  );
}

export default App;
