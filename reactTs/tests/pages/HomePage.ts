import { type Page, type Locator, expect } from "@playwright/test";

export class HomePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly searchInput: Locator;
  readonly tagFilter: Locator;
  readonly newNoteBtn: Locator;
  readonly tagsBtn: Locator;
  readonly favoritesToggle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: "NoteVault" });
    this.searchInput = page.getByPlaceholder("Search notes…");
    this.tagFilter = page.getByPlaceholder("Filter by tags…");
    this.newNoteBtn = page.getByRole("link", { name: /New Note/i }).first();
    this.tagsBtn = page.getByRole("button", { name: "Tags" });
    this.favoritesToggle = page.getByRole("button", {
      name: /show favorites only/i,
    });
  }

  async goto() {
    await this.page.goto("/");
    await expect(this.heading).toBeVisible();
  }

  noteCard(title: string) {
    return this.page.getByRole("link", { name: title }).first();
  }

  favBtnForNote(title: string) {
    const card = this.page.locator(".cardWrapper").filter({
      has: this.page.getByText(title, { exact: true }),
    });
    return card.getByRole("button", { name: /favorites/i });
  }

  async createNote(title: string, body: string) {
    await this.newNoteBtn.click();
    await this.page.getByLabel("Title").fill(title);
    await this.page.getByLabel("Body").fill(body);
    await this.page.getByRole("button", { name: "Save" }).click();
    await expect(this.page).toHaveURL("/");
  }

  async searchFor(query: string) {
    await this.searchInput.fill(query);
  }

  async clearSearch() {
    await this.searchInput.clear();
  }

  async openTagsModal() {
    await this.tagsBtn.click();
    await expect(this.page.getByRole("dialog")).toBeVisible();
  }

  async openSettingsModal() {
    await this.page
      .getByRole("button", { name: /AI Settings/i })
      .first()
      .click();
    await expect(this.page.getByRole("dialog")).toBeVisible();
  }
}
