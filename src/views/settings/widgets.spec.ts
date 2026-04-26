import { expect, test } from "@playwright/test";

import { addWidget, openSettings } from "../../../e2e/helpers";

test.describe("Widget management", () => {
  const PERSISTENCE_SETTLE_MS = 1200;

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("adds a widget and renders it on the dashboard", async ({ page }) => {
    await addWidget(page, "widget/tallyCounter");
    await expect(page.locator(".TallyCounter")).toBeVisible();
  });

  test("adds multiple widgets at once", async ({ page }) => {
    await addWidget(page, "widget/tallyCounter");
    await addWidget(page, "widget/notes");
    await expect(page.locator(".TallyCounter")).toBeVisible();
    await expect(page.locator(".Notes")).toBeVisible();
  });

  test("removes a widget from settings", async ({ page }) => {
    await addWidget(page, "widget/tallyCounter");
    await expect(page.locator(".TallyCounter")).toBeVisible();

    await page
      .locator("fieldset", { hasText: "Tally Counter" })
      .locator('button[title="Remove widget"]')
      .first()
      .click();

    await expect(page.locator(".TallyCounter")).toHaveCount(0);
  });

  test("reorders widgets using move-down button", async ({ page }) => {
    await addWidget(page, "widget/tallyCounter");
    await addWidget(page, "widget/notes");

    // First widget added should appear before the second in the DOM.
    const widgetOrderBefore = await page
      .locator(".Widgets")
      .locator(".TallyCounter, .Notes")
      .evaluateAll((nodes) =>
        nodes.map((n) => (n as HTMLElement).className.split(" ")[0]),
      );
    expect(widgetOrderBefore).toEqual(["TallyCounter", "Notes"]);

    await openSettings(page);
    await page
      .locator("fieldset", { hasText: "Tally Counter" })
      .locator('button[title="Move widget down"]')
      .click();

    await expect
      .poll(async () =>
        page
          .locator(".Widgets")
          .locator(".TallyCounter, .Notes")
          .evaluateAll((nodes) =>
            nodes.map((n) => (n as HTMLElement).className.split(" ")[0]),
          ),
      )
      .toEqual(["Notes", "TallyCounter"]);
  });

  test("widgets persist across reloads", async ({ page }) => {
    await addWidget(page, "widget/tallyCounter");
    await expect(page.locator(".TallyCounter")).toBeVisible();
    await page.waitForTimeout(PERSISTENCE_SETTLE_MS);
    await page.reload();
    await expect(page.locator(".TallyCounter")).toBeVisible();
  });
});
