import * as dotenv from 'dotenv';

dotenv.config();

const LIVE_APP_URL = 'https://practicesoftwaretesting.com';
const LIVE_API_URL = 'https://api.practicesoftwaretesting.com';

const localAppUrl = 'http://localhost:4200';
const localApiUrl = 'http://localhost:8091';

/**
 * GitHub-hosted runners are challenged by Cloudflare before the live demo app
 * loads. When CI runs against the public URL, start a local Toolshop stack
 * instead (see `scripts/start-toolshop.sh`).
 */
export const useLocalToolshop =
  Boolean(process.env.CI) && !/localhost|127\.0\.0\.1/.test(process.env.BASE_URL ?? '');

export const appBaseURL = useLocalToolshop
  ? localAppUrl
  : (process.env.BASE_URL ?? LIVE_APP_URL);

export const apiBaseURL = useLocalToolshop
  ? localApiUrl
  : (process.env.API_BASE_URL ?? LIVE_API_URL);

export { localAppUrl, localApiUrl };
