import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { LoginPage } from './LoginPage';

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
    const loginPage = new LoginPage(this.page);
    await loginPage.navigate();
    await loginPage.forgotPasswordLink.click();
    await expect(this.container).toBeVisible({ timeout: 2000 });
    const pageUrl = this.page.url();
    expect(pageUrl).toContain('/reset');
  }

  async resetPassword(email: string) {
    await this.emailInput.fill(email);
    await this.submitButton.click();
  }
}
