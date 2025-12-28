import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class BookmarksPage extends BasePage {
  readonly container: Locator;
  readonly postsList: Locator;
  readonly bookmarkPostContainer: Locator;
  readonly bookmarkPostOptionsButton: Locator;
  readonly bookmarkPostOptionsMenu: Locator;
  readonly bookmarkPostDeleteButton: Locator;
  readonly bookmarkPostUserContainer: Locator;
  readonly bookmarkPostUserAvatar: Locator;
  readonly bookmarkPostUsername: Locator;
  readonly bookmarkPostContent: Locator;
  readonly bookmarkStarIcon: Locator;

  constructor(page: Page) {
    super(page);
    this.container = page.getByTestId('bookmarks-container');
    this.postsList = page.getByTestId('bookmarks-posts-list');
    this.bookmarkPostContainer = page.getByTestId('bookmark-post-container');
    this.bookmarkPostOptionsButton = page.getByTestId('bookmark-post-options-button');
    this.bookmarkPostOptionsMenu = page.getByTestId('bookmark-post-options-menu');
    this.bookmarkPostDeleteButton = page.getByTestId('bookmark-post-delete-button');
    this.bookmarkPostUserContainer = page.getByTestId('bookmark-post-user-container');
    this.bookmarkPostUserAvatar = page.getByTestId('bookmark-post-user-avatar');
    this.bookmarkPostUsername = page.getByTestId('bookmark-post-username');
    this.bookmarkPostContent = page.getByTestId('bookmark-post-content');
    this.bookmarkStarIcon = page.getByTestId('sidebar-bookmarks-link');
  }

  async navigate() {
    await this.bookmarkStarIcon.click();
    await this.container.waitFor({ state: 'visible', timeout: 5000 });
    const pageUrl = this.page.url();
    if (!pageUrl.includes('/bookmarks')) {
      throw new Error(`Expected to navigate to bookmarks page but got ${pageUrl}`);
    }
  }
  
  async clickBookmarkBtn() {
    await this.bookmarkStarIcon.click();
  }

  getAllBookmarks() {
    return this.bookmarkPostContainer;
  }

  async getBookmarksCount(): Promise<number> {
    return await this.bookmarkPostContainer.count();
  }

  getBookmarkByIndex(index: number) {
    return this.bookmarkPostContainer.nth(index);
  }

  async clickBookmark(index: number = 0) {
    await this.bookmarkPostContainer.nth(index).click();
  }

  async isEmpty(): Promise<boolean> {
    const count = await this.getBookmarksCount();
    return count === 0;
  }
}
