import { expect, type Page, test } from "@playwright/test";

async function addNotesWidget(page: Page) {
  await page.locator(".Overlay a").first().click();

  await page
    .locator("h2", { hasText: "Widgets" })
    .locator("..")
    .locator("> label > select.primary")
    .selectOption("widget/notes");
}

async function addTextToNotesWidgets(page: Page) {
  await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
  await page.keyboard.press("s");
  await page.locator(".Notes .placeholder").click();
  await page
    .locator(".Notes [contenteditable=true]")
    .fill("## Test text from playwright\n\n_wow so cool!_");
  await page.keyboard.press("Escape");
}

test.describe("Notes Widget", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("Should render the notes widget with the default placeholder", async ({
    page,
  }) => {
    await addNotesWidget(page);
    await expect(page.locator(".Notes .placeholder")).toBeVisible();
  });

  test("Should allow the user to enter and save notes with markdown formatting", async ({
    page,
  }) => {
    await addNotesWidget(page);
    await addTextToNotesWidgets(page);

    const markdown_content = page.locator(".Notes .markdown-content");
    await expect(markdown_content.locator("h2")).toContainText(
      "Test text from playwright",
    );
    await expect(markdown_content.locator("p").locator("em")).toContainText(
      "wow so cool!",
    );
  });

  test("Should allow the user to enter and save notes without markdown formatting", async ({
    page,
  }) => {
    await addNotesWidget(page);
    await page.locator("fieldset", { hasText: "Notes" }).locator("h4").click();
    await page
      .locator(".NotesSettings")
      .getByLabel("Enable Markdown formatting")
      .click();
    await addTextToNotesWidgets(page);

    await expect(page.locator(".Notes div div")).toContainText(
      "## Test text from playwright\n\n_wow so cool!_",
    );
  });
});
