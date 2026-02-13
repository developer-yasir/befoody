import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useAuth(); // Assuming loading is available in AuthContext

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        console.log('ProtectedRoute: Access Denied');
        console.log('User Role:', user.role);
        console.log('Allowed Roles:', allowedRoles);

        // Redirect to appropriate dashboard based on role or home
        if (user.role === 'admin') return <Navigate to="/admin" replace />;
        if (user.role === 'restaurant') return <Navigate to="/restaurant-dashboard" replace />;
        if (user.role === 'rider') return <Navigate to="/rider-dashboard" replace />;
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
