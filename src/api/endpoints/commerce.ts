import { apiClient } from '@/api/client';
import type { ProductListItemDto, CartSummaryDto, CheckoutDto, CheckoutResultDto, OrderListItemDto } from '@/types/api';

export const productsApi = {
  async all() {
    const { data } = await apiClient.get<ProductListItemDto[]>('/api/products');
    return data;
  },
  async details(id: string) {
    const { data } = await apiClient.get<ProductListItemDto>(`/api/products/${id}`);
    return data;
  },
};

export const cartApi = {
  async get() {
    const { data } = await apiClient.get<CartSummaryDto>('/api/cart');
    return data;
  },
  async add(productId: string, quantity = 1) {
    const { data } = await apiClient.post<CartSummaryDto>('/api/cart/items', { productId, quantity });
    return data;
  },
  async updateQuantity(cartItemId: string, quantity: number) {
    const { data } = await apiClient.put<CartSummaryDto>(`/api/cart/items/${cartItemId}`, { quantity });
    return data;
  },
  async remove(cartItemId: string) {
    const { data } = await apiClient.delete<CartSummaryDto>(`/api/cart/items/${cartItemId}`);
    return data;
  },
};

export const ordersApi = {
  async checkout(dto: CheckoutDto) {
    const { data } = await apiClient.post<CheckoutResultDto>('/api/orders/checkout', dto);
    return data;
  },
  async mine() {
    const { data } = await apiClient.get<OrderListItemDto[]>('/api/orders/mine');
    return data;
  },
  async details(id: string) {
    const { data } = await apiClient.get<OrderListItemDto>(`/api/orders/${id}`);
    return data;
  },
};
