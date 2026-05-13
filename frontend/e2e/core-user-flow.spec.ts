import { expect, test, type Page } from "@playwright/test";

const password = "Password123!";

const toDateTimeLocal = (date: Date) => {
  const timezoneOffsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 16);
};

const registerUser = async (page: Page, name: string, email: string) => {
  await page.goto("/register");
  await page.getByPlaceholder("Full Name").fill(name);
  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder("Password").fill(password);

  const registrationDialog = page.waitForEvent("dialog");
  await page.getByRole("button", { name: "Register" }).click();

  const dialog = await registrationDialog;
  expect(dialog.message()).toBe("Registration successful");
  await dialog.accept();

  await expect(page.getByText("Login Page").or(page.getByText("Welcome back"))).toBeVisible();
};

const loginUser = async (page: Page, email: string) => {
  await page.goto("/");
  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder("Password").fill(password);
  await page.getByRole("button", { name: "Login" }).click();

  await expect(page.getByRole("heading", { name: "Welcome to Platemates" })).toBeVisible();
};

const mockMapServices = async (page: Page) => {
  await page.route("https://nominatim.openstreetmap.org/**", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        display_name: "22 Princes Street, Auckland",
        address: {
          house_number: "22",
          road: "Princes Street",
          suburb: "Auckland Central",
          city: "Auckland",
        },
      }),
    });
  });

  await page.route(/https:\/\/.*\.tile\.openstreetmap\.org\/.*/, async (route) => {
    await route.fulfill({ status: 204, body: "" });
  });
};

test("user can register, log in, create a meal, and another user can join and leave", async ({
  browser,
}) => {
  const suffix = String(Date.now()).slice(-3);
  const mealTitle = `E2E Lunch ${Date.now()}`;
  const creator = {
    name: "E2E Creator",
    email: `eeca${suffix}@aucklanduni.ac.nz`,
  };
  const joiner = {
    name: "E2E Joiner",
    email: `eejo${suffix}@aucklanduni.ac.nz`,
  };

  const creatorContext = await browser.newContext();
  const creatorPage = await creatorContext.newPage();
  await mockMapServices(creatorPage);

  await registerUser(creatorPage, creator.name, creator.email);
  await loginUser(creatorPage, creator.email);

  await creatorPage.getByRole("button", { name: "+ Create Invite" }).click();
  await creatorPage.getByPlaceholder("Title").fill(mealTitle);
  await creatorPage.getByPlaceholder("Description").fill("Smoke test meal session");
  await creatorPage.locator(".leaflet-container").click({ position: { x: 180, y: 140 } });
  await creatorPage
    .locator('input[name="time"]')
    .fill(toDateTimeLocal(new Date(Date.now() + 2 * 60 * 60 * 1000)));
  await creatorPage.locator('input[name="slots"]').fill("2");
  await creatorPage.getByRole("button", { name: "Create", exact: true }).click();

  const creatorMealCard = creatorPage.getByTestId("meal-card").filter({ hasText: mealTitle });
  await expect(creatorMealCard).toBeVisible();
  await expect(creatorMealCard.getByText("1/2")).toBeVisible();

  const joinerContext = await browser.newContext();
  const joinerPage = await joinerContext.newPage();
  await mockMapServices(joinerPage);

  await registerUser(joinerPage, joiner.name, joiner.email);
  await loginUser(joinerPage, joiner.email);

  const joinerMealCard = joinerPage.getByTestId("meal-card").filter({ hasText: mealTitle });
  await expect(joinerMealCard).toBeVisible();
  await joinerMealCard.getByRole("button", { name: "Join Meal" }).click();

  await expect(joinerMealCard.getByRole("button", { name: "Leave Meal" })).toBeVisible();
  await expect(joinerMealCard.getByText("2/2")).toBeVisible();

  await joinerMealCard.getByRole("button", { name: "Leave Meal" }).click();

  await expect(joinerMealCard.getByRole("button", { name: "Join Meal" })).toBeVisible();

  await creatorPage.getByTestId("user-menu-button").click();
  await creatorPage.getByRole("button", { name: "Logout" }).click();
  await expect(creatorPage.getByText("Welcome back")).toBeVisible();

  await creatorContext.close();
  await joinerContext.close();
});
