import { expect, test } from "@playwright/test";

import {
  addWidget,
  closeSettings,
  expandWidgetSettings,
  widgetSettingsFieldset,
} from "../../../../e2e/helpers";

test.describe("Tally Counter Widget", () => {
  const PERSISTENCE_SETTLE_MS = 1200;

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await addWidget(page, "widget/tallyCounter");
  });

  test("renders with the default count of 0", async ({ page }) => {
    await expect(page.locator(".TallyCounter .count")).toHaveText("0");
  });

  test("increments and decrements the count", async ({ page }) => {
    await closeSettings(page);
    const count = page.locator(".TallyCounter .count");
    const inc = page.locator('.TallyCounter button[title="Increment"]');
    const dec = page.locator('.TallyCounter button[title="Decrement"]');
    await expect(inc).toBeVisible();

    await inc.click();
    await inc.click();
    await inc.click();
    await expect(count).toHaveText("3");

    await dec.click();
    await expect(count).toHaveText("2");
  });

  test("reset button returns count to zero", async ({ page }) => {
    await closeSettings(page);
    const inc = page.locator('.TallyCounter button[title="Increment"]');
    await expect(inc).toBeVisible();

    await inc.click();
    await inc.click();
    await expect(page.locator(".TallyCounter .count")).toHaveText("2");

    await page
      .locator(".TallyCounter .reset-btn")
      .click({ position: { x: 10, y: 10 } });
    await expect(page.locator(".TallyCounter .count")).toHaveText("0");
  });

  test("respects a custom step value", async ({ page }) => {
    await expandWidgetSettings(page, "Tally Counter");
    const stepInput = widgetSettingsFieldset(page, "Tally Counter")
      .locator("label", { hasText: "Step" })
      .locator('input[type="number"]');
    await stepInput.fill("5");
    await stepInput.blur();
    await page.waitForTimeout(100);

    await closeSettings(page);
    await page.waitForTimeout(100);

    await page.locator('.TallyCounter button[title="Increment"]').click();
    await expect(page.locator(".TallyCounter .count")).toHaveText("5");
  });

  test("hides the reset button when 'Show reset button' is unchecked", async ({
    page,
  }) => {
    await expandWidgetSettings(page, "Tally Counter");
    await widgetSettingsFieldset(page, "Tally Counter")
      .locator("label", { hasText: "Show reset button" })
      .locator('input[type="checkbox"]')
      .uncheck();
    await closeSettings(page);
    await expect(page.locator(".TallyCounter .reset-btn")).toHaveCount(0);
  });

  test("count persists across reloads", async ({ page }) => {
    if (await page.locator(".Settings .plane").isVisible()) {
      await page.keyboard.press("Escape");
      await page.waitForTimeout(200);
    }

    await expect(page.locator(".TallyCounter .count")).toBeVisible();
    await page.locator('.TallyCounter button[title="Increment"]').click();
    await page.waitForTimeout(50);
    await page.locator('.TallyCounter button[title="Increment"]').click();
    await page.waitForTimeout(50);

    await expect(page.locator(".TallyCounter .count")).toHaveText("2");
    await page.waitForTimeout(PERSISTENCE_SETTLE_MS);

    await page.reload();
    await page.waitForTimeout(200);

    await expect(page.locator(".TallyCounter")).toBeVisible();
    await expect(page.locator(".TallyCounter .count")).toHaveText("2");
  });
});
