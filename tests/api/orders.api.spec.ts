import { test, expect } from '../../fixtures/auth.fixture';
import { ApiClient, Invoice } from '../../utils/api-client';

/**
 * Create a cart, add a product and check it out.
 * The address must come from the postcode lookup because the API validates
 * that the city/state belong to the submitted country + postcode.
 */
async function createInvoice(apiClient: ApiClient, token: string): Promise<Invoice> {
  const { body: cart } = await apiClient.createCart(token);
  const { body: products } = await apiClient.getProducts();
  await apiClient.addItemToCart(cart.id, { productId: products[0].id, quantity: 1 }, token);

  const { body: address } = await apiClient.lookupPostcode('NL', '1234AB', '10');
  const { body: invoice } = await apiClient.checkout({
    cartId: cart.id,
    paymentMethod: 'cash-on-delivery',
    paymentDetails: {},
    billingStreet: address.street,
    billingCity: address.city,
    billingState: address.state,
    billingCountry: address.country,
    billingPostalCode: address.postcode,
  }, token);

  return invoice;
}

test.describe('Orders API', () => {
  test('GET order history should return a list of invoices', async ({ apiClient, apiToken }) => {
    const { response, body } = await apiClient.getInvoices(apiToken);

    expect(response.ok()).toBeTruthy();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test('GET specific invoice should return invoice details', async ({ apiClient, apiToken }) => {
    // Get an existing invoice, creating one when the account has none yet.
    let { body: invoices } = await apiClient.getInvoices(apiToken);
    if (invoices.length === 0) {
      const created = await createInvoice(apiClient, apiToken);
      invoices = [created];
    }

    const invoiceId = invoices[0].id;
    const { response, body } = await apiClient.getInvoiceById(invoiceId, apiToken);

    expect(response.ok()).toBeTruthy();
    expect(body.id).toBe(invoiceId);
    expect(body.total ?? body.totalAmount).toBeDefined();
  });

  test('Verify order appears in history after checkout', async ({ apiClient, apiToken }) => {
    // 1. Initial history count
    const { total: totalBefore } = await apiClient.getInvoices(apiToken);

    // 2. Perform checkout
    const invoice = await createInvoice(apiClient, apiToken);
    const newInvoiceId = invoice.id;

    // 3. Verify in history
    const { body: historyAfter, total: totalAfter } = await apiClient.getInvoices(apiToken);
    expect(totalAfter).toBeGreaterThanOrEqual(totalBefore + 1);

    const found = historyAfter.some(inv => inv.id === newInvoiceId);
    expect(found).toBeTruthy();
  });
});
