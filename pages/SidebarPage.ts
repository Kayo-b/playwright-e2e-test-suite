import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class SidebarPage extends BasePage {
  readonly container: Locator;
  readonly menu: Locator;
  readonly homeLink: Locator;
  readonly bookmarksLink: Locator;
  readonly dashboard: Locator;

  constructor(page: Page) {
    super(page);
    this.container = page.getByTestId('sidebar-container');
    this.menu = page.getByTestId('sidebar-menu');
    this.homeLink = page.getByTestId('sidebar-home-link');
    this.bookmarksLink = page.getByTestId('sidebar-bookmarks-link');
    this.dashboard = page.getByTestId('sidebar-dashboard');
  }

  async goToHome() {
    await this.homeLink.click();
  }

  async goToBookmarks() {
    await this.bookmarksLink.click();
  }

  async isVisible(): Promise<boolean> {
    return await this.container.isVisible();
  }
}
