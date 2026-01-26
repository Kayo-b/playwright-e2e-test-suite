import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProfilePage extends BasePage {
  readonly container: Locator;
  readonly userContainer: Locator;
  readonly background: Locator;
  readonly avatar: Locator;
  readonly infoSection: Locator;
  readonly usernameSection: Locator;
  readonly followButton: Locator;
  readonly editProfileButton: Locator;
  readonly followStats: Locator;
  readonly bioContainer: Locator;
  readonly feedContainer: Locator;
  readonly feedTabs: Locator;
  readonly postsTab: Locator;
  readonly repliesTab: Locator;
  readonly feedDisplay: Locator;
  readonly postsContainer: Locator;

  constructor(page: Page) {
    super(page);
    this.container = page.getByTestId('profile-page-container');
    this.userContainer = page.getByTestId('profile-page-user-container');
    this.background = page.getByTestId('profile-background');
    this.avatar = page.getByTestId('profile-page-avatar');
    this.infoSection = page.getByTestId('profile-info-section');
    this.usernameSection = page.getByTestId('profile-username-section');
    this.followButton = page.getByTestId('profile-follow-button');
    this.editProfileButton = page.getByTestId('profile-edit-button');
    this.followStats = page.getByTestId('profile-follow-stats');
    this.bioContainer = page.getByTestId('profile-bio-container');
    this.feedContainer = page.getByTestId('profile-feed-container');
    this.feedTabs = page.getByTestId('profile-feed-tabs');
    this.postsTab = page.getByTestId('profile-posts-tab');
    this.repliesTab = page.getByTestId('profile-replies-tab');
    this.feedDisplay = page.getByTestId('profile-feed-display');
    this.postsContainer = page.getByTestId('profile-posts-container');
  }

  async navigate(username?: string) {
    if (username) {
      await this.goto(`/profile/${username}`);
    } else {
      await this.goto('/profile');
    }
  }

  async getUsername(): Promise<string> {
    return await this.usernameSection.textContent() || '';
  }

  async getBio(): Promise<string> {
    return await this.bioContainer.textContent() || '';
  }

  async clickEditProfile() {
    await this.editProfileButton.click();
  }

  async clickFollowButton() {
    await this.followButton.click();
  }

  async getPostsCount(): Promise<number> {
    const posts = this.postsContainer.locator('[data-testid="post-container"]');
    return await posts.count();
  }

  async clickPostsTab() {
    await this.postsTab.click();
  }

  async clickRepliesTab() {
    await this.repliesTab.click();
  }

  async isAvatarVisible(): Promise<boolean> {
    return await this.avatar.isVisible();
  }

  async isBackgroundVisible(): Promise<boolean> {
    return await this.background.isVisible();
  }

  async isOwnProfile(): Promise<boolean> {
    return await this.editProfileButton.isVisible();
  }
}
