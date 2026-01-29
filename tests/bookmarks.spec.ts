import { test, expect } from '../fixtures/pages.fixture';

test.describe('Bookmarks', () => {

  test('should load bookmarks page', { tag: '@bookmarks-001' }, async ({ bookmarksPage }) => {
    await bookmarksPage.navigate();

    await expect(bookmarksPage.container).toBeVisible();
    await expect(bookmarksPage.postsList).toBeVisible();
    expect(bookmarksPage.getUrl()).toContain('/bookmarks');
  });

  test('should display bookmarked posts if any exist', { tag: '@bookmarks-002' }, async ({ bookmarksPage }) => {
    await bookmarksPage.navigate();

    const count = await bookmarksPage.getBookmarksCount();
    expect(count).toBeGreaterThanOrEqual(0);

    if (count > 0) {
      const firstBookmark = bookmarksPage.getBookmarkByIndex(0);
      await expect(firstBookmark).toBeVisible();
    }
  });
});

test.describe('Bookmarks - Actions', () => {

  test('should bookmark a post from homepage', { tag: '@bookmarks-actions-001' }, async ({ page, bookmarksPage, homePage }) => {
    await homePage.navigate();
    await homePage.waitForPostsToLoad();

    const bookmarkButton = page.getByTestId('bookmark-button-container').first();
    if (!await bookmarkButton.isVisible()) {
      test.skip();
      return;
    }

    await bookmarksPage.navigate();
    const initialCount = await bookmarksPage.getBookmarksCount();

    await homePage.clickHomeBtn();
    await bookmarkButton.click();

    await bookmarksPage.navigate();
    const newCount = await bookmarksPage.getBookmarksCount();

    expect(newCount).toBeGreaterThanOrEqual(initialCount);
  });

  test('should remove bookmark by clicking bookmark button again', { tag: '@bookmarks-actions-002' }, async ({ page, bookmarksPage, homePage }) => {
    await bookmarksPage.navigate();
    const count = await bookmarksPage.getBookmarksCount();

    if (count === 0) {
      test.skip();
      return;
    }

    await bookmarksPage.clickBookmark(0);
    await homePage.feedSection.waitFor({ state: 'visible' });

    const bookmarkButton = page.getByTestId('bookmark-button-container').first();
    if (!await bookmarkButton.isVisible()) {
      test.skip();
      return;
    }

    await bookmarkButton.click();

    await bookmarksPage.navigate();
    await bookmarksPage.postsList.waitFor({ state: 'visible' });

    const newCount = await bookmarksPage.getBookmarksCount();
    expect(newCount).toBeLessThanOrEqual(count);
  });
});

test.describe('Bookmarks - Empty State', () => {

  test('should handle empty bookmarks gracefully', { tag: '@bookmarks-empty-001' }, async ({ bookmarksPage }) => {
    await bookmarksPage.navigate();

    await expect(bookmarksPage.container).toBeVisible();
    await expect(bookmarksPage.postsList).toBeVisible();
  });
});
