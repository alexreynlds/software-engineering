import { createContext, useState, useEffect, useContext } from 'react';

// This is the context for authentication
const AuthContext = createContext({
  user: null,
  loading: true,
  signIn: async (email, password) => {},
  signOut: async () => {},
});

// An Authentication Provider component that wraps the entire project
// and provides the authentication context to all components
//
// This allows users to login and logout
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await fetch('http://localhost:5050/api/user', {
        credentials: 'include', 
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const signIn = async (email, password) => {
    const res = await fetch('http://localhost:5050/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Login failed');
    }

    // After login, cookie is automatically stored
    await fetchUser();
  };

  const signOut = async () => {
    await fetch('http://localhost:5050/api/logout', {
      method: 'POST',
      credentials: 'include',
    });
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

