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
  }

  async waitForResults(timeout: number = 10000) {
    // First wait for the results container to be attached
    await this.results.waitFor({ state: 'attached', timeout });
    // Then wait for actual GIF images to be attached (they may be hidden by CSS)
    const gifs = this.results.locator('img');
    await gifs.first().waitFor({ state: 'attached', timeout });
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
