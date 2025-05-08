import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_URL;

// This is the context for authentication
const AuthContext = createContext({
  user: null,
  loading: true,
  signIn: async (email: string, password: string) => { },
  signOut: async () => { },
});

// An Authentication Provider component that wraps the entire project
// and provides the authentication context to all components
//
// This allows users to login and logout
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/user`, {
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else if (res.status === 401) {
        setUser(null);
      } else {
        console.warn('Unexpected error fetching user:', res.status);
      }
    } catch (err) {
      console.error('Network error fetching user:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({email, password}),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Login failed');
    }

    await fetchUser();
  };

  const signOut = async () => {
    await fetch(`${API_BASE}/api/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    toast.success('Logged out successfully');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export default function useAuth() {
  return useContext(AuthContext);
}
