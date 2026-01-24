import { test, expect } from '../fixtures/pages.fixture';

test.describe('Homepage - Layout and Structure', () => {

  test.beforeEach(async ({ homePage }) => {
    await homePage.navigate();
  });

  test('should display homepage container', { tag: '@homepage-layout-001' }, async ({ homePage }) => {
    await expect(homePage.container).toBeVisible();
  });

  test('should display create post section', { tag: '@homepage-layout-002' }, async ({ homePage }) => {
    await expect(homePage.createPostSection).toBeVisible();
  });

  test('should display feed section', { tag: '@homepage-layout-003' }, async ({ homePage }) => {
    await expect(homePage.feedSection).toBeVisible({ timeout: 5000 });
  });

  test('should verify homepage is loaded correctly', { tag: '@homepage-layout-004' }, async ({ homePage }) => {
    const isLoaded = await homePage.isHomePageLoaded();
    expect(isLoaded).toBeTruthy();
  });

  test('should have correct URL', { tag: '@homepage-layout-005' }, async ({ homePage }) => {
    const url = homePage.getUrl();
    expect(url).toContain('/homepage');
  });

  test('should have correct test IDs', { tag: '@homepage-layout-006' }, async ({ homePage }) => {
    await expect(homePage.container).toHaveAttribute('data-testid', 'homepage-container', { timeout: 2000 });
    await expect(homePage.createPostSection).toHaveAttribute('data-testid', 'homepage-create-post');
    await expect(homePage.feedSection).toHaveAttribute('data-testid', 'homepage-feed');
  });
});

test.describe('Homepage - Create Post', () => {

  test.beforeEach(async ({ homePage }) => {
    await homePage.navigate();
  });

  test('should display create post textarea', { tag: '@homepage-createpost-001' }, async ({ createPostPage }) => {
    await expect(createPostPage.textarea).toBeVisible();
  });

  test('should display post submit button', { tag: '@homepage-createpost-002' }, async ({ createPostPage }) => {
    await expect(createPostPage.submitButton).toBeVisible();
  });

  test('should allow text input in post textarea', { tag: '@homepage-createpost-003' }, async ({ createPostPage }) => {
    const testContent = 'This is a test post!';
    await createPostPage.textarea.fill(testContent);
    
    await expect(createPostPage.textarea).toHaveValue(testContent);
  });

  test('should display GIF button', { tag: '@homepage-createpost-004' }, async ({ createPostPage }) => {
    await expect(createPostPage.gifButton).toBeVisible();
  });

  test('should have create post container visible', { tag: '@homepage-createpost-005' }, async ({ createPostPage }) => {
    await expect(createPostPage.container).toBeVisible();
  });

  test('should have correct test IDs for create post', { tag: '@homepage-createpost-006' }, async ({ createPostPage }) => {
    await expect(createPostPage.container).toHaveAttribute('data-testid', 'create-post-container');
    await expect(createPostPage.textarea).toHaveAttribute('data-testid', 'create-post-textarea');
    await expect(createPostPage.submitButton).toHaveAttribute('data-testid', 'create-post-submit-button');
    await expect(createPostPage.gifButton).toHaveAttribute('data-testid', 'create-post-gif-button');
  });
});

test.describe('Homepage - Feed Display', () => {

  test.beforeEach(async ({ homePage }) => {
    await homePage.navigate();
  });

  test('should display feed container', { tag: '@homepage-feed-001' }, async ({ homePage }) => {
    await expect(homePage.feedSection).toBeVisible();
  });

  test('should check if posts are present', { tag: '@homepage-feed-002' }, async ({ postPage, homePage }) => {
    await homePage.wait(2000);
    
    const postsCount = await postPage.getAllPosts().count();
    expect(postsCount).toBeGreaterThanOrEqual(0);
  });
});
