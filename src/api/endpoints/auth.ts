import { apiClient } from '@/api/client';
import type {
  LoginResponseDto,
  RegisterRequestDto,
  RegisterInitiatedResponseDto,
  TokenResponseDto,
  UserDto,
} from '@/types/api';

function getDeviceInfo(): string {
  // Kept simple/dependency-free; swap for `expo-device` (Device.modelName + Device.osVersion)
  // if you want richer session labels in the "manage devices" screen later.
  return 'Android device';
}

export const authApi = {
  async login(emailOrPhone: string, password: string) {
    const { data } = await apiClient.post<LoginResponseDto>('/api/auth/login', {
      emailOrPhone,
      password,
      deviceInfo: getDeviceInfo(),
    });
    return data;
  },

  async register(dto: RegisterRequestDto) {
    const { data } = await apiClient.post<RegisterInitiatedResponseDto>('/api/auth/register', dto);
    return data;
  },

  async registerVerify(registrationTicket: string, emailCode: string, mobileCode?: string) {
    const { data } = await apiClient.post<TokenResponseDto>('/api/auth/register/verify', {
      registrationTicket,
      emailCode,
      mobileCode: mobileCode ?? '',
    });
    return data;
  },

  async otpRequest(recipient: string) {
    const { data } = await apiClient.post('/api/auth/otp/request', { recipient });
    return data as { message: string; debugCode?: string; channel: 'email' | 'sms' };
  },

  async otpVerify(recipient: string, channel: 'email' | 'sms', code: string) {
    const { data } = await apiClient.post('/api/auth/otp/verify', {
      recipient,
      channel,
      code,
      deviceInfo: getDeviceInfo(),
    });
    return data as LoginResponseDto | TokenResponseDto;
  },

  async googleLogin(idToken: string) {
    const { data } = await apiClient.post<TokenResponseDto>('/api/auth/google', {
      idToken,
      deviceInfo: getDeviceInfo(),
    });
    return data;
  },

  async twoFactorChallenge(twoFactorToken: string, code: string) {
    const { data } = await apiClient.post<TokenResponseDto>('/api/auth/2fa/challenge', {
      twoFactorToken,
      code,
      deviceInfo: getDeviceInfo(),
    });
    return data;
  },

  async twoFactorEnroll(twoFactorToken: string) {
    const { data } = await apiClient.post('/api/auth/2fa/enroll', JSON.stringify(twoFactorToken), {
      headers: { 'Content-Type': 'application/json' },
    });
    return data as { twoFactorToken: string; secret: string; otpAuthUri: string; qrCodePngDataUri: string };
  },

  async twoFactorEnrollConfirm(twoFactorToken: string, code: string) {
    const { data } = await apiClient.post<TokenResponseDto>('/api/auth/2fa/enroll/confirm', {
      twoFactorToken,
      code,
      deviceInfo: getDeviceInfo(),
    });
    return data;
  },

  async logout(refreshToken: string) {
    await apiClient.post('/api/auth/logout', { refreshToken });
  },

  async me() {
    const { data } = await apiClient.get<UserDto>('/api/auth/me');
    return data;
  },

  async updateProfile(dto: {
    fullName: string;
    phoneNumber?: string;
    city?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  }) {
    const { data } = await apiClient.put<UserDto>('/api/auth/me', dto);
    return data;
  },

  async uploadPhoto(fileUri: string, fileName: string, mimeType: string) {
    const form = new FormData();
    // @ts-expect-error RN's FormData file shape isn't in the DOM lib types
    form.append('file', { uri: fileUri, name: fileName, type: mimeType });
    const { data } = await apiClient.post<{ profileImageUrl: string }>('/api/auth/me/photo', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async forgotPassword(email: string) {
    const { data } = await apiClient.post('/api/auth/forgot-password', { email });
    return data as { message: string };
  },

  async resetPassword(email: string, token: string, newPassword: string) {
    const { data } = await apiClient.post('/api/auth/reset-password', { email, token, newPassword });
    return data as { message: string };
  },
};
