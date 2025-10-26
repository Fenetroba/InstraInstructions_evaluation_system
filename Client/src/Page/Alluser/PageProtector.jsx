import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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

  useEffect(() => {
    if (!loading) {
      // If authentication is required but user is not authenticated
      if (requireAuth && !isAuthenticated) {
        navigate('/', { replace: true });
        return;
      }

      // If user is authenticated but doesn't have required role
      if (requireAuth && isAuthenticated && allowedRoles.length > 0) {
        const userRole = user?.role || user?.data?.role;
        
        // Normalize role names (handle variations like quality_officer, quality_officer)
        const normalizedUserRole = userRole?.toLowerCase().replace(/\s+/g, '_');
        const normalizedAllowedRoles = allowedRoles.map(role => 
          role.toLowerCase().replace(/\s+/g, '_')
        );

        const hasPermission = normalizedAllowedRoles.includes(normalizedUserRole);
        
        if (!hasPermission) {
          // Redirect to appropriate home page based on role, or to default page
          const roleHomePages = {
            'quality_officer': '/quality-office-home',
            'instructor': '/instractor-home',
            'department_head': '/department-head-home',
            'college_dean': '/college-dean-home',
            'vice_academy': '/vice-academy-home',
            'human_resours': '/human-resource-home',
            'student': '/student-home'
          };

          const userRoleKey = Object.keys(roleHomePages).find(key => 
            key.toLowerCase() === normalizedUserRole
          );

          const redirectPath = userRoleKey ? roleHomePages[userRoleKey] : redirectTo;
          navigate(redirectPath, { replace: true });
          return;
        }
      }
    }
  }, [isAuthenticated, user, loading, allowedRoles, navigate, requireAuth, redirectTo]);

  // Show loading spinner while checking authentication
  if (loading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If authentication is required but not authenticated, show nothing (will redirect)
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // If role-based access is required, check permissions
  if (requireAuth && allowedRoles.length > 0) {
    const userRole = user?.role || user?.data?.role;
    const normalizedUserRole = userRole?.toLowerCase().replace(/\s+/g, '_');
    const normalizedAllowedRoles = allowedRoles.map(role => 
      role.toLowerCase().replace(/\s+/g, '_')
    );

    const hasPermission = normalizedAllowedRoles.includes(normalizedUserRole);

    if (!hasPermission) {
      return null;
    }
  }

  // User has permission, render the protected content
  return <>{children}</>;
};

export default PageProtector;

