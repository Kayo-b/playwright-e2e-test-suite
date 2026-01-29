import { test, expect } from '../fixtures/pages.fixture';

const selectors = {
  pageTitle: "Welcome to Firebase Hosting"
}

test.describe('Smoke Tests', () => {

  test('should load homepage successfully', async ({ homePage }) => {
    await homePage.navigate();

    expect(await homePage.isHomePageLoaded()).toBeTruthy();
    expect(await homePage.getTitle()).toBe(selectors.pageTitle);
    expect(homePage.getUrl()).toContain('/homepage');
  });

  test('should navigate to login page with form elements', async ({ loginPage }) => {
    await loginPage.navigate();

    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });
});
