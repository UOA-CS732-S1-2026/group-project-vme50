import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { registerUser } from "../api/authApi";
import Register from "./Register";

vi.mock("../api/authApi", () => ({
  registerUser: vi.fn(),
}));

const mockedRegisterUser = vi.mocked(registerUser);

const renderRegister = () => {
  return render(
    <MemoryRouter initialEntries={["/register"]}>
      <Routes>
        <Route path="/" element={<div>Login Page</div>} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<div>Dashboard Page</div>} />
      </Routes>
    </MemoryRouter>,
  );
};

describe("Register page", () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockedRegisterUser.mockReset();
    vi.spyOn(window, "alert").mockImplementation(() => undefined);
  });

  it("renders the registration form", () => {
    renderRegister();

    expect(screen.getByPlaceholderText("Full Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Register" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Login" })).toBeInTheDocument();
  });

  it("alerts when required fields are missing", async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.click(screen.getByRole("button", { name: "Register" }));

    expect(window.alert).toHaveBeenCalledWith("Please fill in all fields");
    expect(mockedRegisterUser).not.toHaveBeenCalled();
  });

  it("registers a user and navigates back to login", async () => {
    const user = userEvent.setup();
    mockedRegisterUser.mockResolvedValue({
      success: true,
      message: "User registered successfully.",
    });

    renderRegister();

    await user.type(screen.getByPlaceholderText("Full Name"), "Test User");
    await user.type(screen.getByPlaceholderText("Email"), "test@aucklanduni.ac.nz");
    await user.type(screen.getByPlaceholderText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Registration successful");
      expect(screen.getByText("Login Page")).toBeInTheDocument();
    });

    expect(mockedRegisterUser).toHaveBeenCalledWith(
      "Test User",
      "test@aucklanduni.ac.nz",
      "password123",
    );
  });

  it("shows the backend error message when registration fails", async () => {
    const user = userEvent.setup();
    mockedRegisterUser.mockRejectedValue({
      response: {
        data: {
          message: "Only University of Auckland students can register",
        },
      },
    });

    renderRegister();

    await user.type(screen.getByPlaceholderText("Full Name"), "Test User");
    await user.type(screen.getByPlaceholderText("Email"), "test@gmail.com");
    await user.type(screen.getByPlaceholderText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Only University of Auckland students can register");
    });
  });
});
