import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RiderRedirectRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    // If user is a rider, redirect to dashboard
    if (user?.role === 'rider') {
        return <Navigate to="/rider-dashboard" replace />;
    }

    // Otherwise, render the child routes (e.g., Home, Restaurants)
    return <Outlet />;
};

export default RiderRedirectRoute;
