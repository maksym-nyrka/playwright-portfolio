import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Cart API', () => {
  test('Full cart lifecycle: Create, Add, Update, Remove', async ({ apiClient, apiToken }) => {
    // 1. Create Cart
    const { response: createRes, body: cart } = await apiClient.createCart(apiToken);
    expect(createRes.ok()).toBeTruthy();
    const cartId = cart.id;

    // Get a valid product ID
    const { body: products } = await apiClient.getProducts();
    const productId = products[0].id;

    // 2. Add Item
    const { response: addRes } = await apiClient.addItemToCart(cartId, {
      productId,
      quantity: 1,
    }, apiToken);
    expect(addRes.ok()).toBeTruthy();

    const { body: cartAfterAdd } = await apiClient.getCart(cartId, apiToken);
    expect(cartAfterAdd.cart_items.length).toBeGreaterThan(0);
    expect(cartAfterAdd.cart_items[0].quantity).toBe(1);

    // 3. Update Quantity
    const { response: updateRes } = await apiClient.updateCartItem(cartId, productId, 2, apiToken);
    expect(updateRes.ok()).toBeTruthy();

    const { body: cartAfterUpdate } = await apiClient.getCart(cartId, apiToken);
    expect(cartAfterUpdate.cart_items[0].quantity).toBe(2);

    // 4. Remove Item
    const { response: removeRes } = await apiClient.removeCartItem(cartId, productId, apiToken);
    expect(removeRes.ok()).toBeTruthy();

    // Verify cart is empty
    const { body: finalCart } = await apiClient.getCart(cartId, apiToken);
    expect(finalCart.cart_items.length).toBe(0);
  });

  test('API-only checkout flow should return 201 invoice', async ({ apiClient, apiToken }) => {
    // Setup: Create cart and add an item
    const { body: cart } = await apiClient.createCart(apiToken);
    const { body: products } = await apiClient.getProducts();
    await apiClient.addItemToCart(cart.id, { productId: products[0].id, quantity: 1 }, apiToken);

    // The API validates city/state against the postcode, so resolve a
    // consistent address instead of hardcoding one that may not match.
    const { response: lookupRes, body: address } = await apiClient.lookupPostcode('NL', '1234AB', '10');
    expect(lookupRes.ok()).toBeTruthy();

    // Checkout
    const { response, body: invoice } = await apiClient.checkout({
      cartId: cart.id,
      paymentMethod: 'cash-on-delivery',
      paymentDetails: {},
      billingStreet: address.street,
      billingCity: address.city,
      billingState: address.state,
      billingCountry: address.country,
      billingPostalCode: address.postcode,
    }, apiToken);

    expect(response.status()).toBe(201);
    expect(invoice.id).toBeDefined();
    expect(invoice.invoice_number).toBeDefined();
  });

});
