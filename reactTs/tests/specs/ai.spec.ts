import { test, expect, clearStorage } from "../fixtures/base";
import { NotePage } from "../pages/NotePage";

const MOCK_GEMINI_SUMMARY = {
  candidates: [
    {
      content: {
        parts: [
          {
            text: JSON.stringify({
              summary: "TypeScript generics enable type-safe reusable code.",
              keyPoints: [
                "Generics parameterize types without losing type safety",
                "Constraints narrow what types are accepted",
                "Utility types like Partial and Pick use generics",
              ],
            }),
          },
        ],
      },
    },
  ],
};

const MOCK_GEMINI_BEAUTIFY = {
  candidates: [
    {
      content: {
        parts: [
          {
            text: "## TypeScript Generics\n\nTypeScript generics enable type-safe reusable code.\n\n### Key Concepts\n\n- Generics parameterize types without losing type safety\n- Constraints narrow what types are accepted\n- Utility types like `Partial` and `Pick` use generics",
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

test.describe("AI — Summarize", () => {
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

  test("summarize button opens modal with loading then result", async ({
    page,
    homePage,
  }) => {
    await mockGemini(page, MOCK_GEMINI_SUMMARY);
    await homePage.goto();
    await page.getByText("TypeScript Generics").click();

    const notePage = new NotePage(page);
    const dialog = await notePage.openSummaryModal();

    await expect(dialog).toContainText(
      "TypeScript generics enable type-safe reusable code."
    );
    await expect(dialog).toContainText("Generics parameterize types");
  });

  test("summarize shows error when no API key", async ({ page, homePage }) => {
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

    await homePage.goto();
    await page.getByText("TypeScript Generics").click();

    const notePage = new NotePage(page);
    const dialog = await notePage.openSummaryModal();

    await expect(dialog.getByRole("alert")).toContainText(
      "No API key configured"
    );
    await expect(
      dialog.getByRole("button", { name: /Configure API/i })
    ).toBeVisible();
  });

  test("summarize error has Configure API button that opens settings", async ({
    page,
    homePage,
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

    await homePage.goto();
    await page.getByText("TypeScript Generics").click();

    const notePage = new NotePage(page);
    const summaryDialog = await notePage.openSummaryModal();
    await summaryDialog.getByRole("button", { name: /Configure API/i }).click();

    // Summary modal should close, settings modal should open
    const settingsDialog = page.getByRole("dialog").filter({ hasText: "AI Settings" });
    await expect(settingsDialog).toContainText("AI Settings");
  });

  test("close button dismisses summary modal", async ({ page, homePage }) => {
    await mockGemini(page, MOCK_GEMINI_SUMMARY);
    await homePage.goto();
    await page.getByText("TypeScript Generics").click();

    const notePage = new NotePage(page);
    const dialog = await notePage.openSummaryModal();
    await dialog.locator(".modal-footer").getByRole("button", { name: /Close/i }).click();

    await expect(page.getByRole("dialog")).not.toBeVisible();
  });
});

test.describe("AI — Beautify Markdown", () => {
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

  test("beautify button is visible on note page", async ({ page, homePage }) => {
    await homePage.goto();
    await page.getByText("TypeScript Generics").click();

    const notePage = new NotePage(page);
    await expect(notePage.beautifyBtn).toBeVisible();
  });

  test("beautify opens modal with preview and apply button", async ({
    page,
    homePage,
  }) => {
    await mockGemini(page, MOCK_GEMINI_BEAUTIFY);
    await homePage.goto();
    await page.getByText("TypeScript Generics").click();

    const notePage = new NotePage(page);
    await notePage.beautifyBtn.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("Beautify Markdown");

    // Wait for result to load
    await expect(
      dialog.getByRole("button", { name: /Apply/i })
    ).toBeVisible({ timeout: 10000 });
    await expect(dialog).toContainText("TypeScript Generics");
  });

  test("beautify apply saves updated markdown and closes modal", async ({
    page,
    homePage,
  }) => {
    await mockGemini(page, MOCK_GEMINI_BEAUTIFY);
    await homePage.goto();
    await page.getByText("TypeScript Generics").click();

    const notePage = new NotePage(page);
    await notePage.beautifyBtn.click();

    const dialog = page.getByRole("dialog");
    const applyBtn = dialog.getByRole("button", { name: /Apply/i });
    await expect(applyBtn).toBeVisible({ timeout: 10000 });
    await applyBtn.click();

    // Modal should close
    await expect(page.getByRole("dialog")).not.toBeVisible();

    // Note content should reflect the beautified markdown
    await expect(
      page.locator("#note-markdown-content")
    ).toContainText("Key Concepts");
  });

  test("beautify discard closes modal without saving", async ({
    page,
    homePage,
  }) => {
    await mockGemini(page, MOCK_GEMINI_BEAUTIFY);
    await homePage.goto();
    await page.getByText("TypeScript Generics").click();

    const notePage = new NotePage(page);
    await notePage.beautifyBtn.click();

    const dialog = page.getByRole("dialog");
    await expect(
      dialog.getByRole("button", { name: /Apply/i })
    ).toBeVisible({ timeout: 10000 });

    await dialog.getByRole("button", { name: /Discard/i }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("beautify raw toggle shows markdown source", async ({
    page,
    homePage,
  }) => {
    await mockGemini(page, MOCK_GEMINI_BEAUTIFY);
    await homePage.goto();
    await page.getByText("TypeScript Generics").click();

    const notePage = new NotePage(page);
    await notePage.beautifyBtn.click();

    const dialog = page.getByRole("dialog");
    await expect(
      dialog.getByRole("button", { name: /Apply/i })
    ).toBeVisible({ timeout: 10000 });

    await dialog.getByRole("button", { name: /Raw/i }).click();
    await expect(dialog.locator("pre")).toBeVisible();
    await expect(dialog.locator("pre")).toContainText("## TypeScript Generics");
  });

  test("beautify shows error when no API key", async ({ page, homePage }) => {
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

    await homePage.goto();
    await page.getByText("TypeScript Generics").click();

    const notePage = new NotePage(page);
    await notePage.beautifyBtn.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("alert")).toContainText(
      "No API key configured"
    );
  });
});

test.describe("AI — Settings Modal", () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
  });

  test("settings modal shows provider toggle", async ({ page, homePage }) => {
    await homePage.goto();
    await page.getByText("TypeScript Generics").click();

    const notePage = new NotePage(page);
    await notePage.openSettingsModal();

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByLabel("Google Gemini")).toBeVisible();
    await expect(dialog.getByLabel("OpenAI compatible")).toBeVisible();
  });

  test("switching to OpenAI shows endpoint field", async ({
    page,
    homePage,
  }) => {
    await homePage.goto();
    await page.getByText("TypeScript Generics").click();

    const notePage = new NotePage(page);
    await notePage.openSettingsModal();

    const dialog = page.getByRole("dialog");

    // Gemini is default — no endpoint field
    await expect(dialog.getByLabel("API Endpoint")).not.toBeVisible();

    // Switch to OpenAI
    await dialog.getByLabel("OpenAI compatible").click();
    await expect(dialog.getByLabel("API Endpoint")).toBeVisible();
  });

  test("save persists settings", async ({ page, homePage }) => {
    await homePage.goto();
    await page.getByText("TypeScript Generics").click();

    const notePage = new NotePage(page);
    await notePage.openSettingsModal();

    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("API Key").fill("my-test-key-123");
    await dialog.getByRole("button", { name: /Save/i }).click();

    await expect(page.getByRole("dialog")).not.toBeVisible();

    // Verify saved — re-open settings
    await notePage.openSettingsModal();
    const keyInput = page.getByRole("dialog").getByLabel("API Key");
    // password field — check value programmatically
    await expect(keyInput).toHaveValue("my-test-key-123");
  });
});
