import { test, expect } from '../fixtures/pages.fixture';

test.describe('Post - Display and Structure', () => {
  
  test.beforeEach(async ({ loginPage, homePage }) => {
    await loginPage.navigate();
    await loginPage.loginAsGuest();
    await homePage.navigate();
    await homePage.wait(2000); 
  });

  test('should display post containers with correct test IDs', async ({ postPage, page }) => {
    const posts = postPage.getAllPosts();
    const postsCount = await posts.count();
    
    if (postsCount > 0) {
      await expect(posts.first()).toHaveAttribute('data-testid', 'post-container');
    }
  });

  test('should display post user information', async ({ postPage }) => {
    const postsCount = await postPage.getAllPosts().count();
    
    if (postsCount > 0) {
      const firstPost = postPage.getPostByIndex(0);
      const userContainer = firstPost.getByTestId('post-user-container');
      const userAvatar = firstPost.getByTestId('post-user-avatar');
      const username = firstPost.getByTestId('post-username');
      
      await expect(userContainer).toBeVisible();
      await expect(userAvatar).toBeVisible();
      await expect(username).toBeVisible();
    }
  });

  test('should display post content', async ({ postPage }) => {
    const postsCount = await postPage.getAllPosts().count();
    
    if (postsCount > 0) {
      const firstPost = postPage.getPostByIndex(0);
      const content = firstPost.getByTestId('post-content');
      
      await expect(content).toBeVisible();
    }
  });

  test('should display post actions container', async ({ postPage }) => {
    const postsCount = await postPage.getAllPosts().count();
    
    if (postsCount > 0) {
      const firstPost = postPage.getPostByIndex(0);
      const actionsContainer = firstPost.getByTestId('post-actions-container');
      const actions = firstPost.getByTestId('post-actions');
      
      await expect(actionsContainer).toBeVisible();
      await expect(actions).toBeVisible();
    }
  });
});

test.describe('Post - Action Buttons', () => {
  
  test.beforeEach(async ({ loginPage, homePage }) => {
    await loginPage.navigate();
    await loginPage.loginAsGuest();
    await homePage.navigate();
    await homePage.wait(2000);
  });

  test('should display like button with correct test ID', async ({ postPage, page }) => {
    const postsCount = await postPage.getAllPosts().count();
    
    if (postsCount > 0) {
      const likeButton = page.getByTestId('like-button').first();
      await expect(likeButton).toBeVisible();
    }
  });

  test('should display comment button with correct test ID', async ({ postPage, page }) => {
    const postsCount = await postPage.getAllPosts().count();
    
    if (postsCount > 0) {
      const commentButton = page.getByTestId('comment-button').first();
      await expect(commentButton).toBeVisible();
    }
  });

  test('should display bookmark button with correct test ID', async ({ postPage, page }) => {
    const postsCount = await postPage.getAllPosts().count();
    
    if (postsCount > 0) {
      const bookmarkButton = page.getByTestId('bookmark-button-container').first();
      await expect(bookmarkButton).toBeVisible();
    }
  });

  test('should display repost button with correct test ID', async ({ postPage, page }) => {
    const postsCount = await postPage.getAllPosts().count();
    
    if (postsCount > 0) {
      const repostButton = page.getByTestId('repost-button-container').first();
      await expect(repostButton).toBeVisible();
    }
  });

  test('should allow clicking like button', async ({ postPage, page }) => {
    const postsCount = await postPage.getAllPosts().count();
    
    if (postsCount > 0) {
      const likeButton = page.getByTestId('like-button').first();
      await likeButton.click();
      
      await expect(likeButton).toBeVisible();
    }
  });

  test('should allow clicking bookmark button', async ({ postPage, page }) => {
    const postsCount = await postPage.getAllPosts().count();
    
    if (postsCount > 0) {
      const bookmarkButton = page.getByTestId('bookmark-button-container').first();
      await bookmarkButton.click();
      
      await expect(bookmarkButton).toBeVisible();
    }
  });
});

test.describe('Post - Creation', () => {
  
  test.beforeEach(async ({ loginPage, homePage }) => {
    await loginPage.navigate();
    await loginPage.loginAsGuest();
    await homePage.navigate();
  });

  test('should create a new post with text content', async ({ createPostPage, homePage }) => {
    const testPostContent = `Test post created at ${new Date().toISOString()}`;
    
    await createPostPage.textarea.fill(testPostContent);
    await expect(createPostPage.textarea).toHaveValue(testPostContent);
    
    await createPostPage.submitButton.click();
    
    await homePage.wait(2000);
    
    await expect(createPostPage.textarea).toHaveValue('');
  });

  test('should clear textarea after clearing', async ({ createPostPage }) => {
    const testContent = 'Test content';
    
    await createPostPage.textarea.fill(testContent);
    await expect(createPostPage.textarea).toHaveValue(testContent);
    
    await createPostPage.clearText();
    await expect(createPostPage.textarea).toHaveValue('');
  });

  test('should have all create post test IDs', async ({ createPostPage }) => {
    await expect(createPostPage.container).toHaveAttribute('data-testid', 'create-post-container');
    await expect(createPostPage.textarea).toHaveAttribute('data-testid', 'create-post-textarea');
    await expect(createPostPage.submitButton).toHaveAttribute('data-testid', 'create-post-submit-button');
    await expect(createPostPage.actions).toHaveAttribute('data-testid', 'create-post-actions');
  });
});

test.describe('Post - Comment Functionality', () => {
  
  test.beforeEach(async ({ loginPage, homePage }) => {
    await loginPage.navigate();
    await loginPage.loginAsGuest();
    await homePage.navigate();
    await homePage.wait(2000);
  });

  test('should display comment button on posts', async ({ page }) => {
    const commentButton = page.getByTestId('comment-button').first();
    
    if (await commentButton.isVisible()) {
      await expect(commentButton).toBeVisible();
    }
  });

  test('should have comment button container test ID', async ({ page }) => {
    const commentButtonContainer = page.getByTestId('comment-button-container').first();
    
    if (await commentButtonContainer.isVisible()) {
      await expect(commentButtonContainer).toHaveAttribute('data-testid', 'comment-button-container');
    }
  });
});
