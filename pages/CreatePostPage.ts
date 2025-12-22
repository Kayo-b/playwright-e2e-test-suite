import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class CreatePostPage extends BasePage {
  readonly wrapper: Locator;
  readonly container: Locator;
  readonly profilePicture: Locator;
  readonly contentContainer: Locator;
  readonly textarea: Locator;
  readonly removeGifButton: Locator;
  readonly gifPreview: Locator;
  readonly actions: Locator;
  readonly gifButton: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.wrapper = page.getByTestId('create-post-wrapper');
    this.container = page.getByTestId('create-post-container');
    this.profilePicture = page.getByTestId('create-post-profile-picture');
    this.contentContainer = page.getByTestId('create-post-content-container');
    this.textarea = page.getByTestId('create-post-textarea');
    this.removeGifButton = page.getByTestId('create-post-remove-gif-button');
    this.gifPreview = page.getByTestId('create-post-gif-preview');
    this.actions = page.getByTestId('create-post-actions');
    this.gifButton = page.getByTestId('create-post-gif-button');
    this.submitButton = page.getByTestId('create-post-submit-button');
  }

  async createPost(text: string) {
    await this.textarea.fill(text);
    await this.submitButton.click();
    await this.wait(1000);
  }

  async openGifSearch() {
    await this.gifButton.click();
  }

  async removeGif() {
    await this.removeGifButton.click();
  }

  async isGifPreviewVisible(): Promise<boolean> {
    return await this.gifPreview.isVisible();
  }

  async clearText() {
    await this.textarea.clear();
  }
}
