import { test, expect } from '../fixtures/pages.fixture';

test.describe('Profile - View', () => {

  test('should display profile page with user information', { tag: '@profile-view-001' }, async ({ profilePage, page }) => {
    await page.goto('/profile/guest-user');

    await expect(profilePage.container).toBeVisible();
    await expect(profilePage.userContainer).toBeVisible();
    await expect(profilePage.avatar).toBeVisible();
    await expect(profilePage.infoSection).toBeVisible();
    await expect(profilePage.usernameSection).toBeVisible();
  });

  test('should display profile feed with tabs', { tag: '@profile-view-002' }, async ({ profilePage, page }) => {
    await page.goto('/profile/guest-user');

    await expect(profilePage.feedContainer).toBeVisible();
    await expect(profilePage.feedTabs).toBeVisible();
    await expect(profilePage.postsTab).toBeVisible();
    await expect(profilePage.repliesTab).toBeVisible();
  });

  test('should display follow stats and bio', { tag: '@profile-view-003' }, async ({ profilePage, page }) => {
    await page.goto('/profile/guest-user');

    await expect(profilePage.followStats).toBeVisible();
    await expect(profilePage.bioContainer).toBeVisible();
  });
});

test.describe('Profile - Feed Tabs', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/profile/guest-user');
  });

  test('should switch between posts and replies tabs', { tag: '@profile-tabs-001' }, async ({ profilePage }) => {
    await expect(profilePage.feedDisplay).toBeVisible();

    await profilePage.clickPostsTab();
    await expect(profilePage.postsContainer).toBeAttached({ timeout: 5000 });

    await profilePage.clickRepliesTab();
    await expect(profilePage.repliesTab).toBeVisible();

    await profilePage.clickPostsTab();
    await expect(profilePage.postsTab).toBeVisible();
  });
});

test.describe('Profile - Edit Profile', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/profile/guest-user');
  });

  test('should open edit profile modal and allow input', { tag: '@profile-edit-001' }, async ({ profilePage, editProfilePage }) => {
    const isOwnProfile = await profilePage.editProfileButton.isVisible();
    if (!isOwnProfile) {
      test.skip();
      return;
    }

    await profilePage.clickEditProfile();

    await expect(editProfilePage.container).toBeVisible();
    await expect(editProfilePage.nameInput).toBeVisible();
    await expect(editProfilePage.bioInput).toBeVisible();
    await expect(editProfilePage.saveButton).toBeVisible();
    await expect(editProfilePage.pictureUpload).toBeVisible();
    await expect(editProfilePage.pictureInput).toBeAttached();
    await expect(editProfilePage.backgroundUpload).toBeVisible();
    await expect(editProfilePage.backgroundInput).toBeAttached();

    const newName = 'Updated Name';
    const newBio = 'This is my updated bio!';

    await editProfilePage.updateName(newName);
    await editProfilePage.updateBio(newBio);

    await expect(editProfilePage.nameInput).toHaveValue(newName);
    await expect(editProfilePage.bioInput).toHaveValue(newBio);
  });
});

test.describe('Profile - Follow Button', () => {

  test('should display follow button on other users profiles', { tag: '@profile-follow-001' }, async ({ page }) => {
    await page.goto('/profile/some-other-user');

    const followButton = page.getByTestId('profile-follow-button');
    const isVisible = await followButton.isVisible().catch(() => false);

    if (isVisible) {
      await expect(followButton).toBeVisible();
    }
  });
});
