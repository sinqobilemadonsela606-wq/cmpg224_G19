// src/components/auth/ProtectedRoute.jsx
// FR02 - Role-based access control
//
// Usage:
//   <ProtectedRoute>...</ProtectedRoute>                → any logged-in user
//   <ProtectedRoute role="admin">...</ProtectedRoute>   → admin only

import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

  function ProtectedRoute({ role, children }) {
  const { user, role: userRole, loading } = useAuth();

  // While auth state is still loading, show nothing (or a spinner)
  if (loading) return <p>Loading...</p>;

  // Not logged in → send to /login
  if (!user) return <Navigate to="/login" replace />;

  // Role required but doesn't match → send to home
  if (role && userRole !== role) return <Navigate to="/" replace />;

  // All good
  return children;
}

export default ProtectedRoute;