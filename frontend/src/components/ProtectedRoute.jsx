import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-vh-100 bg-black-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-maroon-700"></div>
      </div>
    );
  }

  // Redirect to first login password change if needed
  if (user && user.isFirstLogin && window.location.pathname !== '/setup-password') {
    return <Navigate to="/setup-password" />;
  }

  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
