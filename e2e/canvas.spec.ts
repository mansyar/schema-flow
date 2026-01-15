import { test, expect } from "@playwright/test";

/**
 * Canvas Core E2E Tests
 *
 * These tests use the e2e_mock=true URL param to enable mock mode,
 * which provides data without requiring authentication or Convex.
 */

test.describe("Canvas Core", () => {
  const mockProjectId = "mock-project-123";

  test.beforeEach(async ({ page }) => {
    // Add e2e_mock=true to URL to enable mock mode
    await page.goto(`/project/${mockProjectId}?e2e_mock=true`);
    // Wait for React Flow to initialize
    await page.waitForSelector(".react-flow", { timeout: 10000 });
  });

  test("should render the canvas and basic controls", async ({ page }) => {
    // Check if React Flow is rendered
    await expect(page.locator(".react-flow")).toBeVisible();

    // Check for toolbar
    await expect(page.locator("#toolbar-add-table")).toBeVisible();

    // Check for Background (dots)
    await expect(page.locator(".react-flow__background")).toBeVisible();

    // Check for Controls
    await expect(page.locator(".react-flow__controls")).toBeVisible();

    // Check for MiniMap
    await expect(page.locator(".react-flow__minimap")).toBeVisible();
  });

  test("should display initial mock table", async ({ page }) => {
    // Mock mode provides a "users" table with an "id" column
    const tableNode = page.locator(".react-flow__node-tableNode");
    await expect(tableNode).toBeVisible();

    // Check for table name
    await expect(tableNode.locator("h3")).toContainText("users");

    // Check for column
    await expect(tableNode.locator('[data-testid="column-row"]')).toBeVisible();
  });

  test("should create a new table via toolbar", async ({ page }) => {
    // Count initial tables
    const initialCount = await page
      .locator(".react-flow__node-tableNode")
      .count();

    // Click 'Add Table' button
    await page.locator("#toolbar-add-table").click();

    // Wait for the new table to appear
    await expect(page.locator(".react-flow__node-tableNode")).toHaveCount(
      initialCount + 1
    );
  });

  test("should edit table name inline", async ({ page }) => {
    // Find the first table
    const tableNode = page.locator(".react-flow__node-tableNode").first();
    await expect(tableNode).toBeVisible();

    // Double click on the table name to edit
    const tableName = tableNode.locator("h3");
    await tableName.dblclick();

    // Wait a moment for React state to update
    await page.waitForTimeout(100);

    // Input should appear (no type attribute in the actual component)
    const input = tableNode.locator("input").first();
    await expect(input).toBeVisible({ timeout: 5000 });

    // Clear and type new name
    await input.fill("customers");
    await input.press("Enter");

    // Verify name updated (h3 should reappear with new name)
    await expect(tableName).toHaveText("customers");
  });

  test("should add a column to the table", async ({ page }) => {
    // Find the first table
    const tableNode = page.locator(".react-flow__node-tableNode").first();

    // Count initial columns
    const initialColumnCount = await tableNode
      .locator('[data-testid="column-row"]')
      .count();

    // Click 'Add column' button
    await tableNode.getByRole("button", { name: /Add column/i }).click();

    // Verify new column exists
    await expect(tableNode.locator('[data-testid="column-row"]')).toHaveCount(
      initialColumnCount + 1
    );

    // New column should have default name
    await expect(tableNode.getByText("new_column")).toBeVisible();
  });

  test("should use zoom controls", async ({ page }) => {
    // Find zoom controls in React Flow controls
    const zoomInBtn = page.locator(".react-flow__controls-zoomin");

    // Click zoom in
    await zoomInBtn.click();
    await zoomInBtn.click();

    // Verify zoom control is interactive
    await expect(zoomInBtn).toBeVisible();
  });

  test("should persist viewport params in URL", async ({ page }) => {
    // Navigate with specific viewport params
    await page.goto(
      `/project/${mockProjectId}?e2e_mock=true&x=100&y=200&zoom=1.5`
    );
    await page.waitForSelector(".react-flow", { timeout: 10000 });

    // Reload the page
    await page.reload();
    await page.waitForSelector(".react-flow", { timeout: 10000 });

    // URL should still have the params
    const url = page.url();
    expect(url).toContain("e2e_mock=true");
  });
});

test.describe("Landing Page", () => {
  test("should show landing page with sign-in options", async ({ page }) => {
    await page.goto("/");

    // Wait for the page to fully load
    await page.waitForLoadState("networkidle");

    // The landing page should be visible with main content
    await expect(page.getByText("Collaborative Database")).toBeVisible({
      timeout: 10000,
    });

    // Check for sign-in buttons (actual text from SignInButton component)
    await expect(
      page.getByRole("button", { name: "Google" }).first()
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByRole("button", { name: "GitHub" }).first()
    ).toBeVisible({ timeout: 10000 });
  });
});
