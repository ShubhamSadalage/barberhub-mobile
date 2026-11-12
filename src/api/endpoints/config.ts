import { apiClient } from '@/api/client';

export interface FeatureFlagsDto {
  onlinePaymentEnabled: boolean;
  productsEnabled: boolean;
  earningsFinancialsEnabled: boolean;
  googleLoginEnabled: boolean;
  emailOtpLoginEnabled: boolean;
  smsOtpLoginEnabled: boolean;
  mapsEnabled: boolean;
  pushEnabled: boolean;
  superAdminTwoFactorEnabled: boolean;
}

export const configApi = {
  async getFeatures(): Promise<FeatureFlagsDto> {
    const { data } = await apiClient.get<FeatureFlagsDto>('/api/config/features');
    return data;
  },
};
