import { test, expect } from '../fixtures/pages.fixture';

test.describe('Post - Display', () => {

  test.beforeEach(async ({ homePage }) => {
    await homePage.navigate();
    await homePage.waitForPostsToLoad();
  });

  test('should display posts with user information and content', { tag: '@post-display-001' }, async ({ postPage }) => {
    const postsCount = await postPage.getAllPosts().count();
    if (postsCount === 0) {
      test.skip();
      return;
    }

    const firstPost = postPage.getPostByIndex(0);
    const userContainer = firstPost.getByTestId('post-user-container');
    const userAvatar = firstPost.getByTestId('post-user-avatar');
    const username = firstPost.getByTestId('post-username');
    const content = firstPost.getByTestId('post-content');

    await expect(userContainer).toBeVisible();
    await expect(userAvatar).toBeVisible();
    await expect(username).toBeVisible();
    await expect(content).toBeVisible();
  });

  test('should display post action buttons', { tag: '@post-display-002' }, async ({ postPage, page }) => {
    const postsCount = await postPage.getAllPosts().count();
    if (postsCount === 0) {
      test.skip();
      return;
    }

    const firstPost = postPage.getPostByIndex(0);
    const actionsContainer = firstPost.getByTestId('post-actions-container');
    const actions = firstPost.getByTestId('post-actions');

    await expect(actionsContainer).toBeVisible();
    await expect(actions).toBeVisible();

    await expect(page.getByTestId('like-button').first()).toBeVisible();
    await expect(page.getByTestId('comment-button').first()).toBeVisible();
    await expect(page.getByTestId('bookmark-button-container').first()).toBeVisible();
    await expect(page.getByTestId('repost-button-container').first()).toBeVisible();
  });
});

test.describe('Post - Actions', () => {

  test.beforeEach(async ({ homePage }) => {
    await homePage.navigate();
    await homePage.waitForPostsToLoad();
  });

  test('should allow clicking like button', { tag: '@post-actions-001' }, async ({ postPage, page }) => {
    const postsCount = await postPage.getAllPosts().count();
    if (postsCount === 0) {
      test.skip();
      return;
    }

    const likeButton = page.getByTestId('like-button').first();
    await likeButton.click();

    await expect(likeButton).toBeVisible();
  });

  test('should allow clicking bookmark button', { tag: '@post-actions-002' }, async ({ postPage, page }) => {
    const postsCount = await postPage.getAllPosts().count();
    if (postsCount === 0) {
      test.skip();
      return;
    }

    const bookmarkButton = page.getByTestId('bookmark-button-container').first();
    await bookmarkButton.click();

    await expect(bookmarkButton).toBeVisible();
  });
});

test.describe('Post - Creation', () => {

  test.beforeEach(async ({ homePage }) => {
    await homePage.navigate();
  });

  test('should create a new post with text content', { tag: '@post-creation-001' }, async ({ createPostPage, homePage, page }) => {
    const testPostContent = `test-${Date.now()}`;
    const initialPostCount = await homePage.getPostsCount();

    await createPostPage.textarea.fill(testPostContent);
    await expect(createPostPage.textarea).toHaveValue(testPostContent);

    await createPostPage.submitButton.click();

    await expect(async () => {
      const newCount = await homePage.getPostsCount();
      expect(newCount).toBeGreaterThan(initialPostCount);
    }).toPass({ timeout: 10000 });
  });

  test('should clear textarea after clearing', { tag: '@post-creation-002' }, async ({ createPostPage }) => {
    const testContent = 'Test content';

    await createPostPage.textarea.fill(testContent);
    await expect(createPostPage.textarea).toHaveValue(testContent);

    await createPostPage.clearText();
    await expect(createPostPage.textarea).toHaveValue('');
  });
});

test.describe('Post - Comments', () => {

  test.beforeEach(async ({ homePage }) => {
    await homePage.navigate();
    await homePage.waitForPostsToLoad();
  });

  test('should open comment modal when clicking comment button', { tag: '@post-comments-001' }, async ({ page }) => {
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
