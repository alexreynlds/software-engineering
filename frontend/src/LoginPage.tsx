import { useNavigate } from 'react-router';
import { Button } from './components/ui/button';

function LoginPage() {
  const navigate = useNavigate();
  return (
    <div className="bg-red-500 p-2">
      <h1>Hello, World!</h1>
      <Button
        onClick={() => {
          navigate('/dashboard');
        }}
      >
        Press me!
      </Button>
    </div>
  );
}

export default LoginPage;
