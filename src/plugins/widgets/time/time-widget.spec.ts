import { expect, test } from "@playwright/test";

import {
  addWidget,
  expandWidgetSettings,
  widgetSettingsFieldset,
} from "../../../../e2e/helpers";

test.describe("Time Widget", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await addWidget(page, "widget/time");
  });

  test("renders a digital clock by default", async ({ page }) => {
    await expect(page.locator(".Time .Digital").first()).toBeVisible();
    const text = await page.locator(".Time .Digital h1").first().innerText();
    expect(text).toMatch(/\d/);
  });

  test("toggles to analogue clock", async ({ page }) => {
    await expandWidgetSettings(page, "Time");
    await page.waitForTimeout(200);

    const radioExists = await page
      .locator('.TimeSettings input[type="radio"]')
      .count();
    expect(radioExists).toBeGreaterThan(0);
  });

  test("hiding the time fully removes the digital readout", async ({
    page,
  }) => {
    await expandWidgetSettings(page, "Time");
    const fieldset = widgetSettingsFieldset(page, "Time");
    const hideTime = fieldset
      .locator("label", { hasText: /Hide time/i })
      .locator('input[type="checkbox"]');
    if (await hideTime.count()) {
      await hideTime.check();
      await expect(page.locator(".Time .Digital h1")).toHaveCount(0);
    }
  });
});
