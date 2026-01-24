import { test as base, BrowserContext } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ResetPage } from '../pages/ResetPage';
import { HomePage } from '../pages/HomePage';
import { ProfilePage } from '../pages/ProfilePage';
import { EditProfilePage } from '../pages/EditProfilePage';
import { SidebarPage } from '../pages/SidebarPage';
import { DashboardPage } from '../pages/DashboardPage';
import { CreatePostPage } from '../pages/CreatePostPage';
import { PostPage } from '../pages/PostPage';
import { BookmarksPage } from '../pages/BookmarksPage';
import { SearchbarPage } from '../pages/SearchbarPage';
import { GifSearchPage } from '../pages/GifSearchPage';

type PageFixtures = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
  resetPage: ResetPage;
  homePage: HomePage;
  profilePage: ProfilePage;
  editProfilePage: EditProfilePage;
  sidebarPage: SidebarPage;
  dashboardPage: DashboardPage;
  createPostPage: CreatePostPage;
  postPage: PostPage;
  bookmarksPage: BookmarksPage;
  searchbarPage: SearchbarPage;
  gifSearchPage: GifSearchPage;
};

type WorkerFixtures = {
  workerAuthContext: BrowserContext;
};

export const test = base.extend<PageFixtures, WorkerFixtures>({
  // worker-scoped fixture that creates an authenticated context once per worker
  workerAuthContext: [async ({ browser }, use) => {
    const context = await browser.newContext();
    const setupPage = await context.newPage();

    await setupPage.goto('/');
    const guestButton = setupPage.getByTestId('login-guest-button');
    await guestButton.waitFor({ state: 'visible', timeout: 30000 });
    await guestButton.click();

    const homepageContainer = setupPage.getByTestId('homepage-container');
    await homepageContainer.waitFor({ state: 'visible', timeout: 30000 });

    await setupPage.close();

    await use(context);

    await context.close();
  }, { scope: 'worker' }],

  // override page to use the authenticated context
  page: async ({ workerAuthContext }, use) => {
    const page = await workerAuthContext.newPage();
    await use(page);
    await page.close();
  },

  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  registerPage: async ({ page }, use) => {
    const registerPage = new RegisterPage(page);
    await use(registerPage);
  },

  resetPage: async ({ page }, use) => {
    const resetPage = new ResetPage(page);
    await use(resetPage);
  },

  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },

  profilePage: async ({ page }, use) => {
    const profilePage = new ProfilePage(page);
    await use(profilePage);
  },

  editProfilePage: async ({ page }, use) => {
    const editProfilePage = new EditProfilePage(page);
    await use(editProfilePage);
  },

  sidebarPage: async ({ page }, use) => {
    const sidebarPage = new SidebarPage(page);
    await use(sidebarPage);
  },

  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },

  createPostPage: async ({ page }, use) => {
    const createPostPage = new CreatePostPage(page);
    await use(createPostPage);
  },

  postPage: async ({ page }, use) => {
    const postPage = new PostPage(page);
    await use(postPage);
  },

  bookmarksPage: async ({ page }, use) => {
    const bookmarksPage = new BookmarksPage(page);
    await use(bookmarksPage);
  },

  searchbarPage: async ({ page }, use) => {
    const searchbarPage = new SearchbarPage(page);
    await use(searchbarPage);
  },

  gifSearchPage: async ({ page }, use) => {
    const gifSearchPage = new GifSearchPage(page);
    await use(gifSearchPage);
  },
});

export { expect } from '@playwright/test';
