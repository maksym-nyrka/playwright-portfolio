import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Products API', () => {
  test('GET all products should return a list of products', async ({ apiClient }) => {
    const { response, body } = await apiClient.getProducts();

    expect(response.ok()).toBeTruthy();
    expect(Array.isArray(body)).toBeTruthy();
    expect(body.length).toBeGreaterThan(0);
  });

  test('GET product by ID should return detailed product information', async ({ apiClient }) => {
    // Get a valid ID from the list first
    const { body: products } = await apiClient.getProducts();
    const productId = products[0].id;

    const { response, body } = await apiClient.getProductById(productId);

    expect(response.ok()).toBeTruthy();
    expect(body.id).toBe(productId);
    expect(body.name).toBeDefined();
    expect(body.price).toBeDefined();
    expect(body.sku).toBeDefined();
  });

  test('Search products should return matching results', async ({ apiClient }) => {
    const keyword = 'iPhone';
    const { response, body } = await apiClient.searchProducts(keyword);

    expect(response.ok()).toBeTruthy();
    expect(Array.isArray(body)).toBeTruthy();
    // Basic check that results are filtered (or at least the API responds)
    if (body.length > 0) {
      const match = body.some(p => p.name.toLowerCase().includes(keyword.toLowerCase()));
      expect(match).toBeTruthy();
    }
  });

  test('POST product (Admin) should return 201', async ({ apiClient }) => {
    const { body: adminAuth } = await apiClient.login({
      email: 'admin@practicesoftwaretesting.com',
      password: 'welcome01',
    });

    // Get valid category and brand IDs
    const { body: products } = await apiClient.getProducts();
    const sampleProduct = products[0];

    const newProduct = {
      name: `Playwright-Powered Phone ${Date.now()}`,
      description: 'The best phone for automation',
      price: 999,
      sku: `SKU-${Date.now()}`,
      category_id: sampleProduct.category.id,
      brand_id: sampleProduct.brand.id,
      is_location_offer: false,
      is_rental: false,
      product_image_id: sampleProduct.product_image.id,
    };

    const { response } = await apiClient.createProduct(newProduct, adminAuth.access_token);

    expect(response.status()).toBe(201);
  });

  test('POST product (No Auth) should return 401', async ({ apiClient }) => {
    const newProduct = { name: 'Unauthorized Phone' };

    // Call without passing a token
    const { response } = await apiClient.createProduct(newProduct, '');

    expect(response.status()).toBe(401);
  });

  test('GET non-existent product should return 404', async ({ apiClient }) => {
    const { response } = await apiClient.getProductById('non-existent-id-123');

    expect(response.status()).toBe(404);
  });
});
