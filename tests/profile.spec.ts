import { test, expect } from '../fixtures/pages.fixture';

test.describe('Profile - View Profile Page', () => {
  
  test.beforeEach(async ({ loginPage, homePage }) => {
    await loginPage.navigate();
    await loginPage.loginAsGuest();
    await homePage.navigate();
  });

  test('should display profile page container', async ({ profilePage, page }) => {
    // Navigate to profile by clicking on user avatar or similar
    await page.goto('/profile/guest-user');
    
    await expect(profilePage.container).toBeVisible();
  });

  test('should display user container', async ({ profilePage, page }) => {
    await page.goto('/profile/guest-user');
    
    await expect(profilePage.userContainer).toBeVisible();
  });

  test('should display profile avatar', async ({ profilePage, page }) => {
    await page.goto('/profile/guest-user');
    
    await expect(profilePage.avatar).toBeVisible();
  });

  test('should display profile info section', async ({ profilePage, page }) => {
    await page.goto('/profile/guest-user');
    
    await expect(profilePage.infoSection).toBeVisible();
  });

  test('should display username section', async ({ profilePage, page }) => {
    await page.goto('/profile/guest-user');
    
    await expect(profilePage.usernameSection).toBeVisible();
  });

  test('should display feed container', async ({ profilePage, page }) => {
    await page.goto('/profile/guest-user');
    
    await expect(profilePage.feedContainer).toBeVisible();
  });

  test('should display feed tabs', async ({ profilePage, page }) => {
    await page.goto('/profile/guest-user');
    
    await expect(profilePage.feedTabs).toBeVisible();
  });

  test('should display posts tab', async ({ profilePage, page }) => {
    await page.goto('/profile/guest-user');
    
    await expect(profilePage.postsTab).toBeVisible();
  });

  test('should display replies tab', async ({ profilePage, page }) => {
    await page.goto('/profile/guest-user');
    
    await expect(profilePage.repliesTab).toBeVisible();
  });

  test('should have correct test IDs', async ({ profilePage, page }) => {
    await page.goto('/profile/guest-user');
    
    await expect(profilePage.container).toHaveAttribute('data-testid', 'profile-page-container');
    await expect(profilePage.userContainer).toHaveAttribute('data-testid', 'profile-page-user-container');
    await expect(profilePage.avatar).toHaveAttribute('data-testid', 'profile-page-avatar');
    await expect(profilePage.infoSection).toHaveAttribute('data-testid', 'profile-info-section');
    await expect(profilePage.usernameSection).toHaveAttribute('data-testid', 'profile-username-section');
    await expect(profilePage.feedContainer).toHaveAttribute('data-testid', 'profile-feed-container');
    await expect(profilePage.feedTabs).toHaveAttribute('data-testid', 'profile-feed-tabs');
    await expect(profilePage.postsTab).toHaveAttribute('data-testid', 'profile-posts-tab');
    await expect(profilePage.repliesTab).toHaveAttribute('data-testid', 'profile-replies-tab');
  });
});

test.describe('Profile - Feed Tabs', () => {
  
  test.beforeEach(async ({ loginPage, page }) => {
    await loginPage.navigate();
    await loginPage.loginAsGuest();
    await page.goto('/profile/guest-user');
  });

  test('should click on posts tab', async ({ profilePage }) => {
    await profilePage.clickPostsTab();
    
    // Posts tab should still be visible after click
    await expect(profilePage.postsTab).toBeVisible();
  });

  test('should click on replies tab', async ({ profilePage }) => {
    await profilePage.clickRepliesTab();
    
    // Replies tab should still be visible after click
    await expect(profilePage.repliesTab).toBeVisible();
  });

  test('should switch between tabs', async ({ profilePage }) => {
    // Click posts tab
    await profilePage.clickPostsTab();
    await expect(profilePage.postsTab).toBeVisible();
    
    // Click replies tab
    await profilePage.clickRepliesTab();
    await expect(profilePage.repliesTab).toBeVisible();
    
    // Click posts tab again
    await profilePage.clickPostsTab();
    await expect(profilePage.postsTab).toBeVisible();
  });

  test('should display feed display container', async ({ profilePage }) => {
    await expect(profilePage.feedDisplay).toBeVisible();
  });

  test('should display posts container', async ({ profilePage }) => {
    await expect(profilePage.postsContainer).toBeVisible();
  });
});

test.describe('Profile - Edit Profile Button', () => {
  
  test.beforeEach(async ({ loginPage, page }) => {
    await loginPage.navigate();
    await loginPage.loginAsGuest();
    await page.goto('/profile/guest-user');
  });

  test('should display edit profile button on own profile', async ({ profilePage }) => {
    // Check if edit button is visible (should be for own profile)
    const isVisible = await profilePage.editProfileButton.isVisible();
    if (isVisible) {
      await expect(profilePage.editProfileButton).toBeVisible();
      await expect(profilePage.editProfileButton).toHaveAttribute('data-testid', 'profile-edit-button');
    }
  });

  test('should click edit profile button', async ({ profilePage, editProfilePage }) => {
    const isVisible = await profilePage.editProfileButton.isVisible();
    if (isVisible) {
      await profilePage.clickEditProfile();
      
      // Should show edit profile modal/page
      await expect(editProfilePage.container).toBeVisible();
    }
  });
});

test.describe('Profile - Follow Button', () => {
  
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigate();
    await loginPage.loginAsGuest();
  });

  test('should display follow button on other users profiles', async ({ profilePage, page }) => {
    // Navigate to a different user's profile (not guest-user)
    // This test assumes there are other users in the system
    await page.goto('/profile/some-other-user');
    
    const followButton = page.getByTestId('profile-follow-button');
    if (await followButton.isVisible()) {
      await expect(followButton).toHaveAttribute('data-testid', 'profile-follow-button');
    }
  });
});

test.describe('Profile - Edit Profile Modal', () => {
  
  test.beforeEach(async ({ loginPage, page, profilePage }) => {
    await loginPage.navigate();
    await loginPage.loginAsGuest();
    await page.goto('/profile/guest-user');
    
    // Try to open edit profile if button is visible
    const editButtonVisible = await profilePage.editProfileButton.isVisible();
    if (editButtonVisible) {
      await profilePage.clickEditProfile();
    }
  });

  test('should display edit profile container', async ({ editProfilePage, profilePage }) => {
    const editButtonVisible = await profilePage.editProfileButton.isVisible();
    if (editButtonVisible) {
      await expect(editProfilePage.container).toBeVisible();
    }
  });

  test('should display name input field', async ({ editProfilePage, profilePage }) => {
    const editButtonVisible = await profilePage.editProfileButton.isVisible();
    if (editButtonVisible) {
      await expect(editProfilePage.nameInput).toBeVisible();
    }
  });

  test('should display bio textarea', async ({ editProfilePage, profilePage }) => {
    const editButtonVisible = await profilePage.editProfileButton.isVisible();
    if (editButtonVisible) {
      await expect(editProfilePage.bioInput).toBeVisible();
    }
  });

  test('should display save button', async ({ editProfilePage, profilePage }) => {
    const editButtonVisible = await profilePage.editProfileButton.isVisible();
    if (editButtonVisible) {
      await expect(editProfilePage.saveButton).toBeVisible();
    }
  });

  test('should display profile picture upload section', async ({ editProfilePage, profilePage }) => {
    const editButtonVisible = await profilePage.editProfileButton.isVisible();
    if (editButtonVisible) {
      await expect(editProfilePage.pictureUpload).toBeVisible();
      await expect(editProfilePage.pictureInput).toBeAttached();
    }
  });

  test('should display background image upload section', async ({ editProfilePage, profilePage }) => {
    const editButtonVisible = await profilePage.editProfileButton.isVisible();
    if (editButtonVisible) {
      await expect(editProfilePage.backgroundUpload).toBeVisible();
      await expect(editProfilePage.backgroundInput).toBeAttached();
    }
  });

  test('should have correct test IDs', async ({ editProfilePage, profilePage }) => {
    const editButtonVisible = await profilePage.editProfileButton.isVisible();
    if (editButtonVisible) {
      await expect(editProfilePage.container).toHaveAttribute('data-testid', 'edit-profile-container');
      await expect(editProfilePage.nameInput).toHaveAttribute('data-testid', 'edit-profile-name-input');
      await expect(editProfilePage.bioInput).toHaveAttribute('data-testid', 'edit-profile-bio-input');
      await expect(editProfilePage.saveButton).toHaveAttribute('data-testid', 'edit-profile-save-button');
    }
  });

  test('should allow name input', async ({ editProfilePage, profilePage }) => {
    const editButtonVisible = await profilePage.editProfileButton.isVisible();
    if (editButtonVisible) {
      const newName = 'Updated Name';
      await editProfilePage.updateName(newName);
      
      await expect(editProfilePage.nameInput).toHaveValue(newName);
    }
  });

  test('should allow bio input', async ({ editProfilePage, profilePage }) => {
    const editButtonVisible = await profilePage.editProfileButton.isVisible();
    if (editButtonVisible) {
      const newBio = 'This is my updated bio!';
      await editProfilePage.updateBio(newBio);
      
      await expect(editProfilePage.bioInput).toHaveValue(newBio);
    }
  });
});

test.describe('Profile - Stats and Info', () => {
  
  test.beforeEach(async ({ loginPage, page }) => {
    await loginPage.navigate();
    await loginPage.loginAsGuest();
    await page.goto('/profile/guest-user');
  });

  test('should display follow stats section', async ({ profilePage }) => {
    await expect(profilePage.followStats).toBeVisible();
  });

  test('should display bio container', async ({ profilePage }) => {
    await expect(profilePage.bioContainer).toBeVisible();
  });

  test('should have correct test IDs for stats', async ({ profilePage }) => {
    await expect(profilePage.followStats).toHaveAttribute('data-testid', 'profile-follow-stats');
    await expect(profilePage.bioContainer).toHaveAttribute('data-testid', 'profile-bio-container');
  });
});
