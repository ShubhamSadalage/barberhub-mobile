export type DashboardStackParamList = {
  Dashboard: undefined;
  Services: undefined;
  ServiceForm: { serviceId?: string } | undefined;
  Earnings: undefined;
  LeaveDays: undefined;
  Customers: undefined;
  CreateBookingOnBehalf: undefined;
};

export type BarberBookingsStackParamList = {
  BookingsManage: undefined;
};

export type BarberProductsStackParamList = {
  ProductsManage: undefined;
  ProductForm: { productId?: string } | undefined;
  OrdersManage: undefined;
};

export type BarberProfileStackParamList = {
  BarberProfile: undefined;
};
