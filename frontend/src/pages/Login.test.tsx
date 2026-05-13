import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { loginUser } from "../api/authApi";
import { getUser, TOKEN_KEY } from "../utils/auth.util";
import Login from "./Login";

vi.mock("../api/authApi", () => ({
  loginUser: vi.fn(),
}));

const mockedLoginUser = vi.mocked(loginUser);

const renderLogin = () => {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<div>Register Page</div>} />
        <Route path="/dashboard" element={<div>Dashboard Page</div>} />
      </Routes>
    </MemoryRouter>,
  );
};

describe("Login page", () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockedLoginUser.mockReset();
    vi.spyOn(window, "alert").mockImplementation(() => undefined);
  });

  it("renders the login form", () => {
    renderLogin();

    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Register" })).toBeInTheDocument();
  });

  it("alerts when required fields are missing", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(window.alert).toHaveBeenCalledWith("Please fill in all fields");
    expect(mockedLoginUser).not.toHaveBeenCalled();
  });

  it("stores auth details and navigates to dashboard after successful login", async () => {
    const user = userEvent.setup();
    mockedLoginUser.mockResolvedValue({
      data: {
        token: "test-token",
        user: {
          id: "user-1",
          name: "Test User",
          email: "test@aucklanduni.ac.nz",
        },
      },
    });

    renderLogin();

    await user.type(screen.getByPlaceholderText("Email"), "test@aucklanduni.ac.nz");
    await user.type(screen.getByPlaceholderText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
    });

    expect(mockedLoginUser).toHaveBeenCalledWith("test@aucklanduni.ac.nz", "password123");
    expect(window.localStorage.getItem(TOKEN_KEY)).toBe("test-token");
    expect(getUser()).toMatchObject({
      _id: "user-1",
      name: "Test User",
      email: "test@aucklanduni.ac.nz",
    });
  });

  it("shows the backend error message when login fails", async () => {
    const user = userEvent.setup();
    mockedLoginUser.mockRejectedValue({
      response: {
        data: {
          message: "Invalid credentials",
        },
      },
    });

    renderLogin();

    await user.type(screen.getByPlaceholderText("Email"), "test@aucklanduni.ac.nz");
    await user.type(screen.getByPlaceholderText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Invalid credentials");
    });
  });
});
