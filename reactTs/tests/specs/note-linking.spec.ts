import { test, expect, clearStorage } from "../fixtures/base";

test.describe("Note Linking — wiki-style [[Title]] syntax", () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
  });

  test("Project: NoteVault renders [[State Management Decision]] as a clickable link", async ({
    homePage,
    notePage,
  }) => {
    await homePage.goto();
    await homePage.page.getByText("Project: NoteVault").click();
    await notePage.expectTitle("Project: NoteVault");

    const wikiLink = homePage.page
      .locator(".note-link")
      .filter({ hasText: "[[State Management Decision]]" });
    await expect(wikiLink).toBeVisible();
  });

  test("clicking a [[wiki link]] navigates to the target note", async ({
    homePage,
    notePage,
  }) => {
    await homePage.goto();
    await homePage.page.getByText("Project: NoteVault").click();

    const link = homePage.page
      .locator(".note-link")
      .filter({ hasText: "[[State Management Decision]]" });
    await link.click();

    await notePage.expectTitle("State Management Decision");
  });

  test("clicking a [[wiki link]] in useEffect Patterns navigates to Hooks Deep Dive", async ({
    homePage,
    notePage,
  }) => {
    await homePage.goto();
    await homePage.page.getByText("useEffect Patterns").click();

    const link = homePage.page
      .locator(".note-link")
      .filter({ hasText: "[[Hooks Deep Dive]]" });
    await expect(link).toBeVisible();
    await link.click();

    await notePage.expectTitle("Hooks Deep Dive");
  });

  test("backlinks panel shows on target note", async ({
    homePage,
    notePage,
  }) => {
    await homePage.goto();
    // State Management Decision is linked from multiple notes
    await homePage.page.getByText("State Management Decision").click();
    await notePage.expectTitle("State Management Decision");

    const panel = notePage.backlinksPanel();
    await expect(panel).toBeVisible();
    // Project: NoteVault links to [[State Management Decision]]
    await expect(notePage.backlinkFor("Project: NoteVault")).toBeVisible();
  });

  test("backlinks panel shows multiple references", async ({
    homePage,
    notePage,
  }) => {
    await homePage.goto();
    await homePage.page.getByText("State Management Decision").click();

    const panel = notePage.backlinksPanel();
    await expect(panel).toBeVisible();

    // Verify more than one backlink exists
    const backlinks = homePage.page.locator(".backlinks-panel__link");
    const count = await backlinks.count();
    expect(count).toBeGreaterThan(1);
  });

  test("clicking backlink navigates to the referencing note", async ({
    homePage,
    notePage,
  }) => {
    await homePage.goto();
    await homePage.page.getByText("State Management Decision").click();

    const backlinkToProject = notePage.backlinkFor("Project: NoteVault");
    await backlinkToProject.click();
    await notePage.expectTitle("Project: NoteVault");
  });

  test("note with no backlinks hides the panel", async ({
    homePage,
    notePage,
    page,
  }) => {
    await homePage.goto();
    // Accessibility Checklist has no other notes linking to it
    await homePage.page.getByText("Accessibility Checklist").click();
    await notePage.expectTitle("Accessibility Checklist");

    await expect(notePage.backlinksPanel()).not.toBeVisible();
  });

  test("[[BrokenLink]] renders with broken-link styling", async ({
    homePage,
    notePage,
    page,
  }) => {
    await homePage.goto();
    await homePage.newNoteBtn.click();
    await page.getByLabel("Title").fill("Link Test");
    await page
      .getByLabel("Body")
      .fill("This points to [[NonExistentNote]] which does not exist.");
    await page.getByRole("button", { name: "Save" }).click();

    await page.getByText("Link Test").click();
    await notePage.expectTitle("Link Test");

    const brokenLink = page.locator(".note-link-broken");
    await expect(brokenLink).toBeVisible();
    await expect(brokenLink).toContainText("[[NonExistentNote]]");
  });

  test("AI summarize modal opens and shows loading or error", async ({
    homePage,
    notePage,
  }) => {
    await homePage.goto();
    await homePage.page.getByText("React Server Components").click();

    await notePage.summarizeBtn.click();
    const dialog = homePage.page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/AI Summary/i)).toBeVisible();

    // Without API key configured, should show an error
    await expect(
      dialog.locator(".bi-exclamation-circle-fill")
    ).toBeVisible({ timeout: 8000 });

    await dialog.locator(".modal-footer").getByRole("button", { name: "Close" }).click();
    await expect(dialog).not.toBeVisible();
  });

  test("settings modal opens and saves API settings", async ({
    homePage,
    page,
  }) => {
    await homePage.goto();
    await homePage.openSettingsModal();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("AI Settings")).toBeVisible();

    // Fill in a fake key and save (use placeholder to avoid ambiguity with reveal button)
    await dialog.getByPlaceholder("AIza…").fill("AIza-test-key-12345");
    await dialog.getByPlaceholder("gemini-2.5-flash").fill("gemini-2.5-flash");
    await dialog.getByRole("button", { name: "Save" }).click();

    await expect(dialog).not.toBeVisible();

    // Reopen and verify it persisted
    await homePage.openSettingsModal();
    const keyInput = page.getByRole("dialog").getByPlaceholder("AIza…");
    await expect(keyInput).toHaveValue("AIza-test-key-12345");
    await page.getByRole("dialog").getByRole("button", { name: "Cancel" }).click();
  });
});
