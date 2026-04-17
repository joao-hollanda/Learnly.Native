import * as SecureStore from 'expo-secure-store';
import LoginAPI from '../services/LoginService';
import { HTTPClient } from '../services/client';

const TOKEN_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

let refreshTimer = null;

const REFRESH_INTERVAL = 50 * 60 * 1000;

export function startTokenRefresh() {
  if (refreshTimer) clearInterval(refreshTimer);

  refreshTimer = setInterval(async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
      if (!refreshToken) {
        stopTokenRefresh();
        return;
      }

      const { accessToken, refreshToken: newRefresh } = await LoginAPI.RefreshTokenMobile(refreshToken);

      await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
      await SecureStore.setItemAsync(REFRESH_KEY, newRefresh);

      HTTPClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    } catch (error) {
      console.error('Erro ao renovar token automaticamente:', error);
      stopTokenRefresh();
    }
  }, REFRESH_INTERVAL);
}

export function stopTokenRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
}