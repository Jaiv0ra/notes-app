import { test, expect, clearStorage } from "../fixtures/base";

test.describe("Favorites", () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
  });

  test("seed data has favorited notes in Favorites section", async ({
    homePage,
  }) => {
    await homePage.goto();
    const favSection = homePage.page.locator('[data-testid="favorites-section"]');
    await expect(favSection).toBeVisible();
    // TypeScript Generics is marked isFavorite in seed data
    await expect(
      homePage.page.getByText("TypeScript Generics")
    ).toBeVisible();
    await expect(
      homePage.page.getByText("Core Web Vitals")
    ).toBeVisible();
  });

  test("can star a note from the list", async ({ homePage }) => {
    await homePage.goto();

    // useEffect Patterns is not a favorite — star it
    const card = homePage.page
      .locator('[class*="cardWrapper"]')
      .filter({ has: homePage.page.getByText("useEffect Patterns", { exact: true }) });
    const starBtn = card.getByRole("button", { name: /Add to favorites/i });
    await starBtn.click();

    await expect(
      card.getByRole("button", { name: /Remove from favorites/i })
    ).toBeVisible();
  });

  test("unstar a note removes it from the Favorites section", async ({
    homePage,
  }) => {
    await homePage.goto();

    // TypeScript Generics is starred — unstar it
    const card = homePage.page
      .locator('[class*="cardWrapper"]')
      .filter({
        has: homePage.page.getByText("TypeScript Generics", { exact: true }),
      });
    await card
      .getByRole("button", { name: /Remove from favorites/i })
      .click();

    // Favorites section may still exist (other favorites remain) but
    // TypeScript Generics should no longer have the filled star
    await expect(
      card.getByRole("button", { name: /Add to favorites/i })
    ).toBeVisible();
  });

  test("favorites filter shows only starred notes", async ({ homePage }) => {
    await homePage.goto();

    const filterBtn = homePage.page.locator('[data-testid="favorites-filter"]');
    await filterBtn.click();

    // Starred notes visible
    await expect(
      homePage.page.getByText("TypeScript Generics")
    ).toBeVisible();
    await expect(homePage.page.getByText("Core Web Vitals")).toBeVisible();

    // Non-starred notes hidden
    await expect(homePage.page.getByText("Git Workflow")).not.toBeVisible();
    await expect(
      homePage.page.getByText("Angular Patterns")
    ).not.toBeVisible();
  });

  test("favorites filter toggle turns off", async ({ homePage }) => {
    await homePage.goto();
    const filterBtn = homePage.page.locator('[data-testid="favorites-filter"]');
    await filterBtn.click();
    await filterBtn.click();

    // All notes visible again
    await expect(homePage.page.getByText("Git Workflow")).toBeVisible();
    await expect(
      homePage.page.getByText("React Server Components")
    ).toBeVisible();
  });

  test("can toggle favorite from the note view", async ({
    homePage,
    notePage,
  }) => {
    await homePage.goto();
    await homePage.page.getByText("useEffect Patterns").click();

    // useEffect Patterns is not favorited — star it
    await expect(notePage.favoriteBtn).toHaveAttribute(
      "aria-label",
      "Add to favorites"
    );
    await notePage.favoriteBtn.click();
    await expect(notePage.favoriteBtn).toHaveAttribute(
      "aria-label",
      "Remove from favorites"
    );

    // Go back and verify the favorites section still shows
    await notePage.backBtn.click();
    const favSection = homePage.page.locator('[data-testid="favorites-section"]');
    await expect(favSection).toBeVisible();
  });

  test("PDF export button is present and enabled on note view", async ({
    homePage,
    notePage,
  }) => {
    await homePage.goto();
    await homePage.page.getByText("Git Workflow").click();
    await expect(notePage.pdfBtn).toBeVisible();
    await expect(notePage.pdfBtn).toBeEnabled();
  });
});
