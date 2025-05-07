import './index.css';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { useState, useEffect } from 'react';
import useAuth from './hooks/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_URL;
console.log('API_BASE:', API_BASE);

// This is the login page component
//
// It is where the user is sent by default unless they have the JWT token
function LoginPage() {
  const navigate = useNavigate();
  const { signIn, user, loading } = useAuth();
  const [loginPage, setLoginPage] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard'); // or whatever your dashboard route is
    }
  }, [user, loading, navigate]);

  // Set the state for login information
  const [loginInfo, setLoginInfo] = useState({
    email: '',
    password: '',
  });

  // Set the state for register information
  const [registerInfo, setRegisterInfo] = useState({
    email: '',
    password: '',
    password1: '',
  });

  // Handle the change in the input fields for login and register
  // setting the login info to the values of the input fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePageChange = () => {
    setLoginPage((prev) => !prev);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { email, password } = loginInfo;

    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (error) {
      if (error instanceof Error) {
        toast.error('Login failed: ' + error.message);
      } else {
        toast.error('Login failed');
      }
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { email, password, password1 } = registerInfo;

    if (password !== password1) {
      toast.error('Passwords do not match');
      return;
    }

    const res = await fetch(`${API_BASE}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error('Registration failed: ' + data.error);
    } else {
      toast.success('Registration successful! You can now log in.');
      setLoginPage(true);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#272727] text-white">
      {loginPage && (
        <form
          onSubmit={handleLogin}
          className="flex h-[60%] min-w-[500px] flex-col items-center justify-between rounded-lg border-2 border-[#272727] bg-[#1e1e1e] p-8 shadow-lg"
        >
          <h1 className="text-2xl font-bold underline">LOG IN</h1>
          <p>{API_BASE}</p>
          <div className="flex w-full flex-col gap-4">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={loginInfo.email}
              onChange={handleChange}
            />
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={loginInfo.password}
              onChange={handleChange}
            />
          </div>
          <Button
            type="submit"
            className="cursor-pointer bg-[#272727] text-white hover:bg-[#1c1c1c]"
          >
            <span className="text-sm font-medium">Login</span>
          </Button>
          <a
            onClick={handlePageChange}
            className="cursor-pointer text-sm text-blue-500 hover:underline"
          >
            Don't have an account? Register here
          </a>
        </form>
      )}
      {!loginPage && (
        <form
          onSubmit={handleRegister}
          className="flex h-[60%] min-w-[500px] flex-col items-center justify-between rounded-lg border-2 border-[#272727] bg-[#1e1e1e] p-8 shadow-lg"
        >
          <h1 className="text-2xl font-bold underline">Register</h1>
          <div className="flex w-full flex-col gap-4">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={registerInfo.email}
              onChange={handleRegisterChange}
            />
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={registerInfo.password}
              onChange={handleRegisterChange}
            />
            <Label htmlFor="password1" className="text-sm font-medium">
              Confirm Password
            </Label>
            <Input
              id="password1"
              name="password1"
              type="password"
              value={registerInfo.password1}
              onChange={handleRegisterChange}
            />
          </div>
          <Button
            type="submit"
            className="cursor-pointer bg-[#272727] text-white hover:bg-[#1c1c1c]"
          >
            <span className="text-sm font-medium">Register</span>
          </Button>
          <a
            onClick={handlePageChange}
            className="cursor-pointer text-sm text-blue-500 hover:underline"
          >
            Already have an account? Log in here
          </a>
        </form>
      )}
    </div>
  );
}

export default LoginPage;
