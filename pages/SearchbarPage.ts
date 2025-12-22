import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class SearchbarPage extends BasePage {
  readonly container: Locator;
  readonly mobileButton: Locator;
  readonly input: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.container = page.getByTestId('searchbar-container');
    this.mobileButton = page.getByTestId('searchbar-mobile-button');
    this.input = page.getByTestId('searchbar-input');
    this.submitButton = page.getByTestId('searchbar-submit-button');
  }

  async search(query: string) {
    await this.input.fill(query);
    await this.submitButton.click();
  }

  async toggleMobileSearch() {
    await this.mobileButton.click();
  }

  async isVisible(): Promise<boolean> {
    return await this.container.isVisible();
  }
}
