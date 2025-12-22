import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class GifSearchPage extends BasePage {
  readonly container: Locator;
  readonly input: Locator;
  readonly submitButton: Locator;
  readonly results: Locator;
  readonly trendingContainer: Locator;

  constructor(page: Page) {
    super(page);
    this.container = page.getByTestId('gif-search-container');
    this.input = page.getByTestId('gif-search-input');
    this.submitButton = page.getByTestId('gif-search-submit-button');
    this.results = page.getByTestId('gif-search-results');
    this.trendingContainer = page.getByTestId('gif-trending-container');
  }

  async searchGif(query: string) {
    await this.input.fill(query);
    await this.submitButton.click();
    await this.wait(1000);
  }

  async getResultsCount(): Promise<number> {
    const gifs = this.results.locator('img');
    return await gifs.count();
  }

  async selectGif(index: number = 0) {
    const gifs = this.results.locator('img');
    await gifs.nth(index).click();
  }

  async isTrendingVisible(): Promise<boolean> {
    return await this.trendingContainer.isVisible();
  }
}
