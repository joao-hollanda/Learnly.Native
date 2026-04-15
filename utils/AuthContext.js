import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import LoginAPI from '../services/LoginService';
import { startTokenRefresh, stopTokenRefresh } from '../utils/tokenRefresh';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(null);
  
  // 1. CRIAMOS O ESTADO DO USUÁRIO
  const [user, setUser] = useState(null); 

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const token = await SecureStore.getItemAsync('jwt');
      if (!token) {
        setAuthState(false);
        setUser(null);
        return;
      }
      
      const dadosUsuario = await LoginAPI.AuthCheck(); 
      
      setUser(dadosUsuario);
      setAuthState(true);
      startTokenRefresh();
    } catch {
      setAuthState(false);
      setUser(null);
    }
  }

  async function signIn(email, senha) {
    const resposta = await LoginAPI.Login(email, senha);
    
    setUser(resposta); 
    
    setAuthState(true);
    startTokenRefresh();
  }

  async function signOut() {
    try {
      stopTokenRefresh();
      await LoginAPI.Logout();
    } catch {
    } finally {
      await SecureStore.deleteItemAsync('jwt');
      setAuthState(false);
      setUser(null); 
    }
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