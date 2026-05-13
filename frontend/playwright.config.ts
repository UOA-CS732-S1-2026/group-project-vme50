/* global process */
import { defineConfig, devices } from "@playwright/test";

const frontendUrl = "http://127.0.0.1:5173";
const backendUrl = "http://127.0.0.1:5050";
const e2eRunId = process.env.E2E_RUN_ID ?? String(Date.now());

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: frontendUrl,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "npx tsc && node dist/server.js",
      cwd: "../backend",
      url: backendUrl,
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
      env: {
        ...process.env,
        CLIENT_URL: frontendUrl,
        JWT_SECRET: process.env.JWT_SECRET ?? "playwright-e2e-secret",
        MONGO_URI: process.env.MONGO_URI ?? `mongodb://127.0.0.1:27017/platemates_e2e_${e2eRunId}`,
        NODE_ENV: "development",
        PORT: "5050",
      },
    },
    {
      command: "npm run dev -- --host 127.0.0.1 --port 5173",
      cwd: ".",
      url: frontendUrl,
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
      env: {
        ...process.env,
        VITE_API_URL: backendUrl,
      },
    },
  ],
});
