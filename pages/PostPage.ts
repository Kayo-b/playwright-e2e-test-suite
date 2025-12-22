import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class PostPage extends BasePage {
  readonly postContainer: Locator;
  readonly optionsButton: Locator;
  readonly optionsMenu: Locator;
  readonly deleteButton: Locator;
  readonly userContainer: Locator;
  readonly userAvatar: Locator;
  readonly username: Locator;
  readonly content: Locator;
  readonly textContent: Locator;
  readonly gifImage: Locator;
  readonly actionsContainer: Locator;
  readonly actions: Locator;

  readonly likeButton: Locator;
  readonly commentButton: Locator;
  readonly bookmarkButton: Locator;
  readonly repostButton: Locator;

  constructor(page: Page) {
    super(page);
    this.postContainer = page.getByTestId('post-container');
    this.optionsButton = page.getByTestId('post-options-button');
    this.optionsMenu = page.getByTestId('post-options-menu');
    this.deleteButton = page.getByTestId('post-delete-button');
    this.userContainer = page.getByTestId('post-user-container');
    this.userAvatar = page.getByTestId('post-user-avatar');
    this.username = page.getByTestId('post-username');
    this.content = page.getByTestId('post-content');
    this.textContent = page.getByTestId('post-text-content');
    this.gifImage = page.getByTestId('post-gif-image');
    this.actionsContainer = page.getByTestId('post-actions-container');
    this.actions = page.getByTestId('post-actions');

    this.likeButton = page.getByTestId('like-button');
    this.commentButton = page.getByTestId('comment-button');
    this.bookmarkButton = page.getByTestId('bookmark-button-container');
    this.repostButton = page.getByTestId('repost-button-container');
  }

  getAllPosts() {
    return this.postContainer;
  }

  getPostByIndex(index: number) {
    return this.postContainer.nth(index);
  }

  async getPostText(index: number = 0): Promise<string> {
    return await this.postContainer.nth(index).getByTestId('post-text-content').textContent() || '';
  }

  async getPostUsername(index: number = 0): Promise<string> {
    return await this.postContainer.nth(index).getByTestId('post-username').textContent() || '';
  }

  async likePost(index: number = 0) {
    await this.postContainer.nth(index).getByTestId('like-button').click();
  }

  async clickCommentButton(index: number = 0) {
    await this.postContainer.nth(index).getByTestId('comment-button').click();
  }

  async bookmarkPost(index: number = 0) {
    await this.postContainer.nth(index).getByTestId('bookmark-button-container').click();
  }

  async repostPost(index: number = 0) {
    await this.postContainer.nth(index).getByTestId('repost-button-container').click();
  }

  async openOptionsMenu(index: number = 0) {
    await this.postContainer.nth(index).getByTestId('post-options-button').click();
  }

  async deletePost(index: number = 0) {
    await this.openOptionsMenu(index);
    await this.postContainer.nth(index).getByTestId('post-delete-button').click();
  }

  async hasGif(index: number = 0): Promise<boolean> {
    return await this.postContainer.nth(index).getByTestId('post-gif-image').isVisible();
  }

  async clickPost(index: number = 0) {
    await this.postContainer.nth(index).click();
  }
}
