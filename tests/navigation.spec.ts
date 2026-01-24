import { test, expect } from '../fixtures/pages.fixture';

test.describe('Navigation - Sidebar', () => {

  test.beforeEach(async ({ homePage }) => {
    await homePage.navigate();
  });

  test('should display sidebar container', { tag: '@nav-sidebar-001' }, async ({ sidebarPage }) => {
    await expect(sidebarPage.container).toBeVisible();
  });

  test('should display sidebar menu', { tag: '@nav-sidebar-002' }, async ({ sidebarPage }) => {
    await expect(sidebarPage.menu).toBeVisible();
  });

  test('should display home link', { tag: '@nav-sidebar-003' }, async ({ sidebarPage }) => {
    await expect(sidebarPage.homeLink).toBeVisible();
  });

  test('should display bookmarks link', { tag: '@nav-sidebar-004' }, async ({ sidebarPage }) => {
    await expect(sidebarPage.bookmarksLink).toBeVisible();
  });

  test('should display dashboard section', { tag: '@nav-sidebar-005' }, async ({ sidebarPage }) => {
    await expect(sidebarPage.dashboard).toBeVisible();
  });

  test('should navigate to home when clicking home link', { tag: '@nav-sidebar-006' }, async ({ sidebarPage, homePage }) => {
    await sidebarPage.goToHome();
    
    expect(await homePage.isHomePageLoaded()).toBeTruthy();
  });

  test('should navigate to bookmarks when clicking bookmarks link', { tag: '@nav-sidebar-007' }, async ({ sidebarPage, bookmarksPage }) => {
    await sidebarPage.goToBookmarks();
    
    await expect(bookmarksPage.container).toBeVisible();
  });

  test('should have correct test IDs', { tag: '@nav-sidebar-008' }, async ({ sidebarPage }) => {
    await expect(sidebarPage.container).toHaveAttribute('data-testid', 'sidebar-container');
    await expect(sidebarPage.menu).toHaveAttribute('data-testid', 'sidebar-menu');
    await expect(sidebarPage.homeLink).toHaveAttribute('data-testid', 'sidebar-home-link');
    await expect(sidebarPage.bookmarksLink).toHaveAttribute('data-testid', 'sidebar-bookmarks-link');
    await expect(sidebarPage.dashboard).toHaveAttribute('data-testid', 'sidebar-dashboard');
  });
});

test.describe('Navigation - Dashboard', () => {

  test.beforeEach(async ({ homePage }) => {
    await homePage.navigate();
  });

  test('should display dashboard container', { tag: '@nav-dashboard-001' }, async ({ dashboardPage }) => {
    await expect(dashboardPage.container).toBeVisible();
  });

  test('should display profile picture', { tag: '@nav-dashboard-002' }, async ({ dashboardPage }) => {
    await expect(dashboardPage.profilePicture).toBeVisible();
  });

  test('should display profile info', { tag: '@nav-dashboard-003' }, async ({ dashboardPage }) => {
    await expect(dashboardPage.profileInfo).toBeVisible();
  });

  test('should display username', { tag: '@nav-dashboard-004' }, async ({ dashboardPage }) => {
    await expect(dashboardPage.username).toBeVisible();
  });

  test('should display email', { tag: '@nav-dashboard-005' }, async ({ dashboardPage }) => {
    await expect(dashboardPage.email).toBeVisible();
  });

  test('should display logout button', { tag: '@nav-dashboard-006' }, async ({ dashboardPage }) => {
    await expect(dashboardPage.logoutButton).toBeVisible();
  });

  test('should get username text', { tag: '@nav-dashboard-007' }, async ({ dashboardPage }) => {
    const username = await dashboardPage.getUsername();
    expect(username).toBeTruthy();
    expect(username.length).toBeGreaterThan(0);
  });

  test('should get email text', { tag: '@nav-dashboard-008' }, async ({ dashboardPage }) => {
    const email = await dashboardPage.getEmail();
    expect(email).toBeTruthy();
    expect(email.length).toBeGreaterThan(0);
  });

  test('should have correct test IDs', { tag: '@nav-dashboard-009' }, async ({ dashboardPage }) => {
    await expect(dashboardPage.container).toHaveAttribute('data-testid', 'dashboard-container');
    await expect(dashboardPage.profilePicture).toHaveAttribute('data-testid', 'dashboard-profile-picture');
    await expect(dashboardPage.profileInfo).toHaveAttribute('data-testid', 'dashboard-profile-info');
    await expect(dashboardPage.username).toHaveAttribute('data-testid', 'dashboard-username');
    await expect(dashboardPage.email).toHaveAttribute('data-testid', 'dashboard-email');
    await expect(dashboardPage.logoutButton).toHaveAttribute('data-testid', 'dashboard-logout-button');
  });
});

test.describe('Navigation - Searchbar', () => {

  test.beforeEach(async ({ homePage }) => {
    await homePage.navigate();
  });

  test('should display searchbar container', { tag: '@nav-searchbar-001' }, async ({ searchbarPage }) => {
    await expect(searchbarPage.container).toBeVisible();
  });

  test('should display search input', { tag: '@nav-searchbar-002' }, async ({ searchbarPage }) => {
    await expect(searchbarPage.input).toBeVisible();
  });

  test('should display search submit button', { tag: '@nav-searchbar-003' }, async ({ searchbarPage }) => {
    await expect(searchbarPage.submitButton).toBeVisible();
  });

  test('should allow text input in search field', { tag: '@nav-searchbar-004' }, async ({ searchbarPage }) => {
    const searchQuery = 'test search';
    await searchbarPage.input.fill(searchQuery);
    
    await expect(searchbarPage.input).toHaveValue(searchQuery);
  });

  test('should have correct test IDs', { tag: '@nav-searchbar-005' }, async ({ searchbarPage }) => {
    await expect(searchbarPage.container).toHaveAttribute('data-testid', 'searchbar-container');
    await expect(searchbarPage.input).toHaveAttribute('data-testid', 'searchbar-input');
    await expect(searchbarPage.submitButton).toHaveAttribute('data-testid', 'searchbar-submit-button');
  });

  test('should display mobile search button if present', { tag: '@nav-searchbar-006' }, async ({ searchbarPage, page }) => {
    const mobileButton = page.getByTestId('searchbar-mobile-button');
    if (await mobileButton.isVisible()) {
      await expect(mobileButton).toHaveAttribute('data-testid', 'searchbar-mobile-button');
    }
  });
});

test.describe('Navigation - Navbar', () => {

  test.beforeEach(async ({ homePage }) => {
    await homePage.navigate();
  });

  test('should display navbar container', { tag: '@nav-navbar-001' }, async ({ page }) => {
    const navbar = page.getByTestId('navbar-container');
    await expect(navbar).toBeVisible();
  });

  test('should display navbar search container', { tag: '@nav-navbar-002' }, async ({ page }) => {
    const searchContainer = page.getByTestId('navbar-search-container');
    await expect(searchContainer).toBeVisible();
  });

  test('should have correct navbar test IDs', { tag: '@nav-navbar-003' }, async ({ page }) => {
    const navbar = page.getByTestId('navbar-container');
    await expect(navbar).toHaveAttribute('data-testid', 'navbar-container');
    
    const searchContainer = page.getByTestId('navbar-search-container');
    await expect(searchContainer).toHaveAttribute('data-testid', 'navbar-search-container');
  });
});

test.describe('Navigation - Page Transitions', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/homepage');
  });

  test('should navigate between homepage and bookmarks', { tag: '@nav-transitions-001' }, async ({ sidebarPage, homePage, bookmarksPage }) => {
    await homePage.navigate();
    expect(await homePage.isHomePageLoaded()).toBeTruthy();
    
    await sidebarPage.goToBookmarks();
    await expect(bookmarksPage.container).toBeVisible();
    
    await sidebarPage.goToHome();
    expect(await homePage.isHomePageLoaded()).toBeTruthy();
  });

  test('should maintain navigation state across pages', { tag: '@nav-transitions-002' }, async ({ sidebarPage, homePage, bookmarksPage }) => {
    await homePage.navigate();
    
    await expect(sidebarPage.container).toBeVisible();
    
    await sidebarPage.goToBookmarks();
    
    await expect(sidebarPage.container).toBeVisible();
  });
});
