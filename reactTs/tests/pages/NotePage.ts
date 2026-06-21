import { type Page, type Locator, expect } from "@playwright/test";

export class NotePage {
  readonly page: Page;
  readonly editBtn: Locator;
  readonly deleteBtn: Locator;
  readonly backBtn: Locator;
  readonly summarizeBtn: Locator;
  readonly beautifyBtn: Locator;
  readonly pdfBtn: Locator;
  readonly favoriteBtn: Locator;
  readonly settingsBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.editBtn = page.getByRole("link", { name: /Edit/i }).first();
    this.deleteBtn = page.getByRole("button", { name: /Delete/i });
    this.backBtn = page.getByRole("link", { name: /Back/i }).first();
    this.summarizeBtn = page.getByRole("button", { name: /Summarize/i });
    this.beautifyBtn = page.getByRole("button", { name: /Beautify/i });
    this.pdfBtn = page.getByRole("button", { name: /PDF/i });
    this.favoriteBtn = page.getByRole("button", {
      name: /favorites/i,
    }).first();
    this.settingsBtn = page
      .getByRole("button", { name: /AI Settings/i })
      .first();
  }

  async expectTitle(title: string) {
    await expect(this.page.getByRole("heading", { level: 1 })).toContainText(
      title
    );
  }

  async expectMarkdownContent(text: string) {
    await expect(
      this.page.locator("#note-markdown-content")
    ).toContainText(text);
  }

  async delete() {
    await this.deleteBtn.click();
    await expect(this.page).toHaveURL("/");
  }

  wikiLink(title: string) {
    return this.page.locator(".note-link").filter({ hasText: `[[${title}]]` });
  }

  brokenWikiLink(title: string) {
    return this.page
      .locator(".note-link-broken")
      .filter({ hasText: `[[${title}]]` });
  }

  backlinksPanel() {
    return this.page.locator(".backlinks-panel");
  }

  backlinkFor(title: string) {
    return this.page
      .locator(".backlinks-panel__link")
      .filter({ hasText: title });
  }

  async openSummaryModal() {
    await this.summarizeBtn.click();
    const dialog = this.page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    return dialog;
  }

  async openSettingsModal() {
    await this.settingsBtn.click();
    const dialog = this.page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    return dialog;
  }
}
