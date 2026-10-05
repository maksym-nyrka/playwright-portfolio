import { test, expect } from '../../fixtures/auth.fixture';

test('Debug Products API', async ({ apiClient }) => {
  const { response, body } = await apiClient.getProducts();
  console.log('Products Response Status:', response.status());
  console.log('Products Response Body:', JSON.stringify(body, null, 2));
  expect(response.ok()).toBeTruthy();
});
