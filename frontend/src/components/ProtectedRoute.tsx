import { Navigate } from "react-router-dom";
import useAuth from "@/hooks/auth";

// This components wrappes a route in the router
// and only allows the user to access it if they are authenticated
// otherwise, it sends them back to the login page
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-white p-4">Loading...</div>;
  }

  return user ? children : <Navigate to="/" />;
};


export default ProtectedRoute;

