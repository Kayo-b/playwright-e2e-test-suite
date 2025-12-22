import { test, expect } from '../fixtures/pages.fixture';

test.describe('Navigation - Sidebar', () => {
  
  test.beforeEach(async ({ loginPage, homePage }) => {
    await loginPage.navigate();
    await loginPage.loginAsGuest();
    await homePage.navigate();
  });

  test('should display sidebar container', async ({ sidebarPage }) => {
    await expect(sidebarPage.container).toBeVisible();
  });

  test('should display sidebar menu', async ({ sidebarPage }) => {
    await expect(sidebarPage.menu).toBeVisible();
  });

  test('should display home link', async ({ sidebarPage }) => {
    await expect(sidebarPage.homeLink).toBeVisible();
  });

  test('should display bookmarks link', async ({ sidebarPage }) => {
    await expect(sidebarPage.bookmarksLink).toBeVisible();
  });

  test('should display dashboard section', async ({ sidebarPage }) => {
    await expect(sidebarPage.dashboard).toBeVisible();
  });

  test('should navigate to home when clicking home link', async ({ sidebarPage, homePage }) => {
    await sidebarPage.goToHome();
    
    // Verify we're on homepage
    expect(await homePage.isHomePageLoaded()).toBeTruthy();
  });

  test('should navigate to bookmarks when clicking bookmarks link', async ({ sidebarPage, bookmarksPage }) => {
    await sidebarPage.goToBookmarks();
    
    // Verify we're on bookmarks page
    await expect(bookmarksPage.container).toBeVisible();
  });

  test('should have correct test IDs', async ({ sidebarPage }) => {
    await expect(sidebarPage.container).toHaveAttribute('data-testid', 'sidebar-container');
    await expect(sidebarPage.menu).toHaveAttribute('data-testid', 'sidebar-menu');
    await expect(sidebarPage.homeLink).toHaveAttribute('data-testid', 'sidebar-home-link');
    await expect(sidebarPage.bookmarksLink).toHaveAttribute('data-testid', 'sidebar-bookmarks-link');
    await expect(sidebarPage.dashboard).toHaveAttribute('data-testid', 'sidebar-dashboard');
  });
});

test.describe('Navigation - Dashboard', () => {
  
  test.beforeEach(async ({ loginPage, homePage }) => {
    await loginPage.navigate();
    await loginPage.loginAsGuest();
    await homePage.navigate();
  });

  test('should display dashboard container', async ({ dashboardPage }) => {
    await expect(dashboardPage.container).toBeVisible();
  });

  test('should display profile picture', async ({ dashboardPage }) => {
    await expect(dashboardPage.profilePicture).toBeVisible();
  });

  test('should display profile info', async ({ dashboardPage }) => {
    await expect(dashboardPage.profileInfo).toBeVisible();
  });

  test('should display username', async ({ dashboardPage }) => {
    await expect(dashboardPage.username).toBeVisible();
  });

  test('should display email', async ({ dashboardPage }) => {
    await expect(dashboardPage.email).toBeVisible();
  });

  test('should display logout button', async ({ dashboardPage }) => {
    await expect(dashboardPage.logoutButton).toBeVisible();
  });

  test('should get username text', async ({ dashboardPage }) => {
    const username = await dashboardPage.getUsername();
    expect(username).toBeTruthy();
    expect(username.length).toBeGreaterThan(0);
  });

  test('should get email text', async ({ dashboardPage }) => {
    const email = await dashboardPage.getEmail();
    expect(email).toBeTruthy();
    expect(email.length).toBeGreaterThan(0);
  });

  test('should have correct test IDs', async ({ dashboardPage }) => {
    await expect(dashboardPage.container).toHaveAttribute('data-testid', 'dashboard-container');
    await expect(dashboardPage.profilePicture).toHaveAttribute('data-testid', 'dashboard-profile-picture');
    await expect(dashboardPage.profileInfo).toHaveAttribute('data-testid', 'dashboard-profile-info');
    await expect(dashboardPage.username).toHaveAttribute('data-testid', 'dashboard-username');
    await expect(dashboardPage.email).toHaveAttribute('data-testid', 'dashboard-email');
    await expect(dashboardPage.logoutButton).toHaveAttribute('data-testid', 'dashboard-logout-button');
  });
});

test.describe('Navigation - Searchbar', () => {
  
  test.beforeEach(async ({ loginPage, homePage }) => {
    await loginPage.navigate();
    await loginPage.loginAsGuest();
    await homePage.navigate();
  });

  test('should display searchbar container', async ({ searchbarPage }) => {
    await expect(searchbarPage.container).toBeVisible();
  });

  test('should display search input', async ({ searchbarPage }) => {
    await expect(searchbarPage.input).toBeVisible();
  });

  test('should display search submit button', async ({ searchbarPage }) => {
    await expect(searchbarPage.submitButton).toBeVisible();
  });

  test('should allow text input in search field', async ({ searchbarPage }) => {
    const searchQuery = 'test search';
    await searchbarPage.input.fill(searchQuery);
    
    await expect(searchbarPage.input).toHaveValue(searchQuery);
  });

  test('should have correct test IDs', async ({ searchbarPage }) => {
    await expect(searchbarPage.container).toHaveAttribute('data-testid', 'searchbar-container');
    await expect(searchbarPage.input).toHaveAttribute('data-testid', 'searchbar-input');
    await expect(searchbarPage.submitButton).toHaveAttribute('data-testid', 'searchbar-submit-button');
  });

  test('should display mobile search button if present', async ({ searchbarPage, page }) => {
    // Mobile button may only be visible on smaller screens
    const mobileButton = page.getByTestId('searchbar-mobile-button');
    if (await mobileButton.isVisible()) {
      await expect(mobileButton).toHaveAttribute('data-testid', 'searchbar-mobile-button');
    }
  });
});

test.describe('Navigation - Navbar', () => {
  
  test.beforeEach(async ({ loginPage, homePage }) => {
    await loginPage.navigate();
    await loginPage.loginAsGuest();
    await homePage.navigate();
  });

  test('should display navbar container', async ({ page }) => {
    const navbar = page.getByTestId('navbar-container');
    await expect(navbar).toBeVisible();
  });

  test('should display navbar search container', async ({ page }) => {
    const searchContainer = page.getByTestId('navbar-search-container');
    await expect(searchContainer).toBeVisible();
  });

  test('should have correct navbar test IDs', async ({ page }) => {
    const navbar = page.getByTestId('navbar-container');
    await expect(navbar).toHaveAttribute('data-testid', 'navbar-container');
    
    const searchContainer = page.getByTestId('navbar-search-container');
    await expect(searchContainer).toHaveAttribute('data-testid', 'navbar-search-container');
  });
});

test.describe('Navigation - Page Transitions', () => {
  
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigate();
    await loginPage.loginAsGuest();
  });

  test('should navigate between homepage and bookmarks', async ({ sidebarPage, homePage, bookmarksPage }) => {
    // Start at homepage
    await homePage.navigate();
    expect(await homePage.isHomePageLoaded()).toBeTruthy();
    
    // Navigate to bookmarks
    await sidebarPage.goToBookmarks();
    await expect(bookmarksPage.container).toBeVisible();
    
    // Navigate back to homepage
    await sidebarPage.goToHome();
    expect(await homePage.isHomePageLoaded()).toBeTruthy();
  });

  test('should maintain navigation state across pages', async ({ sidebarPage, homePage, bookmarksPage }) => {
    // Navigate to homepage
    await homePage.navigate();
    
    // Sidebar should be visible
    await expect(sidebarPage.container).toBeVisible();
    
    // Navigate to bookmarks
    await sidebarPage.goToBookmarks();
    
    // Sidebar should still be visible
    await expect(sidebarPage.container).toBeVisible();
  });
});
