import { getApiBaseUrl } from '@/utils/api-base-url';

/**
 * Service to keep the backend alive by pinging the health endpoint
 * This helps prevent cold starts on hosted services like Render
 */
export class KeepAliveService {
  private static readonly HEALTH_ENDPOINT = '/health';
  private static hasInitialPingCompleted = false;

  /**
   * Ping the backend health endpoint to keep it alive
   * @returns Promise<boolean> - true if ping was successful, false otherwise
   */
  static async pingBackend(): Promise<boolean> {
    try {
      const baseUrl = getApiBaseUrl();
      const healthUrl = `${baseUrl}${this.HEALTH_ENDPOINT}`;
      
      console.log('[KeepAlive] Pinging backend:', healthUrl);
      
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Don't wait too long for the ping
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[KeepAlive] Backend ping successful:', data);
        return true;
      } else {
        console.warn('[KeepAlive] Backend ping failed with status:', response.status);
        return false;
      }
    } catch (error) {
      // Don't log errors in production to avoid console noise for users
      if (import.meta.env.DEV) {
        console.warn('[KeepAlive] Backend ping failed:', error);
      }
      return false;
    }
  }

  /**
   * Initialize keep-alive on app startup
   * Only pings once per app session to avoid unnecessary requests
   */
  static async initializeOnAppStart(): Promise<void> {
    // Skip if we've already done the initial ping
    if (this.hasInitialPingCompleted) {
      return;
    }

    // Skip in development to avoid unnecessary local pings
    if (import.meta.env.DEV) {
      console.log('[KeepAlive] Skipping ping in development mode');
      this.hasInitialPingCompleted = true;
      return;
    }

    // Only ping in production when we have a real backend URL
    const baseUrl = getApiBaseUrl();
    if (!baseUrl) {
      console.log('[KeepAlive] No backend URL configured, skipping ping');
      this.hasInitialPingCompleted = true;
      return;
    }

    console.log('[KeepAlive] Initializing backend ping...');
    
    // Fire and forget - don't block app startup
    this.pingBackend()
      .then((success) => {
        const message = success 
          ? '[KeepAlive] Initial backend ping completed successfully'
          : '[KeepAlive] Initial backend ping failed, but app will continue';
        console.log(message);
      })
      .catch((error) => {
        // Silent fail - we don't want to break the app if ping fails
        if (import.meta.env.DEV) {
          console.warn('[KeepAlive] Initial ping error:', error);
        }
      })
      .finally(() => {
        this.hasInitialPingCompleted = true;
      });
  }
}
