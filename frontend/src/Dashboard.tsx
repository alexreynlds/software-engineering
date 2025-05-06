import { useNavigate } from 'react-router';
import { Button } from './components/ui/button';
import useAuth from './hooks/auth';

function Dashboard() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <div className="bg-red-500 p-2">
      <h1>Dashboard</h1>
      <Button
        onClick={() => {
          handleLogout();
        }}
      >
        Logout
      </Button>
    </div>
  );
}

export default Dashboard;
