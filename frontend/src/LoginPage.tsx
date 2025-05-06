import './index.css';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { useState } from 'react';
import useAuth from './hook/Auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

function LoginPage() {
  const navigate = useNavigate();

  // Variables to store the login info typed into the inputs
  const [loginInfo, setLoginInfo] = useState({
    email: '',
    password: '',
  });

  // Handle the change in the input fields for login and register
  // setting the login info to the values of the input fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    toast.success('Login successful!');
    navigate('/dashboard');
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#272727] text-white">
      <form
        onSubmit={handleLogin}
        className="flex h-[60%] min-w-[500px] flex-col items-center justify-between rounded-lg border-2 border-[#272727] bg-[#1e1e1e] p-8 shadow-lg"
      >
        <h1 className="text-2xl font-bold underline">LOG IN</h1>
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
      </form>
    </div>
  );
}

export default LoginPage;
