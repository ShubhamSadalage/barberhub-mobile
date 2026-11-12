import { apiClient } from '@/api/client';
import type { BarberHomeFeedDto, BarberCardDto, BarberDetailsDto, AvailableSlotsDto } from '@/types/api';

export const barbersApi = {
  async home(lat?: number, lng?: number, limit = 12) {
    const { data } = await apiClient.get<BarberHomeFeedDto>('/api/barbers/home', {
      params: { lat, lng, limit },
    });
    return data;
  },

  async search(params: { city?: string; latitude?: number; longitude?: number; radiusKm?: number }) {
    const { data } = await apiClient.get<BarberCardDto[]>('/api/barbers', { params });
    return data;
  },

  async details(id: string) {
    const { data } = await apiClient.get<BarberDetailsDto>(`/api/barbers/${id}`);
    return data;
  },

  async availableSlots(id: string, date: string, serviceId: string) {
    const { data } = await apiClient.get<AvailableSlotsDto>(`/api/barbers/${id}/slots`, {
      params: { date, serviceId },
    });
    return data;
  },
};
