/**
 * =========================================================
 * AUTHENTICATION SERVICE UNIT TESTS
 * =========================================================
 *
 * These unit tests validate the authentication business
 * logic in the auth service layer.
 *
 * The following dependencies are mocked:
 * - User Repository
 * - bcrypt
 * - jsonwebtoken
 * - Blacklist Model
 *
 * Features Tested:
 * - User registration
 * - Duplicate user prevention
 * - Email validation
 * - Login authentication
 * - Password comparison
 * - JWT token generation
 * - Logout token blacklisting
 *
 * Test Type:
 * - Unit Tests
 *
 * Tools:
 * - Vitest
 * - Mock Functions (vi.fn)
 * =========================================================
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

/* =========================================================
   MOCKS
========================================================= */

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

/* =========================================================
   IMPORTS
========================================================= */

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { userRepository } from "../../../repositories/userRepository.js";
import Blacklist from "../../../models/Blacklist.js";

import { registerUser, loginUser, logoutUser } from "../../../services/authService.js";

/* =========================================================
   MOCK REFERENCES
========================================================= */

const repo = userRepository as any;
const mockBcrypt = bcrypt as any;
const mockJwt = jwt as any;
const mockBlacklist = Blacklist as any;

/* =========================================================
   TEST SUITE
========================================================= */

describe("Auth Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* =========================================================
     REGISTER USER TESTS
  ========================================================= */

  describe("registerUser", () => {
    it("should register user successfully", async () => {
      repo.findByEmail.mockResolvedValue(null);

      mockBcrypt.hash.mockResolvedValue("hashedPassword");

      repo.createUser.mockResolvedValue({
        _id: "1",
        name: "John",
        email: "john123@aucklanduni.ac.nz",
      });

      mockJwt.sign.mockReturnValue("token");

      const result = await registerUser({
        name: "John",
        email: "john123@aucklanduni.ac.nz",
        password: "123456",
      });

      expect(repo.findByEmail).toHaveBeenCalledTimes(1);

      expect(mockBcrypt.hash).toHaveBeenCalledWith("123456", 10);

      expect(repo.createUser).toHaveBeenCalledTimes(1);

      expect(mockJwt.sign).toHaveBeenCalledTimes(1);

      expect(result.success).toBe(true);
      expect(result.message).toBe("User registered successfully.");

      expect(result.data.token).toBe("token");

      expect(result.data.user).toEqual({
        id: "1",
        name: "John",
        email: "john123@aucklanduni.ac.nz",
      });
    });

    it("should reject duplicate user", async () => {
      repo.findByEmail.mockResolvedValue({
        _id: "1",
      });

      await expect(
        registerUser({
          name: "John",
          email: "john123@aucklanduni.ac.nz",
          password: "123456",
        }),
      ).rejects.toThrow("User already exists");
    });

    it("should reject invalid email domain", async () => {
      await expect(
        registerUser({
          name: "John",
          email: "john123@gmail.com",
          password: "123456",
        }),
      ).rejects.toThrow("Only University of Auckland students can register");
    });

    it("should reject invalid UPI format", async () => {
      await expect(
        registerUser({
          name: "John",
          email: "john12@aucklanduni.ac.nz",
          password: "123456",
        }),
      ).rejects.toThrow("Invalid UPI format!");
    });
  });

  /* =========================================================
     LOGIN USER TESTS
  ========================================================= */

  describe("loginUser", () => {
    it("should login successfully", async () => {
      repo.findByEmail.mockResolvedValue({
        _id: "1",
        name: "John",
        email: "john123@aucklanduni.ac.nz",
        password: "hashedPassword",
      });

      mockBcrypt.compare.mockResolvedValue(true);

      mockJwt.sign.mockReturnValue("token");

      const result = await loginUser({
        email: "john123@aucklanduni.ac.nz",
        password: "123456",
      });

      expect(repo.findByEmail).toHaveBeenCalledTimes(1);

      expect(mockBcrypt.compare).toHaveBeenCalledWith("123456", "hashedPassword");

      expect(mockJwt.sign).toHaveBeenCalledTimes(1);

      expect(result.success).toBe(true);
      expect(result.message).toBe("Login successful.");

      expect(result.data.token).toBe("token");

      expect(result.data.user).toEqual({
        id: "1",
        name: "John",
        email: "john123@aucklanduni.ac.nz",
      });
    });

    it("should reject non-existent user", async () => {
      repo.findByEmail.mockResolvedValue(null);

      await expect(
        loginUser({
          email: "john123@aucklanduni.ac.nz",
          password: "123456",
        }),
      ).rejects.toThrow("User not found!");
    });

    it("should reject wrong password", async () => {
      repo.findByEmail.mockResolvedValue({
        _id: "1",
        password: "hashedPassword",
      });

      mockBcrypt.compare.mockResolvedValue(false);

      await expect(
        loginUser({
          email: "john123@aucklanduni.ac.nz",
          password: "wrongPassword",
        }),
      ).rejects.toThrow("Invalid credentials");
    });
  });

  /* =========================================================
     LOGOUT USER TESTS
  ========================================================= */

  describe("logoutUser", () => {
    it("should logout successfully", async () => {
      mockJwt.verify.mockReturnValue({
        exp: Math.floor(Date.now() / 1000) + 1000,
      });

      const result = await logoutUser("token");

      expect(mockJwt.verify).toHaveBeenCalledTimes(1);

      expect(mockBlacklist.create).toHaveBeenCalledTimes(1);

      expect(result.success).toBe(true);
      expect(result.message).toBe("Logged out successfully.");
    });

    it("should throw if token verification fails", async () => {
      mockJwt.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      await expect(logoutUser("invalidToken")).rejects.toThrow("Invalid token");
    });
  });
});
