import { APIRequestContext, APIResponse } from '@playwright/test';

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

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  sku: string;
  category: string;
  brand: string;
  imageUrl: string;
  stock: number;
  co2Rating: number;
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
  userId: string;
  orderDate: string;
  totalAmount: number;
  status: string;
  items: CartItem[];
}

export class ApiClient {
  constructor(private request: APIRequestContext) {}

  private async requestHelper<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    options: { data?: any; token?: string; baseURL?: string } = {}
  ): Promise<{ response: APIResponse; body: T }> {
    const baseUrl = options.baseURL || 'https://api.practicesoftwaretesting.com';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (options.token) {
      headers['Authorization'] = `Bearer ${options.token}`;
    }

    const response = await this.request.fetch(`${baseUrl}${endpoint}`, {
      method,
      data: options.data,
      headers,
    });

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
    return this.requestHelper<LoginResponse>('POST', '/users/login');
  }

  async register(data: RegisterRequest): Promise<{ response: APIResponse; body: any }> {
    return this.requestHelper<any>('POST', '/users/register');
  }

  // --- Products Resource (on /api path) ---
  async getProducts(): Promise<{ response: APIResponse; body: Product[] }> {
    const { response, body } = await this.requestHelper<{ data: Product[] }>('GET', '/api/products');
    return { response, body: body.data };
  }

  async getProductById(id: string): Promise<{ response: APIResponse; body: Product }> {
    return this.requestHelper<Product>('GET', `/api/products/${id}`);
  }

  async searchProducts(query: string): Promise<{ response: APIResponse; body: Product[] }> {
    const { response, body } = await this.requestHelper<{ data: Product[] }>('GET', `/api/products/search?q=${encodeURIComponent(query)}`);
    return { response, body: body.data };
  }

  async createProduct(data: Partial<Product>, token: string): Promise<{ response: APIResponse; body: Product }> {
    return this.requestHelper<Product>('POST', '/api/products', { data, token });
  }

  // --- Cart Resource (on /api path) ---
  async createCart(token: string): Promise<{ response: APIResponse; body: Cart }> {
    return this.requestHelper<Cart>('POST', '/api/carts', { token });
  }

  async getCart(cartId: string, token: string): Promise<{ response: APIResponse; body: Cart }> {
    return this.requestHelper<Cart>('GET', `/api/carts/${cartId}`, { token });
  }

  async addItemToCart(cartId: string, item: { productId: string; quantity: number }, token: string): Promise<{ response: APIResponse; body: CartItem }> {
    return this.requestHelper<CartItem>('POST', `/api/carts/${cartId}/items`, { data: item, token });
  }

  async updateCartItem(cartId: string, itemId: string, quantity: number, token: string): Promise<{ response: APIResponse; body: CartItem }> {
    return this.requestHelper<CartItem>('PUT', `/api/carts/${cartId}/items/${itemId}`, { data: { quantity }, token });
  }

  async removeCartItem(cartId: string, itemId: string, token: string): Promise<{ response: APIResponse; body: any }> {
    return this.requestHelper<any>('DELETE', `/api/carts/${cartId}/items/${itemId}`, { token });
  }

  // --- Orders/Invoices Resource (on /api path) ---
  async getInvoices(token: string): Promise<{ response: APIResponse; body: Invoice[] }> {
    const { response, body } = await this.requestHelper<{ data: Invoice[] }>('GET', '/api/invoices', { token });
    return { response, body: body.data };
  }

  async getInvoiceById(id: string, token: string): Promise<{ response: APIResponse; body: Invoice }> {
    return this.requestHelper<Invoice>('GET', `/api/invoices/${id}`, { token });
  }

  async checkout(details: { cartId: string; paymentMethod: string; paymentDetails: string; billingStreet: string; billingCity: string; billingCountry: string }, token: string): Promise<{ response: APIResponse; body: Invoice }> {
    return this.requestHelper<Invoice>('POST', '/api/invoices', {
      data: {
        cart_id: details.cartId,
        payment_method: details.paymentMethod,
        payment_details: details.paymentDetails,
        billing_street: details.billingStreet,
        billing_city: details.billingCity,
        billing_country: details.billingCountry,
      },
      token,
    });
  }
}
