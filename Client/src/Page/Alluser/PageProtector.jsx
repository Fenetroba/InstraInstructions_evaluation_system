import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const PageProtector = ({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/',
  requireAuth = true 
}) => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const isPasswordUpdatePage = location.pathname === '/change-password';

  useEffect(() => {
    if (!loading) {
      // If user is authenticated and using default password but not on password update page
      if (isAuthenticated && user?.data?.isDefaultPassword && !isPasswordUpdatePage) {
        navigate('/change-password');
        return;
      }

      // If authentication is required but user is not authenticated
      if (requireAuth && !isAuthenticated) {
        navigate(redirectTo);
        return;
      }

      // If user is authenticated but doesn't have required role
      if (isAuthenticated && allowedRoles.length > 0) {
        const hasRole = allowedRoles.includes(user?.data?.role);
       
      }
    }
  }, [isAuthenticated, user, allowedRoles, navigate, requireAuth, redirectTo]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If user is authenticated and not using default password, or is on password update page
  if ((isAuthenticated && !user?.data?.isDefaultPassword) || isPasswordUpdatePage) {
    // If role-based access is required, check permissions
    if (allowedRoles.length > 0) {
      const userRole = user?.role || user?.data?.role;
      const normalizedUserRole = userRole?.toLowerCase().replace(/\s+/g, '_');
      const normalizedAllowedRoles = allowedRoles.map(role => 
        role.toLowerCase().replace(/\s+/g, '_')
      );

      const hasPermission = normalizedAllowedRoles.includes(normalizedUserRole);
      return hasPermission ? <>{children}</> : null;
    }
    return <>{children}</>;
  }

  // If authentication is required but not authenticated, show nothing (will redirect)
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // If auth is not required, show the content
  if (!requireAuth) {
    return <>{children}</>;
  }

  return null;
};

export default PageProtector;

