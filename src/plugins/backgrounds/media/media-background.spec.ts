import { expect, type Page, test } from "@playwright/test";

import { fixtures, selectBackground } from "../../../../e2e/helpers";

async function selectMediaBackground(page: Page) {
  await selectBackground(page, "background/image");
  await expect(page.locator('input[type="file"]')).toBeVisible();
}

test.describe("Media Background", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should upload and display an image as background", async ({ page }) => {
    await selectMediaBackground(page);
    await page
      .locator('input[type="file"]')
      .setInputFiles(`${fixtures}/test-image.png`);

    await expect(page.locator(".media-count")).toHaveText(/1 media uploaded/);

    const bgDiv = page.locator(".image.fullscreen");
    await expect(bgDiv).toBeVisible();
    await expect(bgDiv).toHaveCSS("background-image", /^url\(.+\)$/);
  });

  test("should upload and display a video as background", async ({ page }) => {
    await selectMediaBackground(page);
    await page
      .locator('input[type="file"]')
      .setInputFiles(`${fixtures}/test-video.mp4`);

    await expect(page.locator(".media-count")).toHaveText(/1 media uploaded/);

    const video = page.locator("video.video.fullscreen");
    await expect(video).toBeVisible();
    await expect(video).toHaveAttribute("src", /.+/);
  });

  test("should upload multiple media items", async ({ page }) => {
    await selectMediaBackground(page);
    await page
      .locator('input[type="file"]')
      .setInputFiles([
        `${fixtures}/test-image.png`,
        `${fixtures}/test-image-2.png`,
      ]);

    await expect(page.locator(".media-count")).toHaveText(/2 media uploaded/);
  });

  test("should remove uploaded media", async ({ page }) => {
    await selectMediaBackground(page);
    await page
      .locator('input[type="file"]')
      .setInputFiles(`${fixtures}/test-image.png`);

    await expect(page.locator(".media-count")).toHaveText(/1 media uploaded/);

    await page.locator("a.link", { hasText: "Expand" }).click();
    await page.locator('button[title="Remove media"]').first().click();

    await expect(page.locator(".media-count")).toHaveText(/0 media uploaded/);
  });

  test("should toggle Expand/Collapse for uploaded media", async ({ page }) => {
    await selectMediaBackground(page);
    await page
      .locator('input[type="file"]')
      .setInputFiles(`${fixtures}/test-image.png`);

    const toggle = page.locator("a.link", { hasText: /Expand|Collapse/ });
    await expect(toggle).toHaveText("Expand");

    await toggle.click();
    await expect(toggle).toHaveText("Collapse");
    await expect(page.locator(".preview")).toBeVisible();

    await toggle.click();
    await expect(toggle).toHaveText("Expand");
    await expect(page.locator(".preview")).toBeHidden();
  });

  test("should preview uploaded image in expanded view", async ({ page }) => {
    await selectMediaBackground(page);
    await page
      .locator('input[type="file"]')
      .setInputFiles(`${fixtures}/test-image.png`);

    await page.locator("a.link", { hasText: "Expand" }).click();

    const preview = page.locator(".preview");
    await expect(preview).toBeVisible();
    await expect(preview.locator("img")).toBeVisible();
    await expect(preview.locator("img")).toHaveAttribute("src", /.+/);
  });

  test("should preview uploaded video in expanded view", async ({ page }) => {
    await selectMediaBackground(page);
    await page
      .locator('input[type="file"]')
      .setInputFiles(`${fixtures}/test-video.mp4`);

    await page.locator("a.link", { hasText: "Expand" }).click();

    const preview = page.locator(".preview");
    await expect(preview).toBeVisible();
    await expect(preview.locator("video")).toBeVisible();
    await expect(preview.locator("video")).toHaveAttribute("controls", "");
  });

  test("should declare supported file types via accept attribute", async ({
    page,
  }) => {
    await selectMediaBackground(page);
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toHaveAttribute(
      "accept",
      /\.mp4.*\.webm.*\.ogg.*image/,
    );
  });

  test("should switch sort order between sequence and random", async ({
    page,
  }) => {
    await selectMediaBackground(page);
    const sortSelect = page
      .locator("label", { hasText: "Sort order" })
      .locator("select");
    await expect(sortSelect).toBeVisible();

    await sortSelect.selectOption("random");
    await expect(sortSelect).toHaveValue("random");

    await sortSelect.selectOption("sequence");
    await expect(sortSelect).toHaveValue("sequence");
  });

  test("should remove all media one by one", async ({ page }) => {
    await selectMediaBackground(page);
    await page
      .locator('input[type="file"]')
      .setInputFiles([
        `${fixtures}/test-image.png`,
        `${fixtures}/test-image-2.png`,
      ]);

    await expect(page.locator(".media-count")).toHaveText(/2 media uploaded/);

    await page.locator("a.link", { hasText: "Expand" }).click();

    await page.locator('button[title="Remove media"]').first().click();
    await expect(page.locator(".media-count")).toHaveText(/1 media uploaded/);

    await page.locator('button[title="Remove media"]').first().click();
    await expect(page.locator(".media-count")).toHaveText(/0 media uploaded/);

    await expect(page.locator(".preview")).toBeHidden();
  });

  test("should append additional media without replacing existing ones", async ({
    page,
  }) => {
    await selectMediaBackground(page);
    await page
      .locator('input[type="file"]')
      .setInputFiles(`${fixtures}/test-image.png`);
    await expect(page.locator(".media-count")).toHaveText(/1 media uploaded/);

    await page
      .locator('input[type="file"]')
      .setInputFiles(`${fixtures}/test-image-2.png`);
    await expect(page.locator(".media-count")).toHaveText(/2 media uploaded/);
  });

  test("should persist uploaded media across reloads", async ({ page }) => {
    await selectMediaBackground(page);
    await page
      .locator('input[type="file"]')
      .setInputFiles(`${fixtures}/test-image.png`);
    await expect(page.locator(".media-count")).toHaveText(/1 media uploaded/);

    await page.reload();
    await expect(page.locator(".image.fullscreen")).toBeVisible();
  });
});
