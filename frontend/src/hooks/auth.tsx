import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  signIn: async (email, password) => {},
  signOut: async () => {},
});

// This component provides authentication context to the rest of the app
// It fetches the user data from the server and stores it in local storage
// It also provides signIn and signOut functions to the rest of the app
// It uses the useContext hook to provide the context to the rest of the app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    // attempts to fetch the token from local storage - allowing the user to automatically login if they already have
    const tokenInStorage = localStorage.getItem('token');
    // if not - set to null unti the user has logged in
    if (!tokenInStorage) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    // Attempt to fetch the user data from the server with the provided token
    try {
      const res = await fetch('http://localhost:5050/api/user', {
        headers: { Authorization: `Bearer ${tokenInStorage}` },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setToken(tokenInStorage);
      } else {
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);
  //
  // Function to sign in the user using an email and password
  const signIn = async (email, password) => {
    const res = await fetch('http://localhost:5050/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Login failed');
    }

    const { token } = await res.json();
    localStorage.setItem('token', token);
    await fetchUser();
  };

  // Function to sign out the user and remove the token from local storage
  const signOut = async () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export default function useAuth() {
  return useContext(AuthContext);
}

