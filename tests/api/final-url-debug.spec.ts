import { test, expect } from '@playwright/test';

test('Verify Endpoints', async ({ request }) => {
  const combinations = [
    { base: 'https://api.practicesoftwaretesting.com', path: '/users/login' },
    { base: 'https://api.practicesoftwaretesting.com', path: '/api/users/login' },
    { base: 'https://practicesoftwaretesting.com', path: '/api/users/login' },
    { base: 'https://practicesoftwaretesting.com', path: '/users/login' },
  ];

  for (const { base, path } of combinations) {
    const res = await request.post(`${base}${path}`, {
      data: {
        email: 'customer@practicesoftwaretesting.com',
        password: 'welcome01',
      }
    });
    console.log(`${base}${path} -> ${res.status()} (${res.headers()['content-type'] || 'no content-type'})`);
  }
});
