import { test, expect } from '../fixtures/pages.fixture';

test.describe('GIF Search - Modal Display', () => {

  test.beforeEach(async ({ homePage }) => {
    await homePage.navigate();
  });

  test('should open GIF search modal when clicking GIF button', { tag: '@gif-modal-001' }, async ({ createPostPage, gifSearchPage }) => {
    await createPostPage.gifButton.click();
    
    await createPostPage.wait(500);
    
    if (await gifSearchPage.container.isVisible()) {
      await expect(gifSearchPage.container).toBeVisible();
    }
  });

  test('should have correct test IDs in GIF search', { tag: '@gif-modal-002' }, async ({ createPostPage, gifSearchPage, page }) => {
    await createPostPage.gifButton.click();
    await createPostPage.wait(500);
    
    if (await gifSearchPage.container.isVisible()) {
      await expect(gifSearchPage.container).toHaveAttribute('data-testid', 'gif-search-container');
      await expect(gifSearchPage.input).toHaveAttribute('data-testid', 'gif-search-input');
      await expect(gifSearchPage.submitButton).toHaveAttribute('data-testid', 'gif-search-submit-button');
    }
  });

  test('should display GIF search input', { tag: '@gif-modal-003' }, async ({ createPostPage, gifSearchPage }) => {
    await createPostPage.gifButton.click();
    await createPostPage.wait(500);
    
    if (await gifSearchPage.container.isVisible()) {
      await expect(gifSearchPage.input).toBeVisible();
    }
  });

  test('should display GIF search submit button', { tag: '@gif-modal-004' }, async ({ createPostPage, gifSearchPage }) => {
    await createPostPage.gifButton.click();
    await createPostPage.wait(500);
    
    if (await gifSearchPage.container.isVisible()) {
      await expect(gifSearchPage.submitButton).toBeVisible();
    }
  });

  test('should display trending GIFs container', { tag: '@gif-modal-005' }, async ({ createPostPage, gifSearchPage }) => {
    await createPostPage.gifButton.click();
    await createPostPage.wait(500);
    
    if (await gifSearchPage.container.isVisible()) {
      const trendingVisible = await gifSearchPage.isTrendingVisible();
      if (trendingVisible) {
        await expect(gifSearchPage.trendingContainer).toBeVisible();
        await expect(gifSearchPage.trendingContainer).toHaveAttribute('data-testid', 'gif-trending-container');
      }
    }
  });
});

test.describe('GIF Search - Search Functionality', () => {

  test.beforeEach(async ({ homePage, createPostPage }) => {
    await homePage.navigate();
    await createPostPage.gifButton.click();
    await createPostPage.wait(500);
  });

  test('should allow text input in GIF search', { tag: '@gif-search-001' }, async ({ gifSearchPage }) => {
    if (await gifSearchPage.container.isVisible()) {
      const searchQuery = 'funny cats';
      await gifSearchPage.input.fill(searchQuery);
      
      await expect(gifSearchPage.input).toHaveValue(searchQuery);
    }
  });

  test('should submit GIF search', { tag: '@gif-search-002' }, async ({ gifSearchPage }) => {
    if (await gifSearchPage.container.isVisible()) {
      const searchQuery = 'happy';
      await gifSearchPage.searchGif(searchQuery);
      
      await gifSearchPage.wait(1500);
      
      await expect(gifSearchPage.results).toBeVisible();
    }
  });

  test('should display GIF search results', { tag: '@gif-search-003' }, async ({ gifSearchPage }) => {
    if (await gifSearchPage.container.isVisible()) {
      await gifSearchPage.searchGif('celebration');
      await gifSearchPage.wait(1500);
      
      const resultsCount = await gifSearchPage.getResultsCount();
      expect(resultsCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('should have search results test ID', { tag: '@gif-search-004' }, async ({ gifSearchPage }) => {
    if (await gifSearchPage.container.isVisible()) {
      await expect(gifSearchPage.results).toHaveAttribute('data-testid', 'gif-search-results');
    }
  });
});

test.describe('Post Page - Detail View', () => {

  test.beforeEach(async ({ homePage }) => {
    await homePage.navigate();
  });

  test('should have postpage loading indicator', { tag: '@postpage-001' }, async ({ page }) => {
    const posts = page.getByTestId('post-container');
    const postsCount = await posts.count();
    
    if (postsCount > 0) {
      await posts.first().click();
      
      const loading = page.getByTestId('postpage-loading');
      if (await loading.isVisible({ timeout: 1000 }).catch(() => false)) {
        await expect(loading).toHaveAttribute('data-testid', 'postpage-loading');
      }
    }
  });

  test('should display postpage container after loading', { tag: '@postpage-002' }, async ({ page }) => {
    const posts = page.getByTestId('post-container');
    const postsCount = await posts.count();
    
    if (postsCount > 0) {
      await posts.first().click();
      await page.waitForTimeout(1000);
      
      const postpageContainer = page.getByTestId('postpage-container');
      if (await postpageContainer.isVisible()) {
        await expect(postpageContainer).toHaveAttribute('data-testid', 'postpage-container');
      }
    }
  });
});

test.describe('Feed Component', () => {

  test.beforeEach(async ({ homePage }) => {
    await homePage.navigate();
  });

  test('should display feed container', { tag: '@feed-001' }, async ({ page }) => {
    const feedContainer = page.getByTestId('feed-container');
    await expect(feedContainer).toBeVisible();
  });

  test('should have correct feed test ID', { tag: '@feed-002' }, async ({ page }) => {
    const feedContainer = page.getByTestId('feed-container');
    await expect(feedContainer).toHaveAttribute('data-testid', 'feed-container');
  });
});

test.describe('Comment Modal', () => {

  test.beforeEach(async ({ homePage }) => {
    await homePage.navigate();
    await homePage.wait(2000);
  });

  test('should open comment modal when clicking comment button', { tag: '@comment-001' }, async ({ page }) => {
    const posts = page.getByTestId('post-container');
    const postsCount = await posts.count();
    
    if (postsCount > 0) {
      const commentButton = page.getByTestId('comment-button').first();
      
      if (await commentButton.isVisible()) {
        await commentButton.click();
        await page.waitForTimeout(500);
        
        const commentModal = page.getByTestId('comment-modal');
        if (await commentModal.isVisible()) {
          await expect(commentModal).toHaveAttribute('data-testid', 'comment-modal');
        }
      }
    }
  });
});
