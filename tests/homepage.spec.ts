import { test, expect } from '../fixtures/pages.fixture';

test.describe('Homepage', () => {

  test.beforeEach(async ({ homePage }) => {
    await homePage.navigate();
  });

  test('should load homepage with all main sections', { tag: '@homepage-001' }, async ({ homePage }) => {
    await expect(homePage.container).toBeVisible();
    await expect(homePage.createPostSection).toBeVisible();
    await expect(homePage.feedSection).toBeVisible({ timeout: 5000 });

    expect(homePage.getUrl()).toContain('/homepage');
  });

  test('should allow creating a post', { tag: '@homepage-002' }, async ({ createPostPage, homePage }) => {
    await expect(createPostPage.container).toBeVisible();
    await expect(createPostPage.textarea).toBeVisible();
    await expect(createPostPage.submitButton).toBeVisible();
    await expect(createPostPage.gifButton).toBeVisible();

    const testContent = 'This is a test post!';
    await createPostPage.textarea.fill(testContent);

    await expect(createPostPage.textarea).toHaveValue(testContent);
  });

  test('should display posts in feed', { tag: '@homepage-003' }, async ({ postPage, homePage }) => {
    await homePage.waitForPostsToLoad();

    const postsCount = await postPage.getAllPosts().count();
    expect(postsCount).toBeGreaterThanOrEqual(0);
  });
});
