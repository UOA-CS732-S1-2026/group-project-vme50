import { describe, it, expect, vi, beforeEach } from "vitest";

/* ================= MOCKS (FIRST) ================= */

vi.mock("../../../repositories/userRepository.js", () => ({
  userRepository: {
    findByEmail: vi.fn(),
    createUser: vi.fn(),
  },
}));

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn(),
  },
}));

vi.mock("../../../models/Blacklist.js", () => ({
  default: {
    create: vi.fn().mockResolvedValue(true),
  },
}));

/* ================= IMPORTS ================= */

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userRepository } from "../../../repositories/userRepository.js";
import Blacklist from "../../../models/Blacklist.js";

import { registerUser, loginUser, logoutUser } from "../../../services/authService.js";

/* ================= MOCK REFS ================= */

const repo = userRepository as any;
const mockBcrypt = bcrypt as any;
const mockJwt = jwt as any;
const mockBlacklist = Blacklist as any;

/* ================= TESTS ================= */

describe("Auth Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* ---------- REGISTER ---------- */

  it("registerUser → success", async () => {
    repo.findByEmail.mockResolvedValue(null);

    mockBcrypt.hash.mockResolvedValue("hashed");

    repo.createUser.mockResolvedValue({
      _id: "1",
      name: "John",
      email: "john@aucklanduni.ac.nz",
    });

    mockJwt.sign.mockReturnValue("token");

    const result = await registerUser({
      name: "John",
      email: "john@aucklanduni.ac.nz",
      password: "123",
    });

    expect(result.data.token).toBe("token");
    expect(result.data.user).toEqual({
      id: "1",
      name: "John",
      email: "john@aucklanduni.ac.nz",
    });
  });

  it("registerUser → existing user", async () => {
    repo.findByEmail.mockResolvedValue({ _id: "1" });

    await expect(
      registerUser({
        name: "John",
        email: "john@aucklanduni.ac.nz",
        password: "123",
      }),
    ).rejects.toThrow("User already exists");
  });

  /* ---------- LOGIN ---------- */

  it("loginUser → success", async () => {
    repo.findByEmail.mockResolvedValue({
      _id: "1",
      name: "John",
      email: "john@aucklanduni.ac.nz",
      password: "hashed",
    });

    mockBcrypt.compare.mockResolvedValue(true);
    mockJwt.sign.mockReturnValue("token");

    const result = await loginUser({
      email: "john@aucklanduni.ac.nz",
      password: "123",
    });

    expect(result.data.token).toBe("token");
    expect(result.data.user).toEqual({
      id: "1",
      name: "John",
      email: "john@aucklanduni.ac.nz",
    });
  });

  it("loginUser → invalid user", async () => {
    repo.findByEmail.mockResolvedValue(null);

    await expect(
      loginUser({
        email: "john@aucklanduni.ac.nz",
        password: "123",
      }),
    ).rejects.toThrow("Invalid credentials");
  });

  /* ---------- LOGOUT ---------- */

  it("logoutUser → success", async () => {
    mockJwt.verify.mockReturnValue({
      exp: Math.floor(Date.now() / 1000) + 1000,
    });

    const result = await logoutUser("token");

    expect(result.success).toBe(true);
    expect(mockBlacklist.create).toHaveBeenCalledTimes(1);
  });
});
