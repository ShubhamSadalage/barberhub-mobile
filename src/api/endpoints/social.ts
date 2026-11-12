import { apiClient } from '@/api/client';
import type { ChatContactDto, ChatMessageDto, NotificationDto } from '@/types/api';

export const chatApi = {
  async contacts() {
    const { data } = await apiClient.get<ChatContactDto[]>('/api/chat/contacts');
    return data;
  },
  async conversation(otherUserId: string) {
    const { data } = await apiClient.get<{
      otherUser: { id: string; fullName: string; profileImageUrl?: string };
      messages: ChatMessageDto[];
    }>(`/api/chat/conversation/${otherUserId}`);
    return data;
  },
};

export const notificationsApi = {
  async recent() {
    const { data } = await apiClient.get<{ items: NotificationDto[]; unreadCount: number }>('/api/notifications/recent');
    return data;
  },
  async markRead(id: string) {
    await apiClient.post(`/api/notifications/${id}/read`);
  },
  async markAllRead() {
    await apiClient.post('/api/notifications/read-all');
  },
};

export const locationApi = {
  async update(latitude: number, longitude: number, label?: string) {
    await apiClient.post('/api/location', { latitude, longitude, label });
  },
  async mine() {
    const { data } = await apiClient.get<{ lat?: number; lng?: number; label?: string; updatedAt?: string }>('/api/location');
    return data;
  },
};
