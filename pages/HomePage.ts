import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly container: Locator;
  readonly createPostSection: Locator;
  readonly feedSection: Locator;
  readonly postTextArea: Locator;
  readonly postButton: Locator;
  readonly posts: Locator;
  readonly homeSbBtn

  constructor(page: Page) {
    super(page);
    this.container = page.getByTestId('homepage-container');
    this.createPostSection = page.getByTestId('homepage-create-post');
    this.feedSection = page.getByTestId('homepage-feed');
    this.postTextArea = page.getByTestId('create-post-textarea');
    this.postButton = page.getByTestId('create-post-submit-button');
    this.posts = page.getByTestId('post-container');
    this.homeSbBtn = page.getByTestId('sidebar-home-link');
  }

  async navigate() {
    await this.goto('/homepage');
  }

  async clickHomeBtn() {
    await this.page.evaluate(() => {
      console.log('click home btn')
    })
    await this.homeSbBtn.click();
  }

  async createPost(content: string) {
    await this.postTextArea.fill(content);
    await this.postButton.click();
    await this.wait(1000);
  }

  async getPosts() {
    return await this.posts.all();
  }

  async getPostsCount(): Promise<number> {
    return await this.posts.count();
  }

  async getFirstPostText(): Promise<string> {
    return await this.posts.first().textContent() || '';
  }

  async isCreatePostVisible(): Promise<boolean> {
    return await this.createPostSection.isVisible();
  }

  async isFeedVisible(): Promise<boolean> {
    return await this.feedSection.isVisible();
  }

  async isHomePageLoaded(): Promise<boolean> {
    return this.getUrl().includes('/homepage');
  }
}
