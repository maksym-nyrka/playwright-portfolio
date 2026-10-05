/**
 * Lightweight test-data factory used by UI flows.
 */
export const contactMessage = () => ({
  firstName: 'Alex',
  lastName: 'Tester',
  email: `alex.tester.${Date.now()}@example.com`,
  subject: 'customer-service',
  // Contact form requires at least 50 characters.
  message: 'Please help me with an order status question. I need more than fifty characters here.',
});

export const guestCheckout = () => ({
  email: `guest.${Date.now()}@example.com`,
  firstName: 'Guest',
  lastName: 'Shopper',
});

export const billingAddress = {
  country: 'NL',
  postalCode: '1234AB',
  houseNumber: '10',
  street: 'Test Street',
  city: 'Utrecht',
  state: 'Utrecht',
};
