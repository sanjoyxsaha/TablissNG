import { expect, test } from "@playwright/test";

import { openSettings, settingsSection } from "../../../e2e/helpers";

test.describe("System Settings", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await openSettings(page);
  });

  test("changes theme to Dark and applies the dark class to body", async ({
    page,
  }) => {
    const themeSelect = page
      .locator("label", { hasText: "Theme" })
      .locator("select");
    await themeSelect.selectOption("dark");
    await expect(page.locator("body")).toHaveClass(/dark/);

    await themeSelect.selectOption("light");
    await expect(page.locator("body")).not.toHaveClass(/dark/);
  });

  test("changes accent color and resets it back to default", async ({
    page,
  }) => {
    const colorInput = page
      .locator("label", { hasText: "Accent Color" })
      .locator('input[type="color"]');
    await colorInput.fill("#ff0000");
    await page.waitForTimeout(50);

    await expect
      .poll(() =>
        page.evaluate(() =>
          getComputedStyle(document.documentElement)
            .getPropertyValue("--accent-color")
            .trim(),
        ),
      )
      .toBe("#ff0000");

    await page
      .locator("label", { hasText: "Accent Color" })
      .locator("button", { hasText: "Reset" })
      .click();
    await expect(colorInput).toHaveValue("#3498db");
  });

  test("toggles auto-hide settings menu", async ({ page }) => {
    const checkbox = page
      .locator("label", { hasText: "Auto-hide Settings Menu" })
      .locator('input[type="checkbox"]');
    await expect(checkbox).not.toBeChecked();
    await checkbox.check();
    await expect(checkbox).toBeChecked();

    // The hover area only renders when auto-hide is enabled.
    await expect(page.locator(".settings-hover-area")).toBeAttached();
  });

  test("toggles hide settings toolbar", async ({ page }) => {
    const checkbox = page
      .locator("label", { hasText: "Hide Settings Toolbar" })
      .locator('input[type="checkbox"]');
    await checkbox.check();
    await expect(page.locator(".Overlay")).toHaveClass(/hidden/);
  });

  test("changes the settings icon position", async ({ page }) => {
    const topRightButton = page
      .locator(".u-grid-2col-icon-position .u-grid-3x2-compact button")
      .nth(2);
    await topRightButton.scrollIntoViewIfNeeded();
    await topRightButton.click({ force: true });

    await expect
      .poll(async () => page.locator(".Overlay").getAttribute("class"), {
        timeout: 10000,
      })
      .toContain("topRight");
  });

  test("Import / Export / Reset links are present", async ({ page }) => {
    await expect(
      page.locator(".Settings a", { hasText: "Import" }),
    ).toBeVisible();
    await expect(
      page.locator(".Settings a", { hasText: "export" }),
    ).toBeVisible();
    await expect(
      page.locator(".Settings a", { hasText: "reset" }),
    ).toBeVisible();
  });

  test("changes language to German and updates section heading", async ({
    page,
  }) => {
    const localeSelect = settingsSection(page, "Settings")
      .locator("label", { hasText: "Language" })
      .locator("select");
    await localeSelect.selectOption("de");
    // German title for "Background" is "Hintergrund".
    await expect(
      page.locator(".Settings h2", { hasText: "Hintergrund" }),
    ).toBeVisible();
  });
});
