import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from '../../services/authService';

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication. If the user is not authenticated,
 * redirects them to the login page.
 */
const ProtectedRoute = () => {
  if (!isAuthenticated()) {
    // Redirect to the login page, replacing the current history entry
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
