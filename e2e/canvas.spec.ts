import { test, expect } from "@playwright/test";

test.describe("Canvas Core", () => {
  // We'll use a dummy project ID
  const projectId = "jd750z63ex7j6fsvky05m79g9s6xk1z8"; // Example ID format

  test.beforeEach(async ({ page }) => {
    // In a real scenario, we might need to handle auth.
    // For this test, we'll navigate to the project page.
    // We assume the environment is set up or we mock the backend.
    await page.goto(`/project/${projectId}`);
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
  });

  test("should create a new table and edit its name", async ({ page }) => {
    // Click 'Add Table' button
    const addTableBtn = page.locator("#toolbar-add-table");
    await addTableBtn.click();

    // Wait for the new table to appear
    // Default name is usually table_1
    const tableNode = page.locator(".react-flow__node-tableNode").last();
    await expect(tableNode).toBeVisible();

    // Double click to edit name
    const tableName = tableNode.locator("h3");
    await tableName.dblclick();

    // Change name
    const input = tableNode.locator("input");
    await input.fill("users_table");
    await input.press("Enter");

    // Verify name updated
    await expect(tableName).toHaveText("users_table");
  });

  test("should add a column to the table", async ({ page }) => {
    // Ensure we have a table
    await page.locator("#toolbar-add-table").click();
    const tableNode = page.locator(".react-flow__node-tableNode").last();

    // Click 'Add column' button
    const addColumnBtn = tableNode.getByRole("button", { name: /Add column/i });
    await addColumnBtn.click();

    // Verify column exists (ColumnRow)
    await expect(tableNode.locator('[data-testid="column-row"]')).toBeVisible();
    await expect(tableNode.getByText("new_column")).toBeVisible();
  });

  test("should sync viewport state to URL", async ({ page }) => {
    // Drag the canvas or use zoom buttons
    const zoomInBtn = page.getByTitle("Zoom In");
    await zoomInBtn.click();
    await zoomInBtn.click();

    // Wait for a bit for the URL to update (debounced or onEnd)
    await page.waitForTimeout(500);

    const url = page.url();
    expect(url).toContain("zoom=");
    expect(url).toContain("x=");
    expect(url).toContain("y=");
  });

  test("should persist viewport on refresh", async ({ page }) => {
    // Set a specific viewport via URL
    await page.goto(`/project/${projectId}?x=500&y=500&zoom=1.5`);

    // Reload
    await page.reload();

    // Check if URL still has the params (TanStack Router should preserve them if valid)
    const url = page.url();
    expect(url).toContain("x=500");
    expect(url).toContain("y=500");
    expect(url).toContain("zoom=1.5");
  });
});
