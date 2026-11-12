import React, { createContext, useContext, useEffect, useRef } from 'react';
import { HubConnection } from '@microsoft/signalr';
import { createHubConnection } from '@/realtime/signalr';
import { SimpleEmitter } from '@/realtime/SimpleEmitter';
import { HUB_URLS } from '@/config/env';
import { useAuth } from '@/auth/AuthContext';
import type { SlotTakenOfferDto } from '@/types/api';

export interface IncomingNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
}

const notificationEmitter = new SimpleEmitter<IncomingNotification>();
export function onIncomingNotification(listener: (n: IncomingNotification) => void) {
  return notificationEmitter.subscribe(listener);
}

const slotOfferEmitter = new SimpleEmitter<SlotTakenOfferDto>();
export function onSlotTakenOffer(listener: (offer: SlotTakenOfferDto) => void) {
  return slotOfferEmitter.subscribe(listener);
}

const NotificationsHubContext = createContext<HubConnection | null>(null);

export function NotificationsHubProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const connectionRef = useRef<HubConnection | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      connectionRef.current?.stop();
      connectionRef.current = null;
      return;
    }

    const connection = createHubConnection(HUB_URLS.notifications);
    connection.on('ReceiveNotification', (n: IncomingNotification) => notificationEmitter.emit(n));
    connection.on('SlotTakenOfferNext', (offer: SlotTakenOfferDto) => slotOfferEmitter.emit(offer));

    connection.start().catch((err) => {
      console.warn('Notifications hub failed to connect', err);
    });

    connectionRef.current = connection;

    return () => {
      connection.stop();
      connectionRef.current = null;
    };
  }, [isAuthenticated]);

  return (
    <NotificationsHubContext.Provider value={connectionRef.current}>
      {children}
    </NotificationsHubContext.Provider>
  );
}

export function useNotificationsHubConnection() {
  return useContext(NotificationsHubContext);
}
