import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { tokenStorage } from '@/auth/tokenStorage';

/**
 * Creates (but does not start) a SignalR connection to the given hub URL.
 * accessTokenFactory supplies the JWT on both the negotiate handshake (as a
 * header) and the WebSocket upgrade (as the `access_token` query param the
 * API's JwtBearerEvents.OnMessageReceived reads — see Program.cs).
 */
export function createHubConnection(hubUrl: string): HubConnection {
  return new HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: async () => (await tokenStorage.getAccessToken()) ?? '',
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(LogLevel.Warning)
    .build();
}
