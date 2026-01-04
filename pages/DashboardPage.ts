import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  readonly container: Locator;
  readonly profilePicture: Locator;
  readonly profileInfo: Locator;
  readonly username: Locator;
  readonly email: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.container = page.getByTestId('dashboard-container');
    this.profilePicture = page.getByTestId('dashboard-profile-picture');
    this.profileInfo = page.getByTestId('dashboard-profile-info');
    this.username = page.getByTestId('dashboard-username');
    this.email = page.getByTestId('dashboard-email');
    this.logoutButton = page.getByTestId('dashboard-logout-button');
  }

  async getUsername(): Promise<string> {
    return await this.username.textContent({timeout:5000}) || '';
  }

  async getEmail(): Promise<string> {
    return await this.email.textContent() || '';
  }

  async logout() {
    await this.logoutButton.click();
  }

  async isVisible(): Promise<boolean> {
    return await this.container.isVisible();
  }
}
