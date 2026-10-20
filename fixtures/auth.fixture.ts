import { test as base, expect, request } from '@playwright/test';
import { ApiClient } from '../utils/api-client';

type TestFixtures = {
  apiClient: ApiClient;
};

type WorkerFixtures = {
  apiToken: string;
};

export const test = base.extend<TestFixtures, WorkerFixtures>({
  // Worker-scoped fixture: authenticates once per worker
  apiToken: [async ({}, use) => {
    const requestContext = await request.newContext();
    const client = new ApiClient(requestContext);

    const { response, body } = await client.login({
      email: process.env.CUSTOMER_EMAIL || 'customer@practicesoftwaretesting.com',
      password: process.env.CUSTOMER_PASSWORD || 'welcome01',
    });

    if (!response.ok()) {
      throw new Error(`Failed to authenticate worker: ${response.status()} ${await response.text()}`);
    }

    await use(body.access_token);
    await requestContext.dispose();
  }, { scope: 'worker' }],

  // Test-scoped fixture: provides the ApiClient
  apiClient: async ({ request }, use) => {
    const client = new ApiClient(request);
    await use(client);
  },
});

export { expect };
