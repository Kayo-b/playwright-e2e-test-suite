import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ResetPage } from '../pages/ResetPage';
import { HomePage } from '../pages/HomePage';

type AuthPageFixtures = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
  resetPage: ResetPage;
  homePage: HomePage;
};

// this fixture does not include authentication - used for testing auth UI
export const test = base.extend<AuthPageFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  registerPage: async ({ page }, use) => {
    const registerPage = new RegisterPage(page);
    await use(registerPage);
  },

  resetPage: async ({ page }, use) => {
    const resetPage = new ResetPage(page);
    await use(resetPage);
  },

  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },
});

export { expect } from '@playwright/test';
