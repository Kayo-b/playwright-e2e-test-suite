import { test, expect } from '../fixtures/pages.fixture';

test.describe('GIF Search', () => {

  test.beforeEach(async ({ homePage }) => {
    await homePage.navigate();
  });

  test('should open GIF search modal and display elements', { tag: '@gif-001' }, async ({ createPostPage, gifSearchPage }) => {
    await createPostPage.gifButton.click();

    await expect(gifSearchPage.container).toBeVisible({ timeout: 5000 });
    await expect(gifSearchPage.input).toBeVisible();
    await expect(gifSearchPage.submitButton).toBeVisible();
  });

  test('should search for GIFs and display results', { tag: '@gif-002' }, async ({ createPostPage, gifSearchPage }) => {
    await createPostPage.gifButton.click();
    await expect(gifSearchPage.container).toBeVisible({ timeout: 5000 });

    const searchQuery = 'happy';
    await gifSearchPage.searchGif(searchQuery);

    await expect(gifSearchPage.results).toBeAttached({ timeout: 10000 });
  });

  test('should display trending GIFs container if available', { tag: '@gif-003' }, async ({ createPostPage, gifSearchPage }) => {
    await createPostPage.gifButton.click();
    await expect(gifSearchPage.container).toBeVisible({ timeout: 5000 });

    const trendingVisible = await gifSearchPage.isTrendingVisible();
    if (trendingVisible) {
      await expect(gifSearchPage.trendingContainer).toBeVisible();
    }
  });
});

test.describe('Post Page - Detail View', () => {

  test.beforeEach(async ({ homePage }) => {
    await homePage.navigate();
    await homePage.waitForPostsToLoad();
  });

  test('should navigate to post detail page when clicking a post', { tag: '@postpage-001' }, async ({ page }) => {
    const posts = page.getByTestId('post-container');
    const postsCount = await posts.count();

    if (postsCount === 0) {
      test.skip();
      return;
    }

    await posts.first().click();

    const postpageContainer = page.getByTestId('postpage-container');
    await expect(postpageContainer).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Feed Component', () => {

  test('should display feed container', { tag: '@feed-001' }, async ({ page, homePage }) => {
    await homePage.navigate();
    await homePage.waitForPostsToLoad();

    const feedContainer = page.getByTestId('feed-container');
    await expect(feedContainer).toBeAttached();
  });
});

test.describe('Comment Modal', () => {

  test.beforeEach(async ({ homePage }) => {
    await homePage.navigate();
    await homePage.waitForPostsToLoad();
  });

  test('should open comment modal when clicking comment button', { tag: '@comment-001' }, async ({ page }) => {
    const posts = page.getByTestId('post-container');
    const postsCount = await posts.count();

    if (postsCount === 0) {
      test.skip();
      return;
    }

    const commentButton = page.getByTestId('comment-button').first();
    if (!await commentButton.isVisible()) {
      test.skip();
      return;
    }

    await commentButton.click();

    const commentModal = page.getByTestId('comment-modal');
    await expect(commentModal).toBeVisible({ timeout: 5000 });
  });
});
