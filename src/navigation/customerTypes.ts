export type HomeStackParamList = {
  Home: undefined;
  BarbersList: undefined;
  BarberDetails: { barberId: string };
  Booking: { barberId: string; serviceId: string };
  Notifications: undefined;
  ChatConversation: { otherUserId: string; otherUserName: string };
};

export type BookingsStackParamList = {
  MyBookings: undefined;
  ChatConversation: { otherUserId: string; otherUserName: string };
};

export type ShopStackParamList = {
  ProductsList: undefined;
  ProductDetails: { productId: string };
  Cart: undefined;
  Checkout: undefined;
  Orders: undefined;
};

export type ChatStackParamList = {
  ChatContacts: undefined;
  ChatConversation: { otherUserId: string; otherUserName: string };
};

export type ProfileStackParamList = {
  Profile: undefined;
};
