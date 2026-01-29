import { test, expect } from '../fixtures/auth.fixture';

test.describe('Authentication - Login', () => {

  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigate();
  });

  test('should navigate to register page when clicking register link', { tag: '@auth-login-001' }, async ({ loginPage, registerPage }) => {
    await expect(loginPage.registerLink).toBeVisible();
    await loginPage.clickRegister();

    await expect(registerPage.container).toBeVisible();
  });

  test('should navigate to reset password page when clicking forgot password', { tag: '@auth-login-002' }, async ({ loginPage, resetPage }) => {
    await expect(loginPage.forgotPasswordLink).toBeVisible();
    await loginPage.clickForgotPassword();

    await expect(resetPage.container).toBeVisible();
  });

  test('should login as guest user', { tag: '@auth-login-003' }, async ({ loginPage, homePage }) => {
    await expect(loginPage.guestButton).toBeVisible();
    await loginPage.loginAsGuest();

    await expect(homePage.container).toBeVisible();
    expect(await homePage.isHomePageLoaded()).toBeTruthy();
  });

  test('should accept email and password input', { tag: '@auth-login-004' }, async ({ loginPage }) => {
    const testEmail = 'test@example.com';
    const testPassword = 'password123';

    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();

    await loginPage.emailInput.fill(testEmail);
    await loginPage.passwordInput.fill(testPassword);

    await expect(loginPage.emailInput).toHaveValue(testEmail);
    await expect(loginPage.passwordInput).toHaveValue(testPassword);
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
  });
});

test.describe('Authentication - Register', () => {

  test.beforeEach(async ({ registerPage }) => {
    await registerPage.navigate();
  });

  test('should navigate to login page when clicking login link', { tag: '@auth-register-001' }, async ({ registerPage, loginPage }) => {
    await expect(registerPage.loginLink).toBeVisible();
    await registerPage.clickLogin();

    await expect(loginPage.container).toBeVisible();
  });

  test('should accept registration form inputs', { tag: '@auth-register-002' }, async ({ registerPage }) => {
    const testName = 'John Doe';
    const testEmail = 'newuser@example.com';
    const testPassword = 'securepassword123';

    await expect(registerPage.nameInput).toBeVisible();
    await expect(registerPage.emailInput).toBeVisible();
    await expect(registerPage.passwordInput).toBeVisible();

    await registerPage.nameInput.fill(testName);
    await registerPage.emailInput.fill(testEmail);
    await registerPage.passwordInput.fill(testPassword);

    await expect(registerPage.nameInput).toHaveValue(testName);
    await expect(registerPage.emailInput).toHaveValue(testEmail);
    await expect(registerPage.passwordInput).toHaveValue(testPassword);
    await expect(registerPage.passwordInput).toHaveAttribute('type', 'password');
  });
});

test.describe('Authentication - Reset Password', () => {

  test.beforeEach(async ({ resetPage }) => {
    await resetPage.navigate();
  });

  test('should accept email input for password reset', { tag: '@auth-reset-001' }, async ({ resetPage }) => {
    const testEmail = 'reset@example.com';

    await expect(resetPage.emailInput).toBeVisible();
    await expect(resetPage.submitButton).toBeVisible();

    await resetPage.emailInput.fill(testEmail);

    await expect(resetPage.emailInput).toHaveValue(testEmail);
  });
});
