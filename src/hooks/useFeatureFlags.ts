import { useQuery } from '@tanstack/react-query';
import { configApi, type FeatureFlagsDto } from '@/api/endpoints/config';

const defaultFeatures: FeatureFlagsDto = {
  onlinePaymentEnabled: false,
  productsEnabled: true,
  earningsFinancialsEnabled: true,
  googleLoginEnabled: true,
  emailOtpLoginEnabled: true,
  smsOtpLoginEnabled: false,
  mapsEnabled: false,
  pushEnabled: false,
  superAdminTwoFactorEnabled: true,
};

export function useFeatureFlags() {
  const { data } = useQuery<FeatureFlagsDto>({
    queryKey: ['feature-flags'],
    queryFn: () => configApi.getFeatures(),
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });

  return data ?? defaultFeatures;
}
