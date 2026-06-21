import { test, expect, clearStorage } from "../fixtures/base";

test.describe("Notes — CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
  });

  test("home page renders with seed notes", async ({ homePage }) => {
    await homePage.goto();
    await expect(homePage.heading).toBeVisible();
    await expect(homePage.page.getByText("TypeScript Generics")).toBeVisible();
    await expect(homePage.page.getByText("Core Web Vitals")).toBeVisible();
    await expect(homePage.page.getByText("React Server Components")).toBeVisible();
  });

  test("create a note and view it", async ({ homePage, notePage }) => {
    await homePage.goto();
    await homePage.newNoteBtn.click();

    await homePage.page.getByLabel("Title").fill("My Test Note");
    await homePage.page
      .getByLabel("Body")
      .fill("This is the **body** of my test note.");
    await homePage.page.getByRole("button", { name: "Save" }).click();

    await expect(homePage.page).toHaveURL("/");
    await expect(homePage.page.getByText("My Test Note")).toBeVisible();

    await homePage.page.getByText("My Test Note").click();
    await notePage.expectTitle("My Test Note");
    await notePage.expectMarkdownContent("body");
  });

  test("edit a note", async ({ homePage, notePage, noteFormPage }) => {
    await homePage.goto();
    await homePage.page.getByText("Git Workflow").click();
    await notePage.editBtn.click();

    await noteFormPage.expectHeading("Edit Note");
    await expect(noteFormPage.titleInput).toHaveValue("Git Workflow");

    await noteFormPage.titleInput.fill("Git Workflow — Updated");
    await noteFormPage.save();

    await notePage.expectTitle("Git Workflow — Updated");
  });

  test("delete a note", async ({ homePage, notePage }) => {
    await homePage.goto();
    await homePage.page.getByText("Accessibility Checklist").click();
    await notePage.delete();

    await expect(homePage.page).toHaveURL("/");
    await expect(
      homePage.page.getByText("Accessibility Checklist")
    ).not.toBeVisible();
  });

  test("search filters notes by title", async ({ homePage }) => {
    await homePage.goto();
    await homePage.searchFor("typescript");

    await expect(homePage.page.getByText("TypeScript Generics")).toBeVisible();
    await expect(
      homePage.page.getByText("TypeScript Utility Types")
    ).toBeVisible();
    await expect(homePage.page.getByText("Core Web Vitals")).not.toBeVisible();
    await expect(
      homePage.page.getByText("React Server Components")
    ).not.toBeVisible();
  });

  test("empty search restores all notes", async ({ homePage }) => {
    await homePage.goto();
    await homePage.searchFor("typescript");
    await homePage.clearSearch();

    await expect(homePage.page.getByText("Core Web Vitals")).toBeVisible();
    await expect(homePage.page.getByText("React Server Components")).toBeVisible();
  });

  test("empty state shows when no notes match search", async ({ homePage }) => {
    await homePage.goto();
    await homePage.searchFor("zzz_no_match");

    await expect(
      homePage.page.getByText("No notes match your filters.")
    ).toBeVisible();
  });

  test("cancel discards new note", async ({ homePage, noteFormPage }) => {
    await homePage.goto();
    await homePage.newNoteBtn.click();
    await noteFormPage.fill("Abandoned Note", "Some body");
    await noteFormPage.cancel();

    await expect(homePage.page).toHaveURL("/");
    await expect(homePage.page.getByText("Abandoned Note")).not.toBeVisible();
  });

  test("back button returns to list from note view", async ({
    homePage,
    notePage,
  }) => {
    await homePage.goto();
    await homePage.page.getByText("Git Workflow").click();
    await notePage.backBtn.click();
    await expect(homePage.page).toHaveURL("/");
  });

  test("tags modal opens and closes", async ({ homePage }) => {
    await homePage.goto();
    await homePage.openTagsModal();
    await homePage.page.getByRole("button", { name: "Done" }).click();
    await expect(homePage.page.getByRole("dialog")).not.toBeVisible();
  });
});
