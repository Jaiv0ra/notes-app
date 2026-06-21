import { type Page, type Locator, expect } from "@playwright/test";

export class NoteFormPage {
  readonly page: Page;
  readonly titleInput: Locator;
  readonly bodyInput: Locator;
  readonly saveBtn: Locator;
  readonly cancelBtn: Locator;
  readonly beautifyBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.titleInput = page.getByLabel("Title");
    this.bodyInput = page.getByLabel("Body");
    this.saveBtn = page.getByRole("button", { name: "Save" });
    this.cancelBtn = page.getByRole("link", { name: "Cancel" });
    this.beautifyBtn = page.getByRole("button", { name: /Beautify/i });
  }

  async expectHeading(text: string) {
    await expect(
      this.page.getByRole("heading", { level: 1 })
    ).toContainText(text);
  }

  async fill(title: string, body: string) {
    await this.titleInput.fill(title);
    await this.bodyInput.fill(body);
  }

  async save() {
    await this.saveBtn.click();
  }

  async cancel() {
    await this.cancelBtn.click();
  }

  async addTag(label: string) {
    const tagsInput = this.page
      .locator('[id="tags"]')
      .locator("..")
      .locator("input");
    await tagsInput.fill(label);
    await this.page.keyboard.press("Enter");
  }
}
