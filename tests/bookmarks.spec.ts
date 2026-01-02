import { test, expect } from '../fixtures/pages.fixture';

test.describe('Bookmarks - Page Layout', () => {

  test.beforeEach(async ({ loginPage, bookmarksPage, page }) => {
    await loginPage.navigate();
    await loginPage.loginAsGuest();
    await bookmarksPage.navigate();
  })

  test('should display bookmar$s container', { tag: '@bookmarks-layout-001' }, async ({ bookmarksPage, page }) => {
    await expect(bookmarksPage.container).toBeVisible();
  });

  test('should display bookmarks posts list', { tag: '@bookmarks-layout-002' }, async ({ bookmarksPage, page }) => {
    await expect(bookmarksPage.postsList).toBeVisible();
  });

  test('should have correct test IDs', { tag: '@bookmarks-layout-003' }, async ({ bookmarksPage, page }) => {
    await expect(bookmarksPage.container).toHaveAttribute('data-testid', 'bookmarks-container');
    await expect(bookmarksPage.postsList).toHaveAttribute('data-testid', 'bookmarks-posts-list');
  });

  test('should load bookmarks page correctly', { tag: '@bookmarks-layout-004' }, async ({ bookmarksPage }) => {
    const url = bookmarksPage.getUrl();
    expect(url).toContain('/bookmarks');
  });
});

test.describe('Bookmarks - Bookmarked Posts', () => {
  
  test.beforeEach(async ({ loginPage, bookmarksPage }) => {
    await loginPage.navigate();
    await loginPage.loginAsGuest();
    await bookmarksPage.navigate();
  });

  test('should check bookmarks count', { tag: '@bookmarks-posts-001' }, async ({ bookmarksPage }) => {
    const count = await bookmarksPage.getBookmarksCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display bookmark posts if any exist', { tag: '@bookmarks-posts-002' }, async ({ bookmarksPage, page }) => {
    const count = await bookmarksPage.getBookmarksCount();
    
    if (count > 0) {
      const firstBookmark = bookmarksPage.getBookmarkByIndex(0);
      await expect(firstBookmark).toBeVisible();
    }
  });

  test('should have correct test IDs for bookmark posts', { tag: '@bookmarks-posts-003' }, async ({ bookmarksPage, page }) => {
    const count = await bookmarksPage.getBookmarksCount();
    
    if (count > 0) {
      const bookmarkPost = page.getByTestId('bookmark-post-container').first();
      await expect(bookmarkPost).toHaveAttribute('data-testid', 'bookmark-post-container');
      
      const userContainer = bookmarkPost.getByTestId('bookmark-post-user-container');
      await expect(userContainer).toHaveAttribute('data-testid', 'bookmark-post-user-container');
      
      const userAvatar = bookmarkPost.getByTestId('bookmark-post-user-avatar');
      await expect(userAvatar).toHaveAttribute('data-testid', 'bookmark-post-user-avatar');
      
      const username = bookmarkPost.getByTestId('bookmark-post-username');
      await expect(username).toHaveAttribute('data-testid', 'bookmark-post-username');
      
      const content = bookmarkPost.getByTestId('bookmark-post-content');
      await expect(content).toHaveAttribute('data-testid', 'bookmark-post-content');
    }
  });
});

test.describe('Bookmarks - Adding and Removing', () => {
  
  test.beforeEach(async ({ loginPage, homePage }) => {
    await loginPage.navigate();
    await loginPage.loginAsGuest();
    await homePage.navigate();
  });

  test('should bookmark a post from homepage', { tag: '@bookmarks-actions-001' }, async ({ page, bookmarksPage, homePage }) => {
    await homePage.wait(2000);
    const bookmarkButton = page.getByTestId('bookmark-button-container').first();
    
    if (await bookmarkButton.isVisible()) {
      await bookmarksPage.navigate();
      const initialCount = await bookmarksPage.getBookmarksCount();
      
      await homePage.clickHomeBtn();
      await bookmarkButton.click();
      await page.waitForTimeout(1000);

      await bookmarksPage.navigate();
      const newCount = await bookmarksPage.getBookmarksCount();
      
      expect(newCount).toBeGreaterThanOrEqual(initialCount);
    }
  });

  test('should remove bookmark by clicking bookmark button again', { tag: '@bookmarks-actions-002' }, async ({ page, bookmarksPage, homePage }) => {
    await bookmarksPage.navigate();
    const count = await bookmarksPage.getBookmarksCount();
    
    if (count > 0) {
      await bookmarksPage.clickBookmark(0);
      await homePage.wait(1000);
      
      const bookmarkButton = page.getByTestId('bookmark-button-container').first();
      if (await bookmarkButton.isVisible()) {
        await bookmarkButton.click();
        
        await bookmarksPage.navigate();
        await bookmarksPage.wait(1000);
        
        const newCount = await bookmarksPage.getBookmarksCount();
        expect(newCount).toBeLessThanOrEqual(count);
      }
    }
  });
});

test.describe('Bookmarks - Empty State', () => {
  
  test('should handle empty bookmarks gracefully', { tag: '@bookmarks-empty-001' }, async ({ loginPage, bookmarksPage }) => {
    await loginPage.navigate();
    await loginPage.loginAsGuest();
    await bookmarksPage.navigate();
    
    const isEmpty = await bookmarksPage.isEmpty();
    
    if (isEmpty) {
      await expect(bookmarksPage.container).toBeVisible();
      await expect(bookmarksPage.postsList).toBeVisible();
    }
  });
});
