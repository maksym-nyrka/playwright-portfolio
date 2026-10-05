import path from 'path';
import { test, expect } from '../../fixtures/pages.fixture';
import { contactMessage } from '../../utils/test-data';

/**
 * UI — Contact form
 *
 * Playwright features:
 *  - page.setInputFiles()
 *  - waiting for success notification
 */

const emptyAttachment = path.join(__dirname, 'files', 'empty.txt');

test.describe('Contact form', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('submit a valid contact message', async ({ contactPage }) => {
    await contactPage.goto();
    await contactPage.fillGuestForm(contactMessage());
    await contactPage.submit.click();
    await expect(contactPage.successAlert).toBeVisible();
  });

  test('upload an empty text attachment', async ({ contactPage }) => {
    await contactPage.goto();
    await contactPage.fillGuestForm(contactMessage());
    await contactPage.attachment.setInputFiles(emptyAttachment);
    await contactPage.submit.click();
    await expect(contactPage.successAlert).toBeVisible();
    await expect(contactPage.attachmentError).toBeHidden();
  });

  test('required fields show validation errors', async ({ contactPage }) => {
    await contactPage.goto();
    await contactPage.submit.click();

    await expect.soft(contactPage.firstNameError).toBeVisible();
    await expect.soft(contactPage.lastNameError).toBeVisible();
    await expect.soft(contactPage.emailError).toBeVisible();
    await expect.soft(contactPage.subjectError).toBeVisible();
    await expect(contactPage.messageError).toBeVisible();
  });
});
