import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";

import ProtectedRoute from "./ProtectedRoute";
import { TOKEN_KEY } from "../../utils/auth.util";

const renderProtectedDashboard = () => {
  return render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <Routes>
        <Route path="/" element={<div>Login Page</div>} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div>Dashboard Page</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
};

describe("ProtectedRoute", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("redirects unauthenticated users to login", () => {
    renderProtectedDashboard();

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("renders protected content for authenticated users", () => {
    window.localStorage.setItem(TOKEN_KEY, "test-token");

    renderProtectedDashboard();

    expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
  });
});
