import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class RegisterPage extends BasePage {
  readonly container: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly registerButton: Locator;
  readonly googleButton: Locator;
  readonly loginLink: Locator;

  constructor(page: Page) {
    super(page);
    this.container = page.getByTestId('register-container');
    this.nameInput = page.getByTestId('register-name-input');
    this.emailInput = page.getByTestId('register-email-input');
    this.passwordInput = page.getByTestId('register-password-input');
    this.registerButton = page.getByTestId('register-submit-button');
    this.googleButton = page.getByTestId('register-google-button');
    this.loginLink = page.getByTestId('register-login-link');
  }

  async navigate() {
    await this.goto('/register');
  }

  async register(name: string, email: string, password: string) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.registerButton.click();
  }

  async registerWithGoogle() {
    await this.googleButton.click();
  }

  async clickLogin() {
    await this.loginLink.click();
  }
}
