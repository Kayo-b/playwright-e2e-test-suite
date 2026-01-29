import { test, expect } from '../fixtures/pages.fixture';

test.describe('Navigation - Sidebar', () => {

  test.beforeEach(async ({ homePage }) => {
    await homePage.navigate();
  });

  test('should navigate to home via sidebar', { tag: '@nav-sidebar-001' }, async ({ sidebarPage, homePage }) => {
    await expect(sidebarPage.container).toBeVisible();
    await expect(sidebarPage.homeLink).toBeVisible();

    await sidebarPage.goToHome();

    expect(await homePage.isHomePageLoaded()).toBeTruthy();
  });

  test('should navigate to bookmarks via sidebar', { tag: '@nav-sidebar-002' }, async ({ sidebarPage, bookmarksPage }) => {
    await expect(sidebarPage.bookmarksLink).toBeVisible();

    await sidebarPage.goToBookmarks();

    await expect(bookmarksPage.container).toBeVisible();
  });
});

test.describe('Navigation - Dashboard', () => {

  test.beforeEach(async ({ homePage }) => {
    await homePage.navigate();
  });

  test('should display user profile information', { tag: '@nav-dashboard-001' }, async ({ dashboardPage }) => {
    await expect(dashboardPage.container).toBeVisible();
    await expect(dashboardPage.profilePicture).toBeVisible();
    await expect(dashboardPage.profileInfo).toBeVisible();

    const username = await dashboardPage.getUsername();
    const email = await dashboardPage.getEmail();

    expect(username.length).toBeGreaterThan(0);
    expect(email.length).toBeGreaterThan(0);
  });

  test('should display logout button', { tag: '@nav-dashboard-002' }, async ({ dashboardPage }) => {
    await expect(dashboardPage.logoutButton).toBeVisible();
  });
});

test.describe('Navigation - Searchbar', () => {

  test.beforeEach(async ({ homePage }) => {
    await homePage.navigate();
  });

  test('should allow text input in search field', { tag: '@nav-searchbar-001' }, async ({ searchbarPage }) => {
    await expect(searchbarPage.container).toBeVisible();
    await expect(searchbarPage.input).toBeVisible();
    await expect(searchbarPage.submitButton).toBeVisible();

    const searchQuery = 'test search';
    await searchbarPage.input.fill(searchQuery);

    await expect(searchbarPage.input).toHaveValue(searchQuery);
  });
});

test.describe('Navigation - Page Transitions', () => {

  test('should navigate between homepage and bookmarks', { tag: '@nav-transitions-001' }, async ({ sidebarPage, homePage, bookmarksPage }) => {
    await homePage.navigate();
    expect(await homePage.isHomePageLoaded()).toBeTruthy();

    await sidebarPage.goToBookmarks();
    await expect(bookmarksPage.container).toBeVisible();

    await sidebarPage.goToHome();
    expect(await homePage.isHomePageLoaded()).toBeTruthy();
  });

  test('should maintain sidebar visibility across pages', { tag: '@nav-transitions-002' }, async ({ sidebarPage, homePage, bookmarksPage }) => {
    await homePage.navigate();
    await expect(sidebarPage.container).toBeVisible();

    await sidebarPage.goToBookmarks();
    await expect(sidebarPage.container).toBeVisible();
  });
});
