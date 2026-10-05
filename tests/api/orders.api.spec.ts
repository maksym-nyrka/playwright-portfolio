import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Orders API', () => {
  test('GET order history should return a list of invoices', async ({ apiClient, apiToken }) => {
    const { response, body } = await apiClient.getInvoices(apiToken);

    expect(response.ok()).toBeTruthy();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test('GET specific invoice should return invoice details', async ({ apiClient, apiToken }) => {
    // Get an existing invoice first
    const { body: invoices } = await apiClient.getInvoices(apiToken);

    if (invoices.length === 0) {
      test.skip();
      return;
    }

    const invoiceId = invoices[0].id;
    const { response, body } = await apiClient.getInvoiceById(invoiceId, apiToken);

    expect(response.ok()).toBeTruthy();
    expect(body.id).toBe(invoiceId);
    expect(body.totalAmount).toBeDefined();
  });

  test('Verify order appears in history after checkout', async ({ apiClient, apiToken }) => {
    // 1. Initial history count
    const { body: historyBefore } = await apiClient.getInvoices(apiToken);
    const countBefore = historyBefore.length;

    // 2. Perform checkout
    const { body: cart } = await apiClient.createCart(apiToken);
    const { body: products } = await apiClient.getProducts();
    await apiClient.addItemToCart(cart.id, { productId: products[0].id, quantity: 1 }, apiToken);
    const { body: invoice } = await apiClient.checkout({
      cartId: cart.id,
      paymentMethod: 'paypal',
      paymentDetails: 'paypal@example.com',
      billingStreet: '123 Test St',
      billingCity: 'Test City',
      billingCountry: 'US',
    }, apiToken);
    const newInvoiceId = invoice.id;

    // 3. Verify in history
    const { body: historyAfter } = await apiClient.getInvoices(apiToken);
    expect(historyAfter.length).toBe(countBefore + 1);

    const found = historyAfter.some(inv => inv.id === newInvoiceId);
    expect(found).toBeTruthy();
  });
});
