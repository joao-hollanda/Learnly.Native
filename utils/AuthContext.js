import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import LoginAPI from '../services/LoginService';
import { HTTPClient } from '../services/client';
import { startTokenRefresh, stopTokenRefresh } from '../utils/tokenRefresh';

const AuthContext = createContext(null);

const TOKEN_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(null); // null = loading, true = autenticado, false = não autenticado
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!token) {
        setAuthState(false);
        setUser(null);
        return;
      }

      HTTPClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const dadosUsuario = await LoginAPI.GetUser();
      setUser(dadosUsuario);
      setAuthState(true);
      startTokenRefresh();
    } catch {
      try {
        await _tryRefresh();
      } catch {
        await _clearSession();
      }
    }
  }

  async function _tryRefresh() {
    const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
    if (!refreshToken) throw new Error('Sem refresh token');

    const { accessToken, refreshToken: newRefresh } = await LoginAPI.RefreshTokenMobile(refreshToken);

    await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_KEY, newRefresh);

    HTTPClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    const dadosUsuario = await LoginAPI.GetUser();
    setUser(dadosUsuario);
    setAuthState(true);
    startTokenRefresh();
  }

  async function _clearSession() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
    delete HTTPClient.defaults.headers.common['Authorization'];
    setAuthState(false);
    setUser(null);
  }

  async function signIn(email, senha) {
    const { accessToken, refreshToken } = await LoginAPI.Login(email, senha);

    await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_KEY, refreshToken);

    HTTPClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    const dadosUsuario = await LoginAPI.GetUser();
    setUser(dadosUsuario);
    setAuthState(true);
    startTokenRefresh();
  }

  async function signOut() {
    stopTokenRefresh();
    await _clearSession();
  }

  return (
    <AuthContext.Provider value={{ authState, user, signIn, signOut, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}