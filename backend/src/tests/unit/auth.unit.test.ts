import { describe, it, expect, vi, beforeEach } from "vitest";

/* ================= MOCKS (MUST BE FIRST) ================= */

vi.mock("../../models/User.js", () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn(),
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

vi.mock("../../models/Blacklist.js", () => ({
  default: {
    create: vi.fn(),
  },
}));

/* ================= IMPORTS ================= */

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/User.js";

import { registerUser, loginUser, logoutUser } from "../../services/authService.js";

const mockedUser = User as any;
const mockedBcrypt = bcrypt as any;
const mockedJwt = jwt as any;

/* ================= TEST SUITE ================= */

describe("Auth Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* ================= REGISTER ================= */

  it("registerUser → success", async () => {
    mockedUser.findOne.mockResolvedValue(null);
    mockedBcrypt.hash.mockResolvedValue("hashed");
    mockedUser.create.mockResolvedValue({
      _id: "1",
      email: "john@aucklanduni.ac.nz",
    });
    mockedJwt.sign.mockReturnValue("token");

    const result = await registerUser({
      name: "John",
      email: "john@aucklanduni.ac.nz",
      password: "123",
    });

    expect(result).toBe("token");
  });

  it("registerUser → user exists", async () => {
    mockedUser.findOne.mockResolvedValue({ _id: "1" });

    await expect(
      registerUser({
        name: "John",
        email: "john@aucklanduni.ac.nz",
        password: "123",
      }),
    ).rejects.toThrow();
  });

  /* ================= LOGIN ================= */

  it("loginUser → success", async () => {
    mockedUser.findOne.mockResolvedValue({
      _id: "1",
      password: "hashed",
    });

    mockedBcrypt.compare.mockResolvedValue(true);
    mockedJwt.sign.mockReturnValue("token");

    const result = await loginUser({
      email: "john@aucklanduni.ac.nz",
      password: "123",
    });

    expect(result).toBe("token");
  });

  it("loginUser → invalid user", async () => {
    mockedUser.findOne.mockResolvedValue(null);

    await expect(
      loginUser({
        email: "john@aucklanduni.ac.nz",
        password: "123",
      }),
    ).rejects.toThrow();
  });

  /* ================= LOGOUT ================= */

  it("logoutUser → success", async () => {
    mockedJwt.verify.mockReturnValue({
      exp: Math.floor(Date.now() / 1000) + 1000,
    });

    const result = await logoutUser("token");

    expect(result).toBe(true);
  });
});
