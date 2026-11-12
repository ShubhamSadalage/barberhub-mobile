import { apiClient } from '@/api/client';
import type { OrderListItemDto, ProductListItemDto } from '@/types/api';

export interface SuperAdminDashboardDto {
  pendingBarbers: number;
  approvedBarbers: number;
  totalBarbers: number;
  totalUsers: number;
  marketplaceProducts: number;
  barberProducts: number;
  totalBookings: number;
  totalOrders: number;
}

export interface PendingBarberDto {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  shopName?: string;
  shopDescription?: string;
  address?: string;
  city?: string;
  requestedAt?: string;
  status: 'Pending' | 'Rejected' | 'Approved' | 'NotApplicable';
  rejectionReason?: string;
}

export interface ManagedUserDto {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  city?: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
}

export interface ManagedBarberDto extends ManagedUserDto {
  shopName?: string;
  approvalStatus: string;
}

export interface AuditLogEntryDto {
  id: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  targetType?: string;
  targetId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface AuditLogPageDto {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
  entries: AuditLogEntryDto[];
}

export const superAdminApi = {
  async dashboard() {
    const { data } = await apiClient.get<SuperAdminDashboardDto>('/api/superadmin/dashboard');
    return data;
  },

  // ----- Approvals -----
  async approvals() {
    const { data } = await apiClient.get<PendingBarberDto[]>('/api/superadmin/approvals');
    return data;
  },
  async approve(barberId: string) {
    const { data } = await apiClient.post(`/api/superadmin/approvals/${barberId}/approve`);
    return data as { message: string };
  },
  async reject(barberId: string, reason: string) {
    const { data } = await apiClient.post('/api/superadmin/approvals/reject', { barberId, reason });
    return data as { message: string };
  },

  // ----- Marketplace products -----
  async products() {
    const { data } = await apiClient.get<ProductListItemDto[]>('/api/superadmin/products');
    return data;
  },
  async productForEdit(id: string) {
    const { data } = await apiClient.get(`/api/superadmin/products/${id}`);
    return data;
  },
  async createProduct(form: FormData) {
    const { data } = await apiClient.post('/api/superadmin/products', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    return data as { productId: string; message: string };
  },
  async editProduct(id: string, form: FormData) {
    const { data } = await apiClient.put(`/api/superadmin/products/${id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
    return data as { message: string };
  },
  async deleteProduct(id: string) {
    const { data } = await apiClient.delete(`/api/superadmin/products/${id}`);
    return data as { message: string };
  },

  // ----- Marketplace orders -----
  async orders() {
    const { data } = await apiClient.get<OrderListItemDto[]>('/api/superadmin/orders');
    return data;
  },

  // ----- Users -----
  async users() {
    const { data } = await apiClient.get<ManagedUserDto[]>('/api/superadmin/users');
    return data;
  },
  async deleteUser(id: string) {
    const { data } = await apiClient.post(`/api/superadmin/users/${id}/delete`);
    return data as { message: string };
  },
  async restoreUser(id: string) {
    const { data } = await apiClient.post(`/api/superadmin/users/${id}/restore`);
    return data as { message: string };
  },

  // ----- Barbers -----
  async barbers() {
    const { data } = await apiClient.get<ManagedBarberDto[]>('/api/superadmin/barbers');
    return data;
  },
  async deleteBarber(id: string) {
    const { data } = await apiClient.post(`/api/superadmin/barbers/${id}/delete`);
    return data as { message: string };
  },
  async restoreBarber(id: string) {
    const { data } = await apiClient.post(`/api/superadmin/barbers/${id}/restore`);
    return data as { message: string };
  },

  // ----- Audit log -----
  async auditLog(page = 1) {
    const { data } = await apiClient.get<AuditLogPageDto>('/api/superadmin/audit-log', { params: { page } });
    return data;
  },
};
