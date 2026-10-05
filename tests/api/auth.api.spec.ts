import { test, expect } from '../../fixtures/auth.fixture';
import { RegisterRequest } from '../../utils/api-client';

test.describe('Auth API', () => {
  test('Login with valid credentials should return JWT', async ({ apiClient }) => {
    const { response, body } = await apiClient.login({
      email: 'customer@practicesoftwaretesting.com',
      password: 'welcome01',
    });

    expect(response.ok()).toBeTruthy();
    expect(body.access_token).toBeDefined();
    expect(typeof body.access_token).toBe('string');
  });

  test('Login with invalid credentials should return 401', async ({ apiClient }) => {
    const { response } = await apiClient.login({
      email: 'customer@practicesoftwaretesting.com',
      password: 'wrong-password',
    });

    expect(response.status()).toBe(401);
  });

  test('Register a new user should return 201', async ({ apiClient }) => {
    const userData: RegisterRequest = {
      email: `testuser_${Date.now()}@example.com`,
      password: 'StrongPassword123!_@#',
      first_name: 'Test',
      last_name: 'User',
    };

    const { response } = await apiClient.register(userData);

    expect(response.status()).toBe(201);
  });

  test('Register duplicate email should return 409', async ({ apiClient }) => {
    const userData: RegisterRequest = {
      email: 'customer@practicesoftwaretesting.com',
      password: 'StrongPassword123!_@#',
      first_name: 'Duplicate',
      last_name: 'User',
    };

    const { response } = await apiClient.register(userData);

    expect(response.status()).toBe(409);
  });
});
