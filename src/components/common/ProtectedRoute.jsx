import { Navigate, Outlet, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

const ROLE_HOME = { restaurant: '/restaurant', ngo: '/ngo', admin: '/admin' };

export const ProtectedRoute = ({ allowedRole }) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner fullScreen label="Checking session…" />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (allowedRole && role && role !== allowedRole) {
    return <Navigate to={ROLE_HOME[role] ?? '/'} replace />;
  }
  return <Outlet />;
};

ProtectedRoute.propTypes = { allowedRole: PropTypes.oneOf(['restaurant', 'ngo', 'admin']) };
