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
    const { response: addRes, body: addedItem } = await apiClient.addItemToCart(cartId, {
      productId,
      quantity: 1,
    }, apiToken);
    expect(addRes.ok()).toBeTruthy();
    const itemId = addedItem.id;
    expect(addedItem.quantity).toBe(1);

    // 3. Update Quantity
    const { response: updateRes, body: updatedItem } = await apiClient.updateCartItem(cartId, itemId, 2, apiToken);
    expect(updateRes.ok()).toBeTruthy();
    expect(updatedItem.quantity).toBe(2);

    // 4. Remove Item
    const { response: removeRes } = await apiClient.removeCartItem(cartId, itemId, apiToken);
    expect(removeRes.ok()).toBeTruthy();

    // Verify cart is empty
    const { body: finalCart } = await apiClient.getCart(cartId, apiToken);
    expect(finalCart.items.length).toBe(0);
  });

  test('API-only checkout flow should return 201 invoice', async ({ apiClient, apiToken }) => {
    // Setup: Create cart and add an item
    const { body: cart } = await apiClient.createCart(apiToken);
    const { body: products } = await apiClient.getProducts();
    await apiClient.addItemToCart(cart.id, { productId: products[0].id, quantity: 1 }, apiToken);

    // Checkout
    const { response, body: invoice } = await apiClient.checkout({
      cartId: cart.id,
      paymentMethod: 'paypal',
      paymentDetails: 'paypal@example.com',
      billingStreet: '123 Test St',
      billingCity: 'Test City',
      billingCountry: 'US',
    }, apiToken);

    expect(response.status()).toBe(201);
    expect(invoice.id).toBeDefined();
    expect(invoice.userId).toBeDefined();
  });

});
