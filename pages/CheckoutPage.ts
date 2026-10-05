import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export type AddressFields = {
  country: string;
  postalCode: string;
  houseNumber: string;
  street: string;
  city: string;
  state: string;
};

/**
 * CheckoutPage — remaining wizard steps: sign-in, billing address, payment.
 */
export class CheckoutPage extends BasePage {
  readonly proceedSignIn: Locator;
  readonly proceedGuest: Locator;
  readonly guestTab: Locator;
  readonly guestEmail: Locator;
  readonly guestFirstName: Locator;
  readonly guestLastName: Locator;
  readonly guestSubmit: Locator;
  readonly country: Locator;
  readonly postalCode: Locator;
  readonly houseNumber: Locator;
  readonly street: Locator;
  readonly city: Locator;
  readonly state: Locator;
  readonly proceedAddress: Locator;
  readonly paymentMethod: Locator;
  readonly finish: Locator;
  readonly paymentSuccess: Locator;
  readonly orderConfirmation: Locator;
  readonly paymentError: Locator;

  constructor(page: Page) {
    super(page);
    this.proceedSignIn = page.getByTestId('proceed-2');
    this.proceedGuest = page.getByTestId('proceed-2-guest');
    this.guestTab = page.getByRole('tab', { name: /continue as guest/i });
    this.guestEmail = page.getByTestId('guest-email');
    this.guestFirstName = page.getByTestId('guest-first-name');
    this.guestLastName = page.getByTestId('guest-last-name');
    this.guestSubmit = page.getByTestId('guest-submit');
    this.country = page.getByTestId('country');
    this.postalCode = page.getByTestId('postal_code');
    this.houseNumber = page.getByTestId('house_number');
    this.street = page.getByTestId('street');
    this.city = page.getByTestId('city');
    this.state = page.getByTestId('state');
    this.proceedAddress = page.getByTestId('proceed-3');
    this.paymentMethod = page.getByTestId('payment-method');
    this.finish = page.getByTestId('finish');
    this.paymentSuccess = page.getByTestId('payment-success-message');
    this.orderConfirmation = page.locator('#order-confirmation');
    this.paymentError = page.getByTestId('payment-error-message');
  }

  async fillGuestDetails(email: string, firstName: string, lastName: string) {
    await this.guestTab.click();
    await this.guestEmail.fill(email);
    await this.guestFirstName.fill(firstName);
    await this.guestLastName.fill(lastName);
    await this.guestSubmit.click();
  }

  async fillAddress(address: AddressFields) {
    await this.country.selectOption(address.country);
    await this.postalCode.fill(address.postalCode);
    await this.houseNumber.fill(address.houseNumber);
    await this.street.fill(address.street);
    await this.city.fill(address.city);
    await this.state.fill(address.state);
  }

  async payWithCashOnDelivery() {
    await this.paymentMethod.selectOption('cash-on-delivery');
    await this.finish.click();
  }
}
