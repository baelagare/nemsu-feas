import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  TOKEN_STORAGE_KEY,
  loginWithCredentials,
  getCurrentUser,
  logoutUser,
} from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Bootstrap session on page load if token is present
  useEffect(() => {
    const bootstrapAuth = async () => {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await getCurrentUser();
        if (response?.data) {
          setUser(response.data);
        } else {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          setUser(null);
        }
      } catch (err) {
        // Token invalid or expired
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  /**
   * Log in via institutional email / staff ID and password.
   */
  const login = async (identifier, password) => {
    setIsLoading(true);
    try {
      const response = await loginWithCredentials(identifier, password);
      if (response?.success && response?.data) {
        const { token, user: authenticatedUser } = response.data;
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
        setUser(authenticatedUser);
        return { success: true, user: authenticatedUser };
      }

      return {
        success: false,
        error: response?.message || 'Authentication failed. Please verify your credentials.',
      };
    } catch (err) {
      return {
        success: false,
        error: err.message || 'Authentication failed. Please check your credentials.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Log out and revoke session token.
   */
  const logout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      // Ignore network errors during sign out
    } finally {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
