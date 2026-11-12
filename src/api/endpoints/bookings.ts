import { apiClient } from '@/api/client';
import type { BookingListItemDto, CreateBookingDto, CreateBookingResponseDto, QueuePositionDto, ShiftBookingSlotDto } from '@/types/api';

export const bookingsApi = {
  async create(dto: CreateBookingDto) {
    const { data } = await apiClient.post<CreateBookingResponseDto>('/api/bookings', dto);
    return data;
  },

  async shiftSlot(dto: ShiftBookingSlotDto) {
    const { data } = await apiClient.post<{ message: string }>('/api/bookings/shift-slot', dto);
    return data;
  },

  async mine() {
    const { data } = await apiClient.get<BookingListItemDto[]>('/api/bookings/mine');
    return data;
  },

  async cancel(id: string) {
    const { data } = await apiClient.post<{ message: string }>(`/api/bookings/${id}/cancel`);
    return data;
  },

  async queuePosition(id: string) {
    const { data } = await apiClient.get<QueuePositionDto>(`/api/bookings/${id}/queue-position`);
    return data;
  },
};
