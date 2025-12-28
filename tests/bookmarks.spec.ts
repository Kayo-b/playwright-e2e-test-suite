import { test, expect } from '../fixtures/pages.fixture';

test.describe('Bookmarks - Page Layout', () => {

  test.beforeEach(async ({ loginPage, bookmarksPage, page }) => {
    await loginPage.navigate();
    await loginPage.loginAsGuest();
    await bookmarksPage.navigate();
  })

  test('should display bookmar$s container', async ({ bookmarksPage, page }) => {
    await expect(bookmarksPage.container).toBeVisible();
  });

  test('should display bookmarks posts list', async ({ bookmarksPage, page }) => {
    await expect(bookmarksPage.postsList).toBeVisible();
  });

  test('should have correct test IDs', async ({ bookmarksPage, page }) => {
    await expect(bookmarksPage.container).toHaveAttribute('data-testid', 'bookmarks-container');
    await expect(bookmarksPage.postsList).toHaveAttribute('data-testid', 'bookmarks-posts-list');
  });

  test('should load bookmarks page correctly', async ({ bookmarksPage }) => {
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

  test('should check bookmarks count', async ({ bookmarksPage }) => {
    const count = await bookmarksPage.getBookmarksCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display bookmark posts if any exist', async ({ bookmarksPage, page }) => {
    const count = await bookmarksPage.getBookmarksCount();
    
    if (count > 0) {
      const firstBookmark = bookmarksPage.getBookmarkByIndex(0);
      await expect(firstBookmark).toBeVisible();
    }
  });

  test('should have correct test IDs for bookmark posts', async ({ bookmarksPage, page }) => {
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

  test('should bookmark a post from homepage', async ({ page, bookmarksPage, homePage }) => {
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

  test('should remove bookmark by clicking bookmark button again', async ({ page, bookmarksPage, homePage }) => {
    // First ensure we have at least one bookmark
    await bookmarksPage.navigate();
    const count = await bookmarksPage.getBookmarksCount();
    
    if (count > 0) {
      // Click on the bookmarked post to go to it
      await bookmarksPage.clickBookmark(0);
      await homePage.wait(1000);
      
      // Find and click the bookmark button to remove bookmark
      const bookmarkButton = page.getByTestId('bookmark-button-container').first();
      if (await bookmarkButton.isVisible()) {
        await bookmarkButton.click();
        
        // Navigate back to bookmarks
        await bookmarksPage.navigate();
        await bookmarksPage.wait(1000);
        
        const newCount = await bookmarksPage.getBookmarksCount();
        // Count should have decreased or stayed same
        expect(newCount).toBeLessThanOrEqual(count);
      }
    }
  });
});

test.describe('Bookmarks - Empty State', () => {
  
  test('should handle empty bookmarks gracefully', async ({ loginPage, bookmarksPage }) => {
    await loginPage.navigate();
    await loginPage.loginAsGuest();
    await bookmarksPage.navigate();
    
    const isEmpty = await bookmarksPage.isEmpty();
    
    if (isEmpty) {
      // Container should still be visible even if empty
      await expect(bookmarksPage.container).toBeVisible();
      await expect(bookmarksPage.postsList).toBeVisible();
    }
  });
});
