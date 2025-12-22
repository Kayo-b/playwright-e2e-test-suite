import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class EditProfilePage extends BasePage {
  readonly container: Locator;
  readonly title: Locator;
  readonly imageUploads: Locator;
  readonly pictureUpload: Locator;
  readonly pictureLabel: Locator;
  readonly pictureInput: Locator;
  readonly backgroundUpload: Locator;
  readonly backgroundLabel: Locator;
  readonly backgroundInput: Locator;
  readonly nameSection: Locator;
  readonly nameLabel: Locator;
  readonly nameInput: Locator;
  readonly bioSection: Locator;
  readonly bioLabel: Locator;
  readonly bioInput: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    super(page);
    this.container = page.getByTestId('edit-profile-container');
    this.title = page.getByTestId('edit-profile-title');
    this.imageUploads = page.getByTestId('edit-profile-image-uploads');
    this.pictureUpload = page.getByTestId('edit-profile-picture-upload');
    this.pictureLabel = page.getByTestId('edit-profile-picture-label');
    this.pictureInput = page.getByTestId('edit-profile-picture-input');
    this.backgroundUpload = page.getByTestId('edit-profile-background-upload');
    this.backgroundLabel = page.getByTestId('edit-profile-background-label');
    this.backgroundInput = page.getByTestId('edit-profile-background-input');
    this.nameSection = page.getByTestId('edit-profile-name-section');
    this.nameLabel = page.getByTestId('edit-profile-name-label');
    this.nameInput = page.getByTestId('edit-profile-name-input');
    this.bioSection = page.getByTestId('edit-profile-bio-section');
    this.bioLabel = page.getByTestId('edit-profile-bio-label');
    this.bioInput = page.getByTestId('edit-profile-bio-input');
    this.saveButton = page.getByTestId('edit-profile-save-button');
  }

  async updateName(name: string) {
    await this.nameInput.clear();
    await this.nameInput.fill(name);
  }

  async updateBio(bio: string) {
    await this.bioInput.clear();
    await this.bioInput.fill(bio);
  }

  async uploadProfilePicture(filePath: string) {
    await this.pictureInput.setInputFiles(filePath);
  }

  async uploadBackgroundImage(filePath: string) {
    await this.backgroundInput.setInputFiles(filePath);
  }

  async save() {
    await this.saveButton.click();
  }

  async getCurrentName(): Promise<string> {
    return await this.nameInput.inputValue();
  }

  async getCurrentBio(): Promise<string> {
    return await this.bioInput.inputValue();
  }
}
