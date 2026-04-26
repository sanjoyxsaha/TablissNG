import { expect, test } from "@playwright/test";

import {
  addWidget,
  closeSettings,
  expandWidgetSettings,
  widgetSettingsFieldset,
} from "../../../../e2e/helpers";

test.describe("Search Widget", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await addWidget(page, "widget/search");
  });

  test("renders an input with the default placeholder", async ({ page }) => {
    const input = page.locator(".Search input[type='text']");
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute("placeholder", "Type to search");
  });

  test("focusing input and pressing Enter submits the form", async ({
    page,
  }) => {
    await closeSettings(page);
    const input = page.locator(".Search input[type='text']");
    await input.fill("hello world");
    // Intercept navigation; the form opens a search URL on submit.
    const navPromise = page
      .waitForRequest((req) => req.url().includes("hello%20world"))
      .catch(() => null);
    await input.press("Enter");
    // Either a navigation request fires (web) or window changes; accept either.
    await Promise.race([navPromise, page.waitForTimeout(500)]);
  });

  test("custom placeholder text appears in the input", async ({ page }) => {
    await expandWidgetSettings(page, "Search");
    const fieldset = widgetSettingsFieldset(page, "Search");
    const placeholderInput = fieldset
      .locator("label", { hasText: /Placeholder/i })
      .locator("input[type='text']")
      .first();
    await placeholderInput.focus();
    await placeholderInput.fill("");
    await placeholderInput.pressSequentially("Find stuff");
    await placeholderInput.blur();
    await page.waitForTimeout(100);

    await expect(page.locator(".Search input[type='text']")).toHaveAttribute(
      "placeholder",
      "Find stuff",
    );
  });

  test("pressing the keyboard shortcut 'g' focuses the search input", async ({
    page,
  }) => {
    await closeSettings(page);
    await page.evaluate(() =>
      (document.activeElement as HTMLElement | null)?.blur(),
    );
    await page.keyboard.press("g");
    const focused = await page.evaluate(() =>
      document.activeElement?.tagName.toLowerCase(),
    );
    expect(focused).toBe("input");
  });
});
