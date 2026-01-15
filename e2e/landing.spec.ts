import { test, expect } from "@playwright/test";

test("has landing page content", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Collaborative Database")).toBeVisible();
  await expect(page.getByText("Architect")).toBeVisible();
  await expect(page.getByRole("button", { name: /google/i })).toBeVisible();
});
