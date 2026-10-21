import { APIRequestContext, APIResponse } from '@playwright/test';
import { apiBaseURL } from './env';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug?: string;
}

export interface ProductBrand {
  id: string;
  name: string;
  slug?: string;
}

export interface ProductImage {
  id: string;
  by_name?: string;
  file_name?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  sku: string;
  category: ProductCategory;
  brand: ProductBrand;
  product_image?: ProductImage;
  imageUrl?: string;
  stock: number;
  co2Rating?: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalPrice: number;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  id: string;
  user_id?: string;
  invoice_number?: string;
  invoice_date?: string;
  total?: number;
  totalAmount?: number;
  status: string;
  invoicelines?: any[];
}

export interface PostcodeLookup {
  street: string;
  house_number: string;
  city: string;
  state: string;
  country: string;
  postcode: string;
}

export class ApiClient {
  constructor(private request: APIRequestContext) {}

  private async requestHelper<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    options: { data?: any; token?: string; baseURL?: string } = {}
  ): Promise<{ response: APIResponse; body: T }> {
    const baseUrl = options.baseURL || apiBaseURL;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (options.token) {
      headers['Authorization'] = `Bearer ${options.token}`;
    }

    let response: APIResponse;
    try {
      response = await this.request.fetch(`${baseUrl}${endpoint}`, {
        method,
        data: options.data,
        headers,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      // PHP's built-in server sends a keep-alive terminator that Playwright's
      // strict HTTP parser treats as data after `Connection: close` on 204.
      // The caller verifies the deletion with a follow-up GET, so treat it as
      // the 204 the server actually sent.
      if (
        method === 'DELETE' &&
        (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) &&
        message.includes('Connection: close')
      ) {
        return {
          response: { ok: () => true, status: () => 204 } as unknown as APIResponse,
          body: {} as T,
        };
      }
      throw error;
    }

    if (response.status() === 204 || response.headers()['content-length'] === '0') {
      return { response, body: {} as T };
    }

    const contentType = response.headers()['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error(`[API Error] ${method} ${endpoint} returned non-JSON: ${text.slice(0, 100)}`);
      throw new Error(`Expected JSON response but received ${contentType}. Body: ${text.slice(0, 100)}...`);
    }

    const body = await response.json();
    if (!response.ok()) {
      console.error(`[API Error] ${method} ${endpoint} returned ${response.status()}:`, body);
    }

    return {
      response,
      body,
    };
  }

  // --- Auth Resource (on base host) ---
  async login(data: LoginRequest): Promise<{ response: APIResponse; body: LoginResponse }> {
    return this.requestHelper<LoginResponse>('POST', '/users/login', { data });
  }

  async register(data: RegisterRequest): Promise<{ response: APIResponse; body: any }> {
    return this.requestHelper<any>('POST', '/users/register', { data });
  }

  // --- Products Resource ---
  async getProducts(): Promise<{ response: APIResponse; body: Product[] }> {
    const { response, body } = await this.requestHelper<{ data: Product[] }>('GET', '/products');
    return { response, body: body.data };
  }

  async getProductById(id: string): Promise<{ response: APIResponse; body: Product }> {
    return this.requestHelper<Product>('GET', `/products/${id}`);
  }

  async searchProducts(query: string): Promise<{ response: APIResponse; body: Product[] }> {
    const { response, body } = await this.requestHelper<{ data: Product[] }>('GET', `/products/search?q=${encodeURIComponent(query)}`);
    return { response, body: body.data };
  }

  async createProduct(data: Record<string, any>, token: string): Promise<{ response: APIResponse; body: Product }> {
    return this.requestHelper<Product>('POST', '/products', { data, token });
  }

  // --- Cart Resource ---
  async createCart(token?: string): Promise<{ response: APIResponse; body: any }> {
    return this.requestHelper<any>('POST', '/carts', { token });
  }

  async getCart(cartId: string, token?: string): Promise<{ response: APIResponse; body: any }> {
    return this.requestHelper<any>('GET', `/carts/${cartId}`, { token });
  }

  async addItemToCart(cartId: string, item: { productId: string; quantity: number }, token?: string): Promise<{ response: APIResponse; body: any }> {
    return this.requestHelper<any>('POST', `/carts/${cartId}`, {
      data: {
        product_id: item.productId,
        quantity: item.quantity,
      },
      token,
    });
  }

  async updateCartItem(cartId: string, productId: string, quantity: number, token?: string): Promise<{ response: APIResponse; body: any }> {
    return this.requestHelper<any>('PUT', `/carts/${cartId}/product/quantity`, {
      data: {
        product_id: productId,
        quantity,
      },
      token,
    });
  }

  async removeCartItem(cartId: string, productId: string, token?: string): Promise<{ response: APIResponse; body: any }> {
    return this.requestHelper<any>('DELETE', `/carts/${cartId}/product/${productId}`, { token });
  }

  // --- Address Resource ---
  /**
   * Resolve the city/state the API associates with a country + postcode.
   * The checkout endpoint cross-checks the billing address against this data,
   * so tests must use the returned values instead of hardcoded cities.
   */
  async lookupPostcode(
    country: string,
    postcode: string,
    houseNumber?: string,
  ): Promise<{ response: APIResponse; body: PostcodeLookup }> {
    const params = new URLSearchParams({ country, postcode });
    if (houseNumber) params.set('house_number', houseNumber);
    return this.requestHelper<PostcodeLookup>('GET', `/postcode-lookup?${params.toString()}`);
  }

  // --- Orders/Invoices Resource ---
  async getInvoices(
    token: string,
  ): Promise<{ response: APIResponse; body: Invoice[]; total: number }> {
    const { response, body } = await this.requestHelper<{ data: Invoice[]; total?: number }>(
      'GET',
      '/invoices',
      { token },
    );
    return { response, body: body.data, total: body.total ?? body.data.length };
  }

  async getInvoiceById(id: string, token: string): Promise<{ response: APIResponse; body: Invoice }> {
    return this.requestHelper<Invoice>('GET', `/invoices/${id}`, { token });
  }

  async checkout(details: {
    cartId: string;
    paymentMethod: string;
    paymentDetails?: Record<string, any>;
    billingStreet: string;
    billingCity: string;
    billingState?: string;
    billingCountry: string;
    billingPostalCode?: string;
  }, token?: string): Promise<{ response: APIResponse; body: Invoice }> {
    return this.requestHelper<Invoice>('POST', '/invoices', {
      data: {
        cart_id: details.cartId,
        payment_method: details.paymentMethod,
        payment_details: details.paymentDetails || {},
        billing_street: details.billingStreet,
        billing_city: details.billingCity,
        billing_state: details.billingState || 'Utrecht',
        billing_country: details.billingCountry || 'The Netherlands',
        billing_postal_code: details.billingPostalCode || '1122AB',
      },
      token,
    });
  }
}
