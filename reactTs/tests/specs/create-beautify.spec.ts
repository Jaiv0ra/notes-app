import { test, expect, clearStorage } from "../fixtures/base";

const MOCK_BEAUTIFY_RESPONSE = {
  candidates: [
    {
      content: {
        parts: [
          {
            text: "## Meeting Notes\n\n### Action Items\n\n- Follow up with the team on deliverables\n- Update the project documentation\n- Schedule the next review session",
          },
        ],
      },
    },
  ],
};

function mockGemini(page: import("@playwright/test").Page, body: object) {
  return page.route("**/generativelanguage.googleapis.com/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(body),
    })
  );
}

async function goToNewNote(page: import("@playwright/test").Page) {
  await page.goto("/new");
  await expect(
    page.getByRole("heading", { name: /New Note/i })
  ).toBeVisible();
}

test.describe("Create Note — Beautify Markdown", () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
    await page.addInitScript(() => {
      localStorage.setItem(
        "NV_AI_SETTINGS",
        JSON.stringify({
          apiKey: "test-key",
          provider: "gemini",
          model: "gemini-2.5-flash",
          endpoint: "",
        })
      );
    });
  });

  // --- Discoverability & initial state ---

  test("Beautify button is visible in the create note form", async ({
    page,
    noteFormPage,
  }) => {
    await goToNewNote(page);
    await expect(noteFormPage.beautifyBtn).toBeVisible();
  });

  test("Beautify button is disabled when body is empty", async ({
    page,
    noteFormPage,
  }) => {
    await goToNewNote(page);
    await expect(noteFormPage.beautifyBtn).toBeDisabled();
  });

  test("Beautify button enables after typing in the body", async ({
    page,
    noteFormPage,
  }) => {
    await goToNewNote(page);
    await noteFormPage.bodyInput.fill("some rough notes");
    await expect(noteFormPage.beautifyBtn).toBeEnabled();
  });

  test("Beautify button is NOT present in the edit note form", async ({
    page,
    homePage,
  }) => {
    await homePage.goto();
    await page.getByText("Git Workflow").click();
    await page.getByRole("link", { name: /Edit/i }).first().click();
    await expect(
      page.getByRole("heading", { name: /Edit Note/i })
    ).toBeVisible();
    // The beautify button in the edit form should not exist
    await expect(
      page.locator('button[aria-label="Beautify markdown with AI"]')
    ).not.toBeAttached();
  });

  // --- Happy path ---

  test("clicking Beautify opens the modal with a preview", async ({
    page,
    noteFormPage,
  }) => {
    await mockGemini(page, MOCK_BEAUTIFY_RESPONSE);
    await goToNewNote(page);
    await noteFormPage.fill("Meeting Notes", "rough notes about the meeting");
    await noteFormPage.beautifyBtn.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("Beautify Markdown");

    // Wait for result
    await expect(
      dialog.getByRole("button", { name: /Apply/i })
    ).toBeVisible({ timeout: 10000 });

    // Preview contains the beautified content
    await expect(dialog).toContainText("Meeting Notes");
    await expect(dialog).toContainText("Action Items");
  });

  test("Apply replaces the body content with beautified markdown", async ({
    page,
    noteFormPage,
  }) => {
    await mockGemini(page, MOCK_BEAUTIFY_RESPONSE);
    await goToNewNote(page);
    await noteFormPage.fill("Meeting Notes", "rough notes about the meeting");
    await noteFormPage.beautifyBtn.click();

    const dialog = page.getByRole("dialog");
    await expect(
      dialog.getByRole("button", { name: /Apply/i })
    ).toBeVisible({ timeout: 10000 });
    await dialog.getByRole("button", { name: /Apply/i }).click();

    // Modal closes
    await expect(page.getByRole("dialog")).not.toBeVisible();

    // Body textarea now contains the beautified content
    await expect(noteFormPage.bodyInput).toHaveValue(/Action Items/);
    await expect(noteFormPage.bodyInput).toHaveValue(/Follow up/);
  });

  test("note can be saved normally after beautification", async ({
    page,
    homePage,
    noteFormPage,
  }) => {
    await mockGemini(page, MOCK_BEAUTIFY_RESPONSE);
    await homePage.goto();
    await homePage.newNoteBtn.click();

    await noteFormPage.fill("Meeting Notes", "rough notes about the meeting");
    await noteFormPage.beautifyBtn.click();

    const dialog = page.getByRole("dialog");
    await expect(
      dialog.getByRole("button", { name: /Apply/i })
    ).toBeVisible({ timeout: 10000 });
    await dialog.getByRole("button", { name: /Apply/i }).click();

    await expect(page.getByRole("dialog")).not.toBeVisible();
    await noteFormPage.save();

    // Back on home, note exists
    await expect(page).toHaveURL("/");
    await expect(page.getByText("Meeting Notes")).toBeVisible();

    // Open it and verify beautified content is saved
    await page.getByText("Meeting Notes").click();
    await expect(
      page.locator("#note-markdown-content")
    ).toContainText("Action Items");
  });

  test("user can continue editing after applying beautification", async ({
    page,
    noteFormPage,
  }) => {
    await mockGemini(page, MOCK_BEAUTIFY_RESPONSE);
    await goToNewNote(page);
    await noteFormPage.fill("Meeting Notes", "rough notes about the meeting");
    await noteFormPage.beautifyBtn.click();

    const dialog = page.getByRole("dialog");
    await expect(
      dialog.getByRole("button", { name: /Apply/i })
    ).toBeVisible({ timeout: 10000 });
    await dialog.getByRole("button", { name: /Apply/i }).click();

    // Can still type in the textarea after applying
    await noteFormPage.bodyInput.click();
    await noteFormPage.bodyInput.press("End");
    await noteFormPage.bodyInput.type("\n\n- Extra note added after beautify");
    await expect(noteFormPage.bodyInput).toHaveValue(/Extra note added after beautify/);
  });

  test("Discard closes the modal without changing the body", async ({
    page,
    noteFormPage,
  }) => {
    await mockGemini(page, MOCK_BEAUTIFY_RESPONSE);
    await goToNewNote(page);
    await noteFormPage.fill("Meeting Notes", "rough notes about the meeting");
    await noteFormPage.beautifyBtn.click();

    const dialog = page.getByRole("dialog");
    await expect(
      dialog.getByRole("button", { name: /Apply/i })
    ).toBeVisible({ timeout: 10000 });
    await dialog.getByRole("button", { name: /Discard/i }).click();

    await expect(page.getByRole("dialog")).not.toBeVisible();
    // Original body preserved
    await expect(noteFormPage.bodyInput).toHaveValue(
      "rough notes about the meeting"
    );
  });

  test("Raw toggle shows the markdown source in the modal", async ({
    page,
    noteFormPage,
  }) => {
    await mockGemini(page, MOCK_BEAUTIFY_RESPONSE);
    await goToNewNote(page);
    await noteFormPage.fill("Meeting Notes", "rough notes about the meeting");
    await noteFormPage.beautifyBtn.click();

    const dialog = page.getByRole("dialog");
    await expect(
      dialog.getByRole("button", { name: /Apply/i })
    ).toBeVisible({ timeout: 10000 });

    await dialog.getByRole("button", { name: /Raw/i }).click();
    await expect(dialog.locator("pre")).toBeVisible();
    await expect(dialog.locator("pre")).toContainText("## Meeting Notes");
  });

  // --- Error handling ---

  test("shows error state when API call fails", async ({
    page,
    noteFormPage,
  }) => {
    await page.route("**/generativelanguage.googleapis.com/**", (route) =>
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: { message: "Internal server error" } }),
      })
    );

    await goToNewNote(page);
    await noteFormPage.fill("Meeting Notes", "some content");
    await noteFormPage.beautifyBtn.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("alert")).toBeVisible({ timeout: 10000 });
    await expect(dialog.getByRole("alert")).toContainText(
      "Internal server error"
    );
  });

  test("shows API key error with Configure API button", async ({
    page,
    noteFormPage,
  }) => {
    // Override to have no key
    await page.addInitScript(() => {
      localStorage.setItem(
        "NV_AI_SETTINGS",
        JSON.stringify({
          apiKey: "",
          provider: "gemini",
          model: "gemini-2.5-flash",
          endpoint: "",
        })
      );
    });

    await goToNewNote(page);
    await noteFormPage.fill("Meeting Notes", "some content");
    await noteFormPage.beautifyBtn.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("alert")).toBeVisible({ timeout: 10000 });
    await expect(dialog.getByRole("alert")).toContainText("No API key");
    await expect(
      dialog.getByRole("button", { name: /Configure API/i })
    ).toBeVisible();
  });

  test("Retry re-calls the API after an error", async ({
    page,
    noteFormPage,
  }) => {
    let callCount = 0;
    await page.route(
      "**/generativelanguage.googleapis.com/**",
      async (route) => {
        callCount++;
        if (callCount === 1) {
          await route.fulfill({
            status: 500,
            contentType: "application/json",
            body: JSON.stringify({ error: { message: "Temporary failure" } }),
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(MOCK_BEAUTIFY_RESPONSE),
          });
        }
      }
    );

    await goToNewNote(page);
    await noteFormPage.fill("Meeting Notes", "some rough content");
    await noteFormPage.beautifyBtn.click();

    const dialog = page.getByRole("dialog");

    // First call fails
    await expect(dialog.getByRole("alert")).toBeVisible({ timeout: 10000 });
    await expect(dialog.getByRole("alert")).toContainText("Temporary failure");

    // Retry succeeds
    await dialog.getByRole("button", { name: /Retry/i }).click();
    await expect(
      dialog.getByRole("button", { name: /Apply/i })
    ).toBeVisible({ timeout: 10000 });
    await expect(dialog).toContainText("Action Items");
  });

  test("Configure API opens the settings modal from the beautify error", async ({
    page,
    noteFormPage,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "NV_AI_SETTINGS",
        JSON.stringify({
          apiKey: "",
          provider: "gemini",
          model: "gemini-2.5-flash",
          endpoint: "",
        })
      );
    });

    await goToNewNote(page);
    await noteFormPage.fill("Meeting Notes", "some content");
    await noteFormPage.beautifyBtn.click();

    const beautifyDialog = page.getByRole("dialog");
    await expect(beautifyDialog.getByRole("alert")).toBeVisible({
      timeout: 10000,
    });
    await beautifyDialog
      .getByRole("button", { name: /Configure API/i })
      .click();

    // Beautify modal closes, settings modal opens
    const settingsDialog = page
      .getByRole("dialog")
      .filter({ hasText: "AI Settings" });
    await expect(settingsDialog).toBeVisible();
  });
});
