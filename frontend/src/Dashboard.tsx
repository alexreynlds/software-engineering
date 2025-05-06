import { useNavigate } from 'react-router';
import { Button } from './components/ui/button';

function Dashboard() {
  const navigate = useNavigate();
  return (
    <div className="bg-red-500 p-2">
      <h1>Dashboard</h1>
      <Button
        onClick={() => {
          navigate('/');
        }}
      >
        Login Page
      </Button>
    </div>
  );
}

export default Dashboard;

