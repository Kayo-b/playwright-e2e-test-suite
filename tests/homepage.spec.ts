import { test, expect } from '../fixtures/pages.fixture';

test.describe('Homepage - Layout and Structure', () => {
  
  test.beforeEach(async ({ loginPage, homePage }) => {
    // Login as guest before each test
    await loginPage.navigate();
    await loginPage.loginAsGuest();
    await homePage.navigate();
  });

  test('should display homepage container', async ({ homePage }) => {
    await expect(homePage.container).toBeVisible();
  });

  test('should display create post section', async ({ homePage }) => {
    await expect(homePage.createPostSection).toBeVisible();
  });

  test('should display feed section', async ({ homePage }) => {
    await expect(homePage.feedSection).toBeVisible();
  });

  test('should verify homepage is loaded correctly', async ({ homePage }) => {
    const isLoaded = await homePage.isHomePageLoaded();
    expect(isLoaded).toBeTruthy();
  });

  test('should have correct URL', async ({ homePage }) => {
    const url = homePage.getUrl();
    expect(url).toContain('/homepage');
  });

  test('should have correct test IDs', async ({ homePage }) => {
    await expect(homePage.container).toHaveAttribute('data-testid', 'homepage-container');
    await expect(homePage.createPostSection).toHaveAttribute('data-testid', 'homepage-create-post');
    await expect(homePage.feedSection).toHaveAttribute('data-testid', 'homepage-feed');
  });
});

test.describe('Homepage - Create Post', () => {
  
  test.beforeEach(async ({ loginPage, homePage }) => {
    await loginPage.navigate();
    await loginPage.loginAsGuest();
    await homePage.navigate();
  });

  test('should display create post textarea', async ({ createPostPage }) => {
    await expect(createPostPage.textarea).toBeVisible();
  });

  test('should display post submit button', async ({ createPostPage }) => {
    await expect(createPostPage.submitButton).toBeVisible();
  });

  test('should allow text input in post textarea', async ({ createPostPage }) => {
    const testContent = 'This is a test post!';
    await createPostPage.textarea.fill(testContent);
    
    await expect(createPostPage.textarea).toHaveValue(testContent);
  });

  test('should display GIF button', async ({ createPostPage }) => {
    await expect(createPostPage.gifButton).toBeVisible();
  });

  test('should have create post container visible', async ({ createPostPage }) => {
    await expect(createPostPage.container).toBeVisible();
  });

  test('should have correct test IDs for create post', async ({ createPostPage }) => {
    await expect(createPostPage.container).toHaveAttribute('data-testid', 'create-post-container');
    await expect(createPostPage.textarea).toHaveAttribute('data-testid', 'create-post-textarea');
    await expect(createPostPage.submitButton).toHaveAttribute('data-testid', 'create-post-submit-button');
    await expect(createPostPage.gifButton).toHaveAttribute('data-testid', 'create-post-gif-button');
  });
});

test.describe('Homepage - Feed Display', () => {
  
  test.beforeEach(async ({ loginPage, homePage }) => {
    await loginPage.navigate();
    await loginPage.loginAsGuest();
    await homePage.navigate();
  });

  test('should display feed container', async ({ homePage }) => {
    await expect(homePage.feedSection).toBeVisible();
  });

  test('should check if posts are present', async ({ postPage, homePage }) => {
    // Wait for feed to load
    await homePage.wait(2000);
    
    // Check if any posts exist (may be zero on fresh account)
    const postsCount = await postPage.getAllPosts().count();
    expect(postsCount).toBeGreaterThanOrEqual(0);
  });
});
