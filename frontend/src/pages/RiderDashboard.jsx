import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    getRiderProfile,
    updateAvailability,
    getAvailableOrders,
    acceptOrder,
    getActiveDelivery,
    completeDelivery
} from '../services/riderService';

const RiderDashboard = () => {
    const { user, logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState({ earnings: 0, deliveries: 0 });
    const [isAvailable, setIsAvailable] = useState(true);
    const [activeOrder, setActiveOrder] = useState(null);
    const [availableOrders, setAvailableOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initial Data Fetch
    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Poll for new orders every 10 seconds if no active order
    useEffect(() => {
        let interval;
        if (!activeOrder && isAvailable) {
            interval = setInterval(fetchAvailableOrders, 10000);
        }
        return () => clearInterval(interval);
    }, [activeOrder, isAvailable]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [profileData, activeDeliveryData] = await Promise.all([
                getRiderProfile(),
                getActiveDelivery()
            ]);

            setProfile(profileData);
            setStats({
                earnings: profileData.earnings,
                deliveries: profileData.totalDeliveries
            });
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

    const handleToggleAvailability = async () => {
        try {
            const newStatus = !isAvailable;
            await updateAvailability(newStatus);
            setIsAvailable(newStatus);
            if (newStatus) fetchAvailableOrders();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleAcceptOrder = async (orderId) => {
        try {
            setLoading(true);
            const order = await acceptOrder(orderId);
            setActiveOrder(order);
            setAvailableOrders([]); // Clear list as we now have an active one
        } catch (err) {
            alert(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteOrder = async () => {
        if (!activeOrder) return;
        try {
            setLoading(true);
            await completeDelivery(activeOrder._id);
            setActiveOrder(null);
            // Refresh stats to show new earnings
            const profileData = await getRiderProfile();
            setStats({
                earnings: profileData.earnings,
                deliveries: profileData.totalDeliveries
            });
            await fetchAvailableOrders();
        } catch (err) {
            alert(err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    if (loading && !profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 space-y-4">
                <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium animate-pulse">Loading Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24 font-sans">
            {/* 1. Header & Status Section */}
            <div className="bg-white rounded-b-[2.5rem] shadow-sm border-b border-gray-100 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100 rounded-full blur-3xl opacity-50 -mr-10 -mt-10"></div>

                <div className="p-6 relative z-10">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-xl shadow-inner">
                                🛵
                            </div>
                            <div>
                                <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
                                    {user?.name?.split(' ')[0]}
                                    <span className="text-primary-600">.</span>
                                </h1>
                                <p className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full inline-block">
                                    {profile?.vehicleType} • {profile?.vehicleNumber}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-4 rounded-2xl shadow-lg shadow-gray-200 text-white relative overflow-hidden group">
                            <div className="absolute right-0 top-0 w-16 h-16 bg-white/10 rounded-full -mr-4 -mt-4 blur-xl group-hover:bg-white/20 transition-all"></div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-1">Total Earnings</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black">{formatCurrency(stats.earnings)}</span>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                            <div className="absolute right-0 bottom-0 w-12 h-12 bg-primary-50 rounded-full -mr-2 -mb-2"></div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Deliveries</p>
                            <span className="text-2xl font-black text-gray-900">{stats.deliveries}</span>
                            <span className="text-xs text-green-600 font-bold ml-2">Done</span>
                        </div>
                    </div>

                    {/* Online Toggle */}
                    <div className="flex items-center justify-between bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-2 px-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${isAvailable ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse' : 'bg-gray-400'}`}></div>
                            <span className={`text-sm font-bold ${isAvailable ? 'text-gray-800' : 'text-gray-500'}`}>
                                {isAvailable ? 'You are Online' : 'You are Offline'}
                            </span>
                        </div>
                        <button
                            onClick={handleToggleAvailability}
                            className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm ${isAvailable
                                    ? 'bg-white text-red-500 border border-gray-200 hover:bg-red-50'
                                    : 'bg-green-600 text-white shadow-green-200 shadow-md hover:bg-green-700'
                                }`}
                        >
                            {isAvailable ? 'Stop' : 'Go Online'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-5 pt-6 pb-20">
                {activeOrder ? (
                    // --- ACTIVE LIVE ORDER VIEW ---
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="flex h-3 w-3 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
                            </span>
                            <h2 className="text-lg font-black text-gray-800">Live Delivery</h2>
                        </div>

                        <div className="bg-white rounded-3xl shadow-xl shadow-primary-500/10 overflow-hidden border border-gray-100">
                            {/* Map Placeholder Header */}
                            <div className="h-32 bg-primary-50 relative flex items-center justify-center">
                                <div className="text-primary-300 flex flex-col items-center">
                                    <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                                    <span className="text-xs font-bold mt-1 uppercase tracking-widest opacity-60">Map View</span>
                                </div>
                                <div className="absolute -bottom-6 left-6">
                                    <div className="bg-white p-1 rounded-xl shadow-md">
                                        <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center text-2xl">
                                            🍕
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 pb-6 px-6">
                                {/* Restaurant Info */}
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold text-gray-900 leading-tight">{activeOrder.restaurantId?.name}</h3>
                                    <p className="text-gray-500 text-sm mt-1">{activeOrder.restaurantId?.address}</p>
                                </div>

                                {/* Timeline */}
                                <div className="relative border-l-2 border-gray-100 ml-3 space-y-8 mb-8">
                                    <div className="relative pl-6">
                                        <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-sm"></div>
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Pickup</p>
                                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                            {activeOrder.items?.map((item, i) => (
                                                <div key={i} className="flex justify-between items-center text-sm py-1 border-b border-gray-100 last:border-0 last:pb-0">
                                                    <span className="font-medium text-gray-700"><span className="font-bold text-gray-900">{item.quantity}x</span> {item.menuItemId?.name}</span>
                                                </div>
                                            ))}
                                            <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between text-sm font-bold text-gray-800">
                                                <span>Collect Cash</span>
                                                <span>{formatCurrency(activeOrder.totalAmount)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="relative pl-6">
                                        <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-4 border-primary-500 shadow-sm"></div>
                                        <p className="text-xs font-bold text-primary-600 uppercase mb-1">Dropoff</p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-lg">👤</div>
                                            <div>
                                                <p className="font-bold text-gray-900">{activeOrder.userId?.name}</p>
                                                <p className="text-xs text-gray-500">123 Main St, Apt 4B</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Slide */}
                                <button
                                    onClick={handleCompleteOrder}
                                    className="w-full group relative overflow-hidden bg-gray-900 text-white font-bold py-4 rounded-xl shadow-xl shadow-gray-200 active:scale-[0.98] transition-all"
                                >
                                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-green-500 to-green-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                    <span className="relative flex items-center justify-center gap-2">
                                        <span>Complete Delivery</span>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    // --- AVAILABLE ORDERS LIST ---
                    <div className="space-y-4">
                        <div className="flex justify-between items-end px-1">
                            <h2 className="text-lg font-black text-gray-900">Nearby Orders</h2>
                            <span className="bg-primary-50 text-primary-700 text-[10px] font-bold px-2 py-1 rounded-full">{availableOrders.length} Available</span>
                        </div>

                        {availableOrders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-4xl mb-2">
                                    🧉
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">No orders yet</h3>
                                    <p className="text-gray-500 text-sm max-w-[200px]">Taking a break? We'll notify you when new orders arrive.</p>
                                </div>
                                <button onClick={fetchAvailableOrders} className="text-primary-600 text-xs font-bold bg-primary-50 px-4 py-2 rounded-lg hover:bg-primary-100">
                                    Refresh List
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {availableOrders.map(order => (
                                    <div key={order._id} className="group bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-primary-500/5 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-primary-500 rounded-l-3xl"></div>

                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex gap-3">
                                                <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                                    🍔
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{order.restaurantId?.name}</h3>
                                                    <p className="text-xs font-medium text-gray-400 mt-0.5">{order.restaurantId?.address}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-black text-green-600">{formatCurrency(order.deliveryFee || 5.00)}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Earning</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 mb-5">
                                            <div className="bg-gray-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-gray-100">
                                                <span className="text-xs">📍</span>
                                                <span className="text-xs font-bold text-gray-700">2.4 km</span>
                                            </div>
                                            <div className="bg-gray-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-gray-100">
                                                <span className="text-xs">📦</span>
                                                <span className="text-xs font-bold text-gray-700">{order.items?.length} items</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleAcceptOrder(order._id)}
                                            className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-primary-600 transition-colors shadow-lg shadow-gray-200 group-hover:shadow-primary-200"
                                        >
                                            Accept Delivery
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Navigation (Floating) */}
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-md border border-gray-100 rounded-full shadow-2xl shadow-gray-200/50 px-6 py-2 flex items-center gap-8 z-50">
                <button className="flex flex-col items-center justify-center w-10 h-10 text-primary-600 relative">
                    <span className="absolute -top-1 w-1 h-1 bg-primary-600 rounded-full"></span>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                </button>
                <button className="flex flex-col items-center justify-center w-10 h-10 text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                </button>
                <button className="flex flex-col items-center justify-center w-10 h-10 text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </button>
            </div>
        </div>
    );
};

export default RiderDashboard;
