export type UserRole = 'User' | 'Admin' | 'SuperAdmin';

export interface UserDto {
  id: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  role: UserRole;
  profileImageUrl?: string;
  city?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  shopName?: string;
  shopDescription?: string;
  approvalStatus?: 'NotApplicable' | 'Pending' | 'Approved' | 'Rejected';
  approvalRejectionReason?: string;
  weeklyHoliday?: number; // DayOfWeek: 0=Sunday..6=Saturday
  openingTime?: string;   // "HH:mm:ss"
  closingTime?: string;
  twoFactorEnabled: boolean;
}

export interface TokenResponseDto {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  user: UserDto;
}

export interface LoginResponseDto {
  requires2fa: boolean;
  twoFactorToken?: string;
  requiresTwoFactorEnrollment?: boolean;
  tokens?: TokenResponseDto;
}

export interface RegisterRequestDto {
  fullName: string;
  email: string;
  phoneNumber?: string;
  password: string;
  city?: string;
  isBarber: boolean;
  shopName?: string;
  shopDescription?: string;
  address?: string;
}

export interface RegisterInitiatedResponseDto {
  registrationTicket: string;
  message: string;
  debugEmailCode?: string;
  debugSmsCode?: string;
}

export interface ApiErrorBody {
  error?: string;
  errors?: string[];
}

// ---------- Barbers ----------

export interface BarberCardDto {
  id: string;
  fullName: string;
  shopName?: string;
  profileImageUrl?: string;
  city?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
  rating?: number;
}

export interface BarberHomeFeedDto {
  source?: number | string;
  locationSource?: 'Live' | 'Saved' | 'City' | 'Featured' | string;
  label?: string;
  barbers?: BarberCardDto[];
  items?: BarberCardDto[];
}

export interface ServiceDto {
  id: string;
  name: string;
  description?: string;
  category?: string;
  price: number;
  durationMinutes: number;
  isActive?: boolean;
  createdAt?: string;
}

export interface LeaveDayInfoDto {
  leaveDate: string;
  reason?: string;
}

export interface BarberDetailsDto {
  id: string;
  fullName: string;
  shopName?: string;
  shopDescription?: string;
  profileImageUrl?: string;
  address?: string;
  city?: string;
  phoneNumber?: string;
  latitude?: number;
  longitude?: number;
  weeklyHoliday?: number;
  openingTime?: string;
  closingTime?: string;
  services: ServiceDto[];
  leaveDates?: string[];
  upcomingLeaveDays?: LeaveDayInfoDto[];
}

export interface SlotInfo {
  time: string; // "HH:mm"
  status: 'Available' | 'Queued' | 'Booked';
  queueCount: number;
}

export interface AvailableSlotsDto {
  date: string;
  isHoliday?: boolean;
  isLeaveDay?: boolean;
  slots?: string[]; // "HH:mm"
  availableSlots?: string[];
  slotStatuses?: SlotInfo[];
}

export type BookingStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Completed' | 'Cancelled';

export function normalizeBookingStatus(status: any): BookingStatus {
  if (typeof status === 'string') {
    const s = status.trim();
    if (s === '0' || s.toLowerCase() === 'pending') return 'Pending';
    if (s === '1' || s.toLowerCase() === 'accepted') return 'Accepted';
    if (s === '2' || s.toLowerCase() === 'rejected') return 'Rejected';
    if (s === '3' || s.toLowerCase() === 'completed') return 'Completed';
    if (s === '4' || s.toLowerCase() === 'cancelled') return 'Cancelled';
  } else if (typeof status === 'number') {
    switch (status) {
      case 0: return 'Pending';
      case 1: return 'Accepted';
      case 2: return 'Rejected';
      case 3: return 'Completed';
      case 4: return 'Cancelled';
    }
  }
  return 'Pending';
}

export interface BookingListItemDto {
  id: string;
  barberId: string;
  barberName: string;
  shopName: string;
  userId: string;
  userName: string;
  userPhone: string;
  serviceName: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  slotQueuePosition?: number;
  totalAmount: number;
  notes?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface CreateBookingDto {
  barberId: string;
  serviceId: string;
  appointmentDate: string;
  startTime: string;
  notes?: string;
}

export interface CreateBookingResponseDto {
  bookingId: string;
  slotQueuePosition: number;
  isQueued: boolean;
  message: string;
}

export interface ShiftBookingSlotDto {
  bookingId: string;
  newStartTime: string;
  newAppointmentDate?: string;
}

export interface SlotTakenOfferDto {
  bookingId: string;
  barberId: string;
  barberName: string;
  shopName: string;
  serviceId: string;
  serviceName: string;
  date: string;
  oldSlot: string;
  nextAvailableSlot?: string;
  nextAvailableSlotEnd?: string;
  totalAmount: number;
}

export interface QueuePositionDto {
  bookingId: string;
  status: BookingStatus;
  position: number | null;
  peopleAhead: number;
}

// ---------- Products / Cart / Orders ----------

export interface ProductListItemDto {
  id: string;
  name: string;
  description?: string;
  price: number;
  discountPercentage?: number;
  effectivePrice: number;
  stockQuantity: number;
  imageUrl?: string;
  category: string;
  barberName: string;
  barberId: string;
  isActive: boolean;
}

export interface EditProductDto {
  id?: string;
  name: string;
  description?: string;
  price: number;
  costPrice?: number;
  discountPercentage?: number;
  stockQuantity: number;
  category: string;
  existingImageUrl?: string;
  isActive: boolean;
}

export interface ProductFinancialRow {
  productId: string;
  productName: string;
  unitsSold: number;
  totalRevenue: number;
  totalCost: number;
  netProfit: number;
  profitMarginPercentage: number;
  currentStock: number;
  sellingPrice: number;
  costPrice?: number;
}

export interface DailyProductEarningRow {
  date: string;
  unitsSold: number;
  revenue: number;
  cost: number;
  profit: number;
}

export interface DailyEarningRow {
  date: string;
  bookingsCount: number;
  amount: number;
}

export interface ServiceEarningRow {
  serviceName: string;
  count: number;
  amount: number;
}

export interface EarningsDto {
  // Service Earnings
  serviceTotalEarnings: number;
  serviceTodayEarnings: number;
  serviceThisWeekEarnings: number;
  serviceThisMonthEarnings: number;
  serviceTotalCompleted: number;
  serviceTotalAccepted: number;
  dailyBreakdown: DailyEarningRow[];
  byService: ServiceEarningRow[];

  // Compatibility aliases
  totalEarnings: number;
  todayEarnings: number;
  thisWeekEarnings: number;
  thisMonthEarnings: number;
  totalCompleted: number;
  totalAccepted: number;

  // Product Selling Financials
  productTotalRevenue?: number;
  productTodayRevenue?: number;
  productThisWeekRevenue?: number;
  productThisMonthRevenue?: number;
  productTotalCost?: number;
  productNetProfit?: number;
  productProfitMarginPercentage?: number;
  productTotalUnitsSold?: number;
  productTotalOrders?: number;
  byProduct?: ProductFinancialRow[];
  productDailyBreakdown?: DailyProductEarningRow[];

  // Combined overview
  combinedTotalRevenue?: number;
  combinedTotalProfit?: number;
}

export interface CartItemDto {
  id: string;
  productId: string;
  productName: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  stockQuantity: number;
}

export interface CartSummaryDto {
  items: CartItemDto[];
  subTotal: number;
  tax: number;
  total: number;
  itemCount: number;
}

export type PaymentMethod = 'Online' | 'CashOnDelivery';
export type OrderStatus = 'Pending' | 'Paid' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface CheckoutDto {
  shippingAddress: string;
  paymentMethod: PaymentMethod;
}

export interface CheckoutResultDto {
  orderId: string;
  clientSecret: string;
  isCod: boolean;
  message: string;
}

export interface OrderItemDto {
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderListItemDto {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus?: string;
  createdAt: string;
  itemCount: number;
  userName: string;
  userEmail: string;
  shippingAddress?: string;
  items: OrderItemDto[];
}

// ---------- Chat ----------

export interface ChatMessageDto {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  sentAt: string;
  isRead: boolean;
}

export interface ChatContactDto {
  userId: string;
  fullName: string;
  profileImageUrl?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

// ---------- Notifications ----------

export interface NotificationDto {
  id: string;
  type: string;
  title: string;
  message: string;
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
}
