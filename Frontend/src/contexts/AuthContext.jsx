import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext({});

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Configure axios defaults
axios.defaults.withCredentials = true;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/auth/me`);
      
      if (response.data.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.log('User not authenticated');
      setUser(null);
      setIsAuthenticated(false);
      
      // Only try to refresh token if we get a 401 AND there might be a refresh token
      // Check if there are any cookies before attempting refresh
      if (error.response?.status === 401 && document.cookie.includes('refreshToken')) {
        await attemptTokenRefresh();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const attemptTokenRefresh = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {}, {
        withCredentials: true
      });
      
      if (response.data.success) {
        // Token refreshed successfully, check auth status again
        await checkAuthStatus();
      }
    } catch (error) {
      console.log('Token refresh failed');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const login = () => {
    // Redirect to backend Google OAuth
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  };

  const logout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/auth/logout`);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      // Redirect to home page
      window.location.href = '/';
    }
  };

  // Axios interceptor to handle token refresh automatically
  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await attemptTokenRefresh();
            // Retry the original request
            return axios(originalRequest);
          } catch (refreshError) {
            // Refresh failed, logout user
            setUser(null);
            setIsAuthenticated(false);
            window.location.href = '/';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Hook to mimic Clerk's useUser hook
export const useUser = () => {
  const { user, isLoading } = useAuth();
  return {
    user,
    isLoaded: !isLoading,
    isSignedIn: !!user,
  };
};

// Components to mimic Clerk's conditional rendering
export const SignedIn = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return null;
  return isAuthenticated ? children : null;
};

export const SignedOut = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return null;
  return !isAuthenticated ? children : null;
};

// Component to mimic Clerk's SignOutButton
export const SignOutButton = ({ children, ...props }) => {
  const { logout } = useAuth();
  
  return (
    <button onClick={logout} {...props}>
      {children || 'Sign Out'}
    </button>
  );
};
