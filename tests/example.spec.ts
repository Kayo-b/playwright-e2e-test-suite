import { test, expect } from '../fixtures/pages.fixture';

const selectors = {
  pageTitle: "Welcome to Firebase Hosting" 
}

test.describe('Twitter Clone - Homepage Tests', () => {
  
  test.beforeEach(async ({ homePage }) => {
    await homePage.navigate();
  });

  test('should load homepage successfully', async ({ homePage }) => {
    const isLoaded = await homePage.isHomePageLoaded();
    expect(isLoaded).toBeTruthy();
  });

  test('should display homepage title', async ({ homePage }) => {
    const title = await homePage.getTitle();
    expect(title).toBeTruthy();
    expect(title).toBe(selectors.pageTitle);
  });

  test('should have correct URL', async ({ homePage }) => {
    const url = homePage.getUrl();
    expect(url).toContain('/homepage');
  });
});

test.describe('Twitter Clone - Login Tests', () => {
  
  test('should navigate to login page', async ({ loginPage }) => {
    await loginPage.navigate();
    
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('should display login form elements', async ({ loginPage }) => {
    await loginPage.navigate();
    
    const emailVisible = await loginPage.emailInput.isVisible();
    const passwordVisible = await loginPage.passwordInput.isVisible();
    const buttonVisible = await loginPage.loginButton.isVisible();
    
    expect(emailVisible).toBeTruthy();
    expect(passwordVisible).toBeTruthy();
    expect(buttonVisible).toBeTruthy();
  });
});

test.describe('Twitter Clone - Multi-Page Tests', () => {
  
  test('should use multiple page objects', async ({ homePage, loginPage, profilePage }) => {
    await homePage.navigate();
    
    expect(await homePage.isHomePageLoaded()).toBeTruthy();
    
  });
});
