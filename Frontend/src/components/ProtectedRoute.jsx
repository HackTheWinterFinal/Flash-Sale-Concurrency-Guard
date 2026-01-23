import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// This component protects routes based on authentication and role
export default function ProtectedRoute({ children, role }) {

  const { user, loading } = useAuth();

  const location = useLocation();

  if (loading) {
    return <div className="text-white text-center mt-20">Loading...</div>;
  }

  // If user is not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a role is required and user's role does not match, redirect to home
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  // If authentication and role checks pass, render the protected component
  return children;
}
