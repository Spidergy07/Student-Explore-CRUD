import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';

interface User {
  id: number;
  username: string;
  role: string; // 'student', 'teacher', or other roles
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  // login function now primarily sets user state post-API call
  updateUserAfterLogin: (userData: User) => void; 
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>; // Function to check auth status on app load
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true

  // This function is called after a successful API login
  const updateUserAfterLogin = (userData: User) => {
    setUser(userData);
    // No need to manage token here, httpOnly cookie is handled by browser
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'GET', 
      });
      if (!response.ok) {
        console.error('Backend logout failed:', await response.text());
      }
    } catch (error) {
      console.error('Error during logout API call:', error);
    }
    setUser(null);
    // No token to remove from localStorage specifically for auth, browser handles cookie.
    // Any other cleanup can happen here.
    setIsLoading(false);
  };

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include', 
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success' && data.data.user) {
          setUser(data.data.user);
        } else {
          setUser(null);
          if (data.status === 'fail') {
            console.log('checkAuth: No active session or user not found.');
          } else {
            console.warn('checkAuth: Received OK response but unexpected data structure:', data);
          }
        }
      } else {
        setUser(null);
        if (response.status !== 401) {
            console.warn(`checkAuth: API call failed with status ${response.status}`, await response.text());
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, isLoading, updateUserAfterLogin, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 