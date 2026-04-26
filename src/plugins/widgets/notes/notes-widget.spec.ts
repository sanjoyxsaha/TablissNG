import { expect, type Page, test } from "@playwright/test";

import {
  addWidget,
  closeSettings,
  expandWidgetSettings,
  widgetSettingsFieldset,
} from "../../../../e2e/helpers";

async function addNotesWidget(page: Page) {
  await addWidget(page, "widget/notes");
}

async function typeIntoNotes(page: Page, body: string) {
  await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
  await closeSettings(page);
  await page.locator(".Notes .placeholder").click();
  const editable = page.locator(".Notes [contenteditable=true]");
  await editable.waitFor({ state: "visible" });
  await editable.focus();
  await editable.fill(body);
  await page.keyboard.press("Escape");
}

test.describe("Notes Widget", () => {
  const PERSISTENCE_SETTLE_MS = 1200;

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders the default placeholder", async ({ page }) => {
    await addNotesWidget(page);
    await expect(page.locator(".Notes .placeholder")).toBeVisible();
  });

  test("saves notes with markdown formatting", async ({ page }) => {
    await addNotesWidget(page);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(100);

    await page.locator(".Notes .placeholder").click();
    await page
      .locator(".Notes [contenteditable=true]")
      .waitFor({ state: "visible" });
    await page.locator(".Notes [contenteditable=true]").focus();
    await page.waitForTimeout(100);

    const editable = page.locator(".Notes [contenteditable=true]");
    await editable.fill("## Test text from playwright\n\n_wow so cool!_");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);

    await expect(page.locator(".Notes")).toContainText(
      "Test text from playwright",
    );
    await expect(page.locator(".Notes")).toContainText("wow so cool!");
  });

  test("saves notes with markdown formatting disabled", async ({ page }) => {
    await addNotesWidget(page);
    await expandWidgetSettings(page, "Notes");
    await page
      .locator(".NotesSettings")
      .getByLabel("Enable Markdown formatting")
      .click();
    await typeIntoNotes(page, "## Test text from playwright\n\n_wow so cool!_");

    await expect(page.locator(".Notes div div")).toContainText(
      "## Test text from playwright\n\n_wow so cool!_",
    );
  });

  test("persists notes content across reloads", async ({ page }) => {
    await addNotesWidget(page);
    await typeIntoNotes(page, "Persistent note");
    await page.waitForTimeout(100);
    await page.waitForTimeout(PERSISTENCE_SETTLE_MS);

    await page.reload();
    await expect(page.locator(".Notes")).toContainText("Persistent note");
  });

  test("supports markdown links in rendered output", async ({ page }) => {
    await addNotesWidget(page);
    await typeIntoNotes(page, "[Tabliss](https://tabliss.io)");
    await page.waitForTimeout(100);

    const link = page.locator(".Notes .markdown-content a", {
      hasText: "Tabliss",
    });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "https://tabliss.io/");
  });

  test("removes the notes widget when removed from settings", async ({
    page,
  }) => {
    await addNotesWidget(page);
    await expect(page.locator(".Notes")).toBeVisible();

    await widgetSettingsFieldset(page, "Notes")
      .locator('button[title="Remove widget"]')
      .first()
      .click();

    await expect(page.locator(".Notes")).toHaveCount(0);
  });
});
