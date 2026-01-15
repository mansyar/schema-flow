import { test, expect } from "@playwright/test";

test("has landing page content", async ({ page }) => {
  await page.goto("/");

  // Wait for page to load
  await page.waitForLoadState("networkidle");

  await expect(page.getByText("Collaborative Database")).toBeVisible();
  await expect(page.getByText("Architect")).toBeVisible();

  // Button text is just "Google", not "Sign in with Google"
  await expect(
    page.getByRole("button", { name: "Google" }).first()
  ).toBeVisible({ timeout: 10000 });
});
