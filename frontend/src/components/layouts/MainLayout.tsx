import { ReactNode, useState, useEffect } from 'react';
import useAuth from '@/hooks/auth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { FaCog } from 'react-icons/fa';
import { HiOutlineLogout } from 'react-icons/hi';
import ThemeProvider from './ThemeProvider';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Props {
  children: ReactNode;
}

// The main layout component that wraps the main content of the application
function MainLayout({ children }: Props) {
  const { user, signOut } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [username, setUsername] = useState('');
  const token = localStorage.getItem('token');

  // Fetch the user's settings (dark mode and username) when the component mounts
  useEffect(() => {
    const fetchSettings = async () => {
      const res = await fetch('http://localhost:5050/api/settings', {
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setDarkMode(data.dark_mode);
        setUsername(data.username || '');
      } else {
        console.warn('No settings found or user not logged in');
      }
    };

    if (user) {
      fetchSettings();
    }
  }, [user]);

  // Function to log the user out, redirecting them to the home page
  const handleLogout = async () => {
    await signOut();
    window.location.href = '/';
  };

  // Function to toggle the settings sidebar
  const toggleSettings = () => {
    setSettingsOpen((prev) => !prev);
  };

  // Function to save the settings
  const saveSettings = async () => {
    const res = await fetch('http://localhost:5050/api/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ dark_mode: darkMode, username }),
    });

    if (res.ok) {
      toast.success('Settings saved successfully!');
      const refetch = await fetch('http://localhost:5050/api/settings', {
        credentials: 'include',
      });
      if (refetch.ok) {
        const data = await refetch.json();
        setDarkMode(data.dark_mode);
        setUsername(data.username || '');
      }
    } else {
      toast.error('Failed to save settings');
    }
  };

  const deleteAccount = async () => {
    const res = await fetch('http://localhost:5050/api/register', {
      method: 'DELETE',
      credentials: 'include',
    });

    if (res.ok) {
      toast.success('Account deleted successfully!');
      await signOut();
      window.location.href = '/';
    } else {
      toast.error('Failed to delete account');
    }
  };

  return (
    <>
      {/* Theme provider to manage dark/light mode */}

      <ThemeProvider dark={darkMode} />
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-white text-black dark:bg-[#11121E] dark:text-white">
        {/* "Navigation" Bar - its not really a nav bar but y'know */}
        <nav className="z-20 flex w-full flex-col items-center justify-between gap-4 px-6 py-4 shadow md:flex-row dark:bg-[#1E2938]">
          {/* Display a welcome message to the user with either their email or set username  */}
          <Button className="flex w-full items-center gap-2 bg-indigo-500 hover:bg-indigo-500 md:w-auto">
            <h1>Welcome, {username || user?.email}!</h1>
          </Button>
          {/* Settings and Logout buttons */}
          <div className="flex w-full justify-between gap-4 md:w-auto md:items-center">
            <Button
              className="flex w-[45%] cursor-pointer items-center gap-2 bg-indigo-500 hover:bg-[#4E4CCB] md:w-auto"
              onClick={toggleSettings}
            >
              <FaCog />
              Settings
            </Button>
            <Button
              onClick={handleLogout}
              className="w-[45%] cursor-pointer bg-indigo-500 hover:bg-[#4E4CCB] md:w-auto"
            >
              <HiOutlineLogout />
              Logout
            </Button>
          </div>
        </nav>

        <div className="relative flex flex-1">
          {/* Main Content */}
          <main className="w-full bg-gray-100 p-10 dark:bg-[#11121E]">
            {children}
          </main>

          {/* Overlay for the settings sidebar */}
          {/* Covers the rest of the screen under the settings to when a user clicks out of it it closes */}
          <div
            className={`z-9 absolute inset-0 left-0 top-0 bg-black transition-opacity duration-300 ease-in-out ${settingsOpen ? 'opacity-50' : 'pointer-events-none opacity-0'
              }`}
            onClick={toggleSettings}
          ></div>
          {/* Settings Sidebar */}
          <div
            className={`absolute right-0 top-0 z-10 h-full w-[300px] transform border-l bg-white shadow-lg transition-transform duration-300 ease-in-out dark:border-[#444] dark:bg-[#1E2938] ${settingsOpen ? 'translate-x-0' : 'translate-x-full'}`}
          >
            <div className="flex h-full flex-col space-y-4 p-4">
              <h2 className="text-lg font-semibold underline">Settings</h2>
              {/* Dark mode setting */}
              <div className="flex items-center justify-between">
                <label htmlFor="darkMode" className="mb-1 block text-sm">
                  Dark Mode
                </label>
                <Switch
                  id="darkMode"
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                  className="cursor-pointer"
                />
              </div>
              {/* Username setting */}
              <div>
                <label htmlFor="username" className="mb-1 block text-sm">
                  Username
                </label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full"
                />
              </div>
              {/* Save settings button */}
              <Button
                onClick={saveSettings}
                className="mt-4 w-full cursor-pointer"
              >
                Save Settings
              </Button>
              <AlertDialog>
                <AlertDialogTrigger className="mt-auto w-full cursor-pointer rounded-md bg-red-500 px-[16px] py-[8px] text-[14px] text-white hover:bg-red-600">
                  Delete Account
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your account and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={deleteAccount}>
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MainLayout;
