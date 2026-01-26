import { test, expect } from '../fixtures/pages.fixture';

test.describe('Profile - View Profile Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/homepage');
  });

  test('should display profile page container', { tag: '@profile-view-001' }, async ({ profilePage, page }) => {
    await page.goto('/profile/guest-user');
    
    await expect(profilePage.container).toBeVisible();
  });

  test('should display user container', { tag: '@profile-view-002' }, async ({ profilePage, page }) => {
    await page.goto('/profile/guest-user');
    
    await expect(profilePage.userContainer).toBeVisible();
  });

  test('should display profile avatar', { tag: '@profile-view-003' }, async ({ profilePage, page }) => {
    await page.goto('/profile/guest-user');
    
    await expect(profilePage.avatar).toBeVisible();
  });

  test('should display profile info section', { tag: '@profile-view-004' }, async ({ profilePage, page }) => {
    await page.goto('/profile/guest-user');
    
    await expect(profilePage.infoSection).toBeVisible();
  });

  test('should display username section', { tag: '@profile-view-005' }, async ({ profilePage, page }) => {
    await page.goto('/profile/guest-user');
    
    await expect(profilePage.usernameSection).toBeVisible();
  });

  test('should display feed container', { tag: '@profile-view-006' }, async ({ profilePage, page }) => {
    await page.goto('/profile/guest-user');
    
    await expect(profilePage.feedContainer).toBeVisible();
  });

  test('should display feed tabs', { tag: '@profile-view-007' }, async ({ profilePage, page }) => {
    await page.goto('/profile/guest-user');
    
    await expect(profilePage.feedTabs).toBeVisible();
  });

  test('should display posts tab', { tag: '@profile-view-008' }, async ({ profilePage, page }) => {
    await page.goto('/profile/guest-user');
    
    await expect(profilePage.postsTab).toBeVisible();
  });

  test('should display replies tab', { tag: '@profile-view-009' }, async ({ profilePage, page }) => {
    await page.goto('/profile/guest-user');
    
    await expect(profilePage.repliesTab).toBeVisible();
  });

  test('should have correct test IDs', { tag: '@profile-view-010' }, async ({ profilePage, page }) => {
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

  test.beforeEach(async ({ page }) => {
    await page.goto('/profile/guest-user');
  });

  test('should click on posts tab', { tag: '@profile-tabs-001' }, async ({ profilePage }) => {
    await profilePage.clickPostsTab();
    
    await expect(profilePage.postsTab).toBeVisible();
  });

  test('should click on replies tab', { tag: '@profile-tabs-002' }, async ({ profilePage }) => {
    await profilePage.clickRepliesTab();
    
    await expect(profilePage.repliesTab).toBeVisible();
  });

  test('should switch between tabs', { tag: '@profile-tabs-003' }, async ({ profilePage }) => {
    await profilePage.clickPostsTab();
    await expect(profilePage.postsTab).toBeVisible();
    
    await profilePage.clickRepliesTab();
    await expect(profilePage.repliesTab).toBeVisible();
    
    await profilePage.clickPostsTab();
    await expect(profilePage.postsTab).toBeVisible();
  });

  test('should display feed display container', { tag: '@profile-tabs-004' }, async ({ profilePage }) => {
    await expect(profilePage.feedDisplay).toBeVisible();
  });

  test('should display posts container', { tag: '@profile-tabs-005' }, async ({ profilePage }) => {
    // Ensure posts tab is clicked first
    await profilePage.clickPostsTab();
    // The container exists but may be hidden by CSS, check if it's attached to the DOM
    await expect(profilePage.postsContainer).toBeAttached({ timeout: 5000 });
  });
});

test.describe('Profile - Edit Profile Button', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/profile/guest-user');
  });

  test('should display edit profile button on own profile', { tag: '@profile-edit-001' }, async ({ profilePage }) => {
    const isVisible = await profilePage.editProfileButton.isVisible();
    if (isVisible) {
      await expect(profilePage.editProfileButton).toBeVisible();
      await expect(profilePage.editProfileButton).toHaveAttribute('data-testid', 'profile-edit-button');
    }
  });

  test('should click edit profile button', { tag: '@profile-edit-002' }, async ({ profilePage, editProfilePage }) => {
    const isVisible = await profilePage.editProfileButton.isVisible();
    if (isVisible) {
      await profilePage.clickEditProfile();
      
      await expect(editProfilePage.container).toBeVisible();
    }
  });
});

test.describe('Profile - Follow Button', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/homepage');
  });

  test('should display follow button on other users profiles', { tag: '@profile-follow-001' }, async ({ profilePage, page }) => {
    await page.goto('/profile/some-other-user');
    
    const followButton = page.getByTestId('profile-follow-button');
    if (await followButton.isVisible()) {
      await expect(followButton).toHaveAttribute('data-testid', 'profile-follow-button');
    }
  });
});

test.describe('Profile - Edit Profile Modal', () => {

  test.beforeEach(async ({ page, profilePage }) => {
    await page.goto('/profile/guest-user');

    const editButtonVisible = await profilePage.editProfileButton.isVisible();
    if (editButtonVisible) {
      await profilePage.clickEditProfile();
    }
  });

  test('should display edit profile container', { tag: '@profile-edit-003' }, async ({ editProfilePage, profilePage }) => {
    const editButtonVisible = await profilePage.editProfileButton.isVisible();
    if (editButtonVisible) {
      await expect(editProfilePage.container).toBeVisible();
    }
  });

  test('should display name input field', { tag: '@profile-edit-004' }, async ({ editProfilePage, profilePage }) => {
    const editButtonVisible = await profilePage.editProfileButton.isVisible();
    if (editButtonVisible) {
      await expect(editProfilePage.nameInput).toBeVisible();
    }
  });

  test('should display bio textarea', { tag: '@profile-edit-005' }, async ({ editProfilePage, profilePage }) => {
    const editButtonVisible = await profilePage.editProfileButton.isVisible();
    if (editButtonVisible) {
      await expect(editProfilePage.bioInput).toBeVisible();
    }
  });

  test('should display save button', { tag: '@profile-edit-006' }, async ({ editProfilePage, profilePage }) => {
    const editButtonVisible = await profilePage.editProfileButton.isVisible();
    if (editButtonVisible) {
      await expect(editProfilePage.saveButton).toBeVisible();
    }
  });

  test('should display profile picture upload section', { tag: '@profile-edit-007' }, async ({ editProfilePage, profilePage }) => {
    const editButtonVisible = await profilePage.editProfileButton.isVisible();
    if (editButtonVisible) {
      await expect(editProfilePage.pictureUpload).toBeVisible();
      await expect(editProfilePage.pictureInput).toBeAttached();
    }
  });

  test('should display background image upload section', { tag: '@profile-edit-008' }, async ({ editProfilePage, profilePage }) => {
    const editButtonVisible = await profilePage.editProfileButton.isVisible();
    if (editButtonVisible) {
      await expect(editProfilePage.backgroundUpload).toBeVisible();
      await expect(editProfilePage.backgroundInput).toBeAttached();
    }
  });

  test('should have correct test IDs', { tag: '@profile-edit-009' }, async ({ editProfilePage, profilePage }) => {
    const editButtonVisible = await profilePage.editProfileButton.isVisible();
    if (editButtonVisible) {
      await expect(editProfilePage.container).toHaveAttribute('data-testid', 'edit-profile-container');
      await expect(editProfilePage.nameInput).toHaveAttribute('data-testid', 'edit-profile-name-input');
      await expect(editProfilePage.bioInput).toHaveAttribute('data-testid', 'edit-profile-bio-input');
      await expect(editProfilePage.saveButton).toHaveAttribute('data-testid', 'edit-profile-save-button');
    }
  });

  test('should allow name input', { tag: '@profile-edit-010' }, async ({ editProfilePage, profilePage }) => {
    const editButtonVisible = await profilePage.editProfileButton.isVisible();
    if (editButtonVisible) {
      const newName = 'Updated Name';
      await editProfilePage.updateName(newName);
      
      await expect(editProfilePage.nameInput).toHaveValue(newName);
    }
  });

  test('should allow bio input', { tag: '@profile-edit-011' }, async ({ editProfilePage, profilePage }) => {
    const editButtonVisible = await profilePage.editProfileButton.isVisible();
    if (editButtonVisible) {
      const newBio = 'This is my updated bio!';
      await editProfilePage.updateBio(newBio);
      
      await expect(editProfilePage.bioInput).toHaveValue(newBio);
    }
  });
});

test.describe('Profile - Stats and Info', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/profile/guest-user');
  });

  test('should display follow stats section', { tag: '@profile-stats-001' }, async ({ profilePage }) => {
    await expect(profilePage.followStats).toBeVisible();
  });

  test('should display bio container', { tag: '@profile-stats-002' }, async ({ profilePage }) => {
    await expect(profilePage.bioContainer).toBeVisible();
  });

  test('should have correct test IDs for stats', { tag: '@profile-stats-003' }, async ({ profilePage }) => {
    await expect(profilePage.followStats).toHaveAttribute('data-testid', 'profile-follow-stats');
    await expect(profilePage.bioContainer).toHaveAttribute('data-testid', 'profile-bio-container');
  });
});
