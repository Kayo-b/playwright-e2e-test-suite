import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { HomePage } from './HomePage';

export class LoginPage extends BasePage {
  readonly container: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly googleButton: Locator;
  readonly guestButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly registerLink: Locator;

  constructor(page: Page) {
    super(page);
    this.container = page.getByTestId('login-container');
    this.emailInput = page.getByTestId('login-email-input');
    this.passwordInput = page.getByTestId('login-password-input');
    this.loginButton = page.getByTestId('login-submit-button');
    this.googleButton = page.getByTestId('login-google-button');
    this.guestButton = page.getByTestId('login-guest-button');
    this.forgotPasswordLink = page.getByTestId('login-forgot-password-link');
    this.registerLink = page.getByTestId('login-register-link');
  }

  async navigate() {
    await this.goto('/');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async loginWithGoogle() {
    await this.googleButton.click();
  }

  async loginAsGuest() {
    const homepage = new HomePage(this.page)
    await this.guestButton.click();
    await expect(homepage.container).toBeVisible({ timeout: 5000 });
    const pageUrl = this.page.url();
    expect(pageUrl).toContain('/homepage')
  }

  async clickRegister() {
    await this.registerLink.click();
  }

  async clickForgotPassword() {
    await this.forgotPasswordLink.click();
  }
}
