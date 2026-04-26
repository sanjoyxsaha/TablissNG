import { expect, test } from "@playwright/test";

import { selectBackground, settingsSection } from "../../../../e2e/helpers";

test.describe("Solid Colour Background", () => {
  const PERSISTENCE_SETTLE_MS = 1200;

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders the default solid colour background", async ({ page }) => {
    await selectBackground(page, "background/colour");
    const colour = page.locator(".Colour.fullscreen");
    await expect(colour).toBeVisible();
    // Default colour is #3498db
    await expect(colour).toHaveCSS("background-color", "rgb(52, 152, 219)");
  });

  test("updates the background when colour is changed", async ({ page }) => {
    await selectBackground(page, "background/colour");
    const input = settingsSection(page, "Background").locator(
      ".ColourSettings input[type='color']",
    );
    await input.fill("#00ff00");
    await expect(page.locator(".Colour.fullscreen")).toHaveCSS(
      "background-color",
      "rgb(0, 255, 0)",
    );
  });

  test("background plugin selection persists across reloads", async ({
    page,
  }) => {
    await selectBackground(page, "background/colour");
    await page.waitForTimeout(PERSISTENCE_SETTLE_MS);
    await page.reload();
    await expect(page.locator(".Colour.fullscreen")).toBeVisible();
  });
});
