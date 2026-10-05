import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * ContactPage — `/contact` form including file upload.
 */
export class ContactPage extends BasePage {
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly email: Locator;
  readonly subject: Locator;
  readonly message: Locator;
  readonly attachment: Locator;
  readonly submit: Locator;
  readonly successAlert: Locator;
  readonly firstNameError: Locator;
  readonly lastNameError: Locator;
  readonly emailError: Locator;
  readonly subjectError: Locator;
  readonly messageError: Locator;
  readonly attachmentError: Locator;

  constructor(page: Page) {
    super(page);
    this.firstName = page.getByTestId('first-name');
    this.lastName = page.getByTestId('last-name');
    this.email = page.getByTestId('email');
    this.subject = page.getByTestId('subject');
    this.message = page.getByTestId('message');
    this.attachment = page.getByTestId('attachment');
    this.submit = page.getByTestId('contact-submit');
    this.successAlert = page.locator('.alert-success');
    this.firstNameError = page.getByTestId('first-name-error');
    this.lastNameError = page.getByTestId('last-name-error');
    this.emailError = page.getByTestId('email-error');
    this.subjectError = page.getByTestId('subject-error');
    this.messageError = page.getByTestId('message-error');
    this.attachmentError = page.getByTestId('attachment-error');
  }

  async goto() {
    await this.navigate('/contact');
    await this.waitForPageLoad();
    await this.submit.waitFor({ state: 'visible' });
  }

  async fillGuestForm(data: {
    firstName: string;
    lastName: string;
    email: string;
    subject: string;
    message: string;
  }) {
    await this.firstName.fill(data.firstName);
    await this.lastName.fill(data.lastName);
    await this.email.fill(data.email);
    await this.subject.selectOption(data.subject);
    await this.message.fill(data.message);
  }
}
