export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  RegisterVerify: { registrationTicket: string; email: string; phoneNumber?: string };
  OtpLogin: undefined;
  OtpVerify: { recipient: string; channel: 'email' | 'sms' };
  TwoFactorChallenge: { twoFactorToken: string; requiresEnrollment?: boolean };
  TwoFactorEnroll: { twoFactorToken: string };
  ForgotPassword: undefined;
  ResetPassword: { email: string };
};
