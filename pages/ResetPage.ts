import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ResetPage extends BasePage {
  readonly container: Locator;
  readonly emailInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.container = page.getByTestId('reset-container');
    this.emailInput = page.getByTestId('reset-email-input');
    this.submitButton = page.getByTestId('reset-submit-button');
  }

  async navigate() {
    await this.goto('/reset');
  }

  async resetPassword(email: string) {
    await this.emailInput.fill(email);
    await this.submitButton.click();
  }
}
