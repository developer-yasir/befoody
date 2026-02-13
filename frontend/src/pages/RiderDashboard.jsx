import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    getRiderProfile,
    getAvailableOrders,
    getActiveDelivery
} from '../services/riderService';

// Sub-components
import BottomNav from '../components/rider/BottomNav';
import Sidebar from '../components/rider/Sidebar';
import HomeView from '../components/rider/HomeView';
import EarningsView from '../components/rider/EarningsView';
import HistoryView from '../components/rider/HistoryView';
import ProfileView from '../components/rider/ProfileView';

const RiderDashboard = () => {
    const { user, logout } = useAuth();
    const [activeView, setActiveView] = useState('home');

    // Shared State
    const [profile, setProfile] = useState(null);
    const [activeOrder, setActiveOrder] = useState(null);
    const [availableOrders, setAvailableOrders] = useState([]);
    const [isAvailable, setIsAvailable] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initial Data Fetch
    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Poll for new orders every 10 seconds if on home view and online
    useEffect(() => {
        let interval;
        if (activeView === 'home' && !activeOrder && isAvailable) {
            interval = setInterval(fetchAvailableOrders, 10000);
        }
        return () => clearInterval(interval);
    }, [activeView, activeOrder, isAvailable]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [profileData, activeDeliveryData] = await Promise.all([
                getRiderProfile(),
                getActiveDelivery()
            ]);

            setProfile(profileData);
            setIsAvailable(profileData.isAvailable);

            if (activeDeliveryData) {
                setActiveOrder(activeDeliveryData);
            } else {
                await fetchAvailableOrders();
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableOrders = async () => {
        try {
            const orders = await getAvailableOrders();
            setAvailableOrders(orders);
        } catch (err) {
            console.error('Error fetching orders:', err);
        }
    };

    if (loading && !profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 space-y-4">
                <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium animate-pulse">Loading App...</p>
            </div>
        );
    }

    const renderView = () => {
        switch (activeView) {
            case 'home':
                return (
                    <HomeView
                        user={user}
                        profile={profile}
                        isAvailable={isAvailable}
                        setIsAvailable={setIsAvailable}
                        activeOrder={activeOrder}
                        setActiveOrder={setActiveOrder}
                        availableOrders={availableOrders}
                        setAvailableOrders={setAvailableOrders}
                        fetchAvailableOrders={fetchAvailableOrders}
                        setLoading={setLoading}
                    />
                );
            case 'earnings':
                return <EarningsView />;
            case 'history':
                return <HistoryView />;
            case 'profile':
                return <ProfileView profile={profile} setProfile={setProfile} />;
            default:
                return <HomeView />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans md:pl-64 transition-all duration-300">
            {/* Desktop Sidebar */}
            <Sidebar activeView={activeView} setActiveView={setActiveView} logout={logout} />

            {/* Mobile-only Wrapper removed/adjusted */}
            <div className="max-w-7xl mx-auto min-h-screen relative">
                <main className="w-full">
                    {renderView()}
                </main>

                {/* Mobile Bottom Nav */}
                <div className="md:hidden">
                    <BottomNav activeView={activeView} setActiveView={setActiveView} />
                </div>
            </div>
        </div>
    );
};

export default RiderDashboard;
