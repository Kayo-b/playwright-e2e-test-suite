import { test, expect } from '../fixtures/pages.fixture';

test.describe('Authentication - Login', () => {
  
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigate();
  });

  test('should display all login form elements', { tag: '@auth-login-001' }, async ({ loginPage }) => {
    await expect(loginPage.container).toBeVisible();
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.googleButton).toBeVisible();
    await expect(loginPage.guestButton).toBeVisible();
  });

  test('should display navigation links', { tag: '@auth-login-002' }, async ({ loginPage }) => {
    await expect(loginPage.forgotPasswordLink).toBeVisible();
    await expect(loginPage.registerLink).toBeVisible();
  });

  test('should navigate to register page when clicking register link', { tag: '@auth-login-003' }, async ({ loginPage, registerPage }) => {
    await loginPage.clickRegister();
    
    await expect(registerPage.container).toBeVisible();
  });

  test('should navigate to reset password page when clicking forgot password', { tag: '@auth-login-004' }, async ({ loginPage, resetPage }) => {
    await loginPage.clickForgotPassword();
    
    await expect(resetPage.container).toBeVisible();
  });

  test('should login as guest user', { tag: '@auth-login-005' }, async ({ loginPage, homePage }) => {
    await loginPage.loginAsGuest();
    
    await expect(homePage.container).toBeVisible();
    expect(await homePage.isHomePageLoaded()).toBeTruthy();
  });

  test('should allow email input', { tag: '@auth-login-006' }, async ({ loginPage }) => {
    const testEmail = 'test@example.com';
    await loginPage.emailInput.fill(testEmail);
    
    await expect(loginPage.emailInput).toHaveValue(testEmail);
  });

  test('should allow password input and mask characters', { tag: '@auth-login-007' }, async ({ loginPage }) => {
    const testPassword = 'password123';
    await loginPage.passwordInput.fill(testPassword);
    
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
    await expect(loginPage.passwordInput).toHaveValue(testPassword);
  });

  test('should have correct test IDs', { tag: '@auth-login-008' }, async ({ loginPage }) => {
    await expect(loginPage.container).toHaveAttribute('data-testid', 'login-container');
    await expect(loginPage.emailInput).toHaveAttribute('data-testid', 'login-email-input');
    await expect(loginPage.passwordInput).toHaveAttribute('data-testid', 'login-password-input');
    await expect(loginPage.loginButton).toHaveAttribute('data-testid', 'login-submit-button');
    await expect(loginPage.googleButton).toHaveAttribute('data-testid', 'login-google-button');
    await expect(loginPage.guestButton).toHaveAttribute('data-testid', 'login-guest-button');
  });
});

test.describe('Authentication - Register', () => {
  
  test.beforeEach(async ({ registerPage }) => {
    await registerPage.navigate();
  });

  test('should display all register form elements', { tag: '@auth-register-001' }, async ({ registerPage }) => {
    await expect(registerPage.container).toBeVisible();
    await expect(registerPage.nameInput).toBeVisible();
    await expect(registerPage.emailInput).toBeVisible();
    await expect(registerPage.passwordInput).toBeVisible();
    await expect(registerPage.registerButton).toBeVisible();
    await expect(registerPage.googleButton).toBeVisible();
    await expect(registerPage.loginLink).toBeVisible();
  });

  test('should navigate to login page when clicking login link', { tag: '@auth-register-002' }, async ({ registerPage, loginPage }) => {
    await registerPage.clickLogin();
    
    await expect(loginPage.container).toBeVisible();
  });

  test('should allow name input', { tag: '@auth-register-003' }, async ({ registerPage }) => {
    const testName = 'John Doe';
    await registerPage.nameInput.fill(testName);
    
    await expect(registerPage.nameInput).toHaveValue(testName);
  });

  test('should allow email input', { tag: '@auth-register-004' }, async ({ registerPage }) => {
    const testEmail = 'newuser@example.com';
    await registerPage.emailInput.fill(testEmail);
    
    await expect(registerPage.emailInput).toHaveValue(testEmail);
  });

  test('should allow password input', { tag: '@auth-register-005' }, async ({ registerPage }) => {
    const testPassword = 'securepassword123';
    await registerPage.passwordInput.fill(testPassword);
    
    await expect(registerPage.passwordInput).toHaveAttribute('type', 'password');
    await expect(registerPage.passwordInput).toHaveValue(testPassword);
  });

  test('should have correct test IDs', { tag: '@auth-register-006' }, async ({ registerPage }) => {
    await expect(registerPage.container).toHaveAttribute('data-testid', 'register-container');
    await expect(registerPage.nameInput).toHaveAttribute('data-testid', 'register-name-input');
    await expect(registerPage.emailInput).toHaveAttribute('data-testid', 'register-email-input');
    await expect(registerPage.passwordInput).toHaveAttribute('data-testid', 'register-password-input');
    await expect(registerPage.registerButton).toHaveAttribute('data-testid', 'register-submit-button');
    await expect(registerPage.googleButton).toHaveAttribute('data-testid', 'register-google-button');
  });
});

test.describe('Authentication - Reset Password', () => {
  
  test.beforeEach(async ({ resetPage }) => {
    await resetPage.navigate();
  });

  test('should display reset password form elements', { tag: '@auth-reset-001' }, async ({ resetPage }) => {
    await expect(resetPage.container).toBeVisible();
    await expect(resetPage.emailInput).toBeVisible();
    await expect(resetPage.submitButton).toBeVisible();
  });

  test('should allow email input', { tag: '@auth-reset-002' }, async ({ resetPage }) => {
    const testEmail = 'reset@example.com';
    await resetPage.emailInput.fill(testEmail);
    
    await expect(resetPage.emailInput).toHaveValue(testEmail);
  });

  test('should have correct test IDs', { tag: '@auth-reset-003' }, async ({ resetPage }) => {
    await expect(resetPage.container).toHaveAttribute('data-testid', 'reset-container');
    await expect(resetPage.emailInput).toHaveAttribute('data-testid', 'reset-email-input');
    await expect(resetPage.submitButton).toHaveAttribute('data-testid', 'reset-submit-button');
  });
});
