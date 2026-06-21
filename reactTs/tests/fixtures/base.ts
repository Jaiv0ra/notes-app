import { test as base } from "@playwright/test";
import { HomePage } from "../pages/HomePage";
import { NotePage } from "../pages/NotePage";
import { NoteFormPage } from "../pages/NoteFormPage";

type Fixtures = {
  homePage: HomePage;
  notePage: NotePage;
  noteFormPage: NoteFormPage;
};

export const test = base.extend<Fixtures>({
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },
  notePage: async ({ page }, use) => {
    await use(new NotePage(page));
  },
  noteFormPage: async ({ page }, use) => {
    await use(new NoteFormPage(page));
  },
});

export { expect } from "@playwright/test";

/** Clear localStorage before each test to start from a clean state. */
export async function clearStorage(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}
