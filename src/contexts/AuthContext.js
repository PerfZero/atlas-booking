'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { checkAuth, logout as logoutApi } from '../lib/wordpress-api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем есть ли сохраненный токен
    const token = localStorage.getItem('atlas_token');
    if (token) {
      // Проверяем токен на беке
      checkAuth(token).then(result => {
        if (result.success && result.authenticated) {
          const userData = {
            phone: result.user.phone,
            name: `Пользователь ${result.user.phone.slice(-4)}`,
            token: token
          };
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          // Токен недействителен, удаляем его
          localStorage.removeItem('atlas_token');
        }
        setLoading(false);
      }).catch(error => {
        console.error('Ошибка проверки токена:', error);
        localStorage.removeItem('atlas_token');
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('atlas_token', userData.token);
    localStorage.setItem('atlas_user', JSON.stringify(userData));
  };

  const logout = async () => {
    if (user?.token) {
      try {
        await logoutApi(user.token);
      } catch (error) {
        console.error('Ошибка при выходе:', error);
      }
    }
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('atlas_token');
    localStorage.removeItem('atlas_user');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
}
