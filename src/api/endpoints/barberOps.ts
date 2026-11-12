import { apiClient } from '@/api/client';
import type { BookingListItemDto, ProductListItemDto, OrderListItemDto, EarningsDto, EditProductDto } from '@/types/api';
export type { EarningsDto };

// ---------- Services ----------

export interface ServiceItemDto {
  id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  durationMinutes: number;
  isActive: boolean;
  createdAt: string;
}

export interface ServiceTemplateDto {
  name: string;
  category: string;
  defaultPrice: number;
  defaultDuration: number;
  description: string;
  suggestedSelected: boolean;
}

export interface ServiceUpsertDto {
  name: string;
  description?: string;
  category: string;
  price: number;
  durationMinutes: number;
  isActive: boolean;
}

export const servicesApi = {
  async mine() {
    const { data } = await apiClient.get<ServiceItemDto[]>('/api/services/mine');
    return data;
  },
  async templates() {
    const { data } = await apiClient.get<ServiceTemplateDto[]>('/api/services/templates');
    return data;
  },
  async activateTemplates(items: Array<{ name: string; category: string; description?: string; price: number; durationMinutes: number }>) {
    const { data } = await apiClient.post('/api/services/templates/activate', { items });
    return data as { message: string; added: number };
  },
  async create(dto: ServiceUpsertDto) {
    const { data } = await apiClient.post<ServiceItemDto>('/api/services', dto);
    return data;
  },
  async edit(id: string, dto: ServiceUpsertDto) {
    const { data } = await apiClient.put(`/api/services/${id}`, dto);
    return data as { message: string };
  },
  async toggle(id: string) {
    const { data } = await apiClient.post(`/api/services/${id}/toggle`);
    return data as { isActive: boolean; message: string };
  },
  async remove(id: string) {
    const { data } = await apiClient.delete(`/api/services/${id}`);
    return data as { message: string; hidden: boolean };
  },
};

// ---------- Barber bookings management ----------

export const barberBookingsApi = {
  async manage() {
    const { data } = await apiClient.get<BookingListItemDto[]>('/api/bookings/manage');
    return data;
  },
  async updateStatus(bookingId: string, newStatus: string, rejectionReason?: string) {
    const { data } = await apiClient.put('/api/bookings/status', { bookingId, newStatus, rejectionReason });
    return data as { message: string };
  },
};

// ---------- Admin (barber's own dashboard) ----------

export interface DashboardSummaryDto {
  bookingsCount: number;
  productsCount: number;
  pendingBookings: number;
  todayBookings: number;
  totalEarnings: number;
}

export interface UserListItemDto {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  city?: string;
  createdAt: string;
  isActive: boolean;
}

export interface UserOptionDto { id: string; label: string; }
export interface ServiceOptionDto { id: string; label: string; }

export interface LeaveDayDto { id: string; leaveDate: string; reason?: string; }

export const adminApi = {
  async dashboard() {
    const { data } = await apiClient.get<DashboardSummaryDto>('/api/admin/dashboard');
    return data;
  },
  async users() {
    const { data } = await apiClient.get<UserListItemDto[]>('/api/admin/users');
    return data;
  },
  async addUser(dto: { fullName: string; email: string; phoneNumber?: string; city?: string; password: string }) {
    const { data } = await apiClient.post('/api/admin/users', dto);
    return data as { message: string; userId: string };
  },
  async createBookingOptions() {
    const { data } = await apiClient.get<{ users: UserOptionDto[]; services: ServiceOptionDto[] }>('/api/admin/bookings/create-options');
    return data;
  },
  async createBooking(dto: { userId: string; serviceId: string; appointmentDate: string; startTime: string; notes?: string }) {
    const { data } = await apiClient.post('/api/admin/bookings', dto);
    return data as { bookingId: string; message: string };
  },
  async earnings(from?: string, to?: string) {
    const { data } = await apiClient.get<EarningsDto>('/api/admin/earnings', { params: { from, to } });
    return data;
  },
  async leaveDays() {
    const { data } = await apiClient.get<{ weeklyHoliday?: number; leaves: LeaveDayDto[] }>('/api/admin/leave-days');
    return data;
  },
  async addLeaveDay(leaveDate: string, reason?: string) {
    const { data } = await apiClient.post('/api/admin/leave-days', { leaveDate, reason });
    return data as { message: string };
  },
  async removeLeaveDay(id: string) {
    const { data } = await apiClient.delete(`/api/admin/leave-days/${id}`);
    return data as { message: string };
  },
  async setWeeklyHoliday(weeklyHoliday: number) {
    const { data } = await apiClient.put('/api/admin/weekly-holiday', { weeklyHoliday });
    return data as { message: string };
  },
};

// ---------- Barber's product management ----------

export const barberProductsApi = {
  async mine() {
    const { data } = await apiClient.get<ProductListItemDto[]>('/api/products/mine');
    return data;
  },
  async forEdit(id: string) {
    const { data } = await apiClient.get<EditProductDto>(`/api/products/mine/${id}`);
    return data;
  },
  async create(form: FormData) {
    const { data } = await apiClient.post('/api/products', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    return data as { productId: string; message: string };
  },
  async edit(id: string, form: FormData) {
    const { data } = await apiClient.put(`/api/products/${id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
    return data as { message: string };
  },
  async remove(id: string) {
    const { data } = await apiClient.delete(`/api/products/${id}`);
    return data as { message: string };
  },
};

// ---------- Barber's order management ----------

export const barberOrdersApi = {
  async manage() {
    const { data } = await apiClient.get<OrderListItemDto[]>('/api/orders/manage');
    return data;
  },
  async markPaid(id: string) {
    const { data } = await apiClient.post(`/api/orders/${id}/mark-paid`);
    return data as { message: string };
  },
};
