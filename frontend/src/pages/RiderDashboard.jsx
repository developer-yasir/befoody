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

    if (loading && !profile) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header / Stats Section */}
            <div className="bg-white p-6 rounded-b-3xl shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Hello, {user?.name?.split(' ')[0]}! 👋</h1>
                        <p className="text-sm text-gray-500">{profile?.vehicleType} • {profile?.vehicleNumber}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                    >
                        <span className="text-xl">🚪</span>
                    </button>
                </div>

                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl">
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <span className="font-semibold text-gray-700">{isAvailable ? 'You are Online' : 'You are Offline'}</span>
                    </div>
                    <button
                        onClick={handleToggleAvailability}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${isAvailable
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-200 text-gray-600'
                            }`}
                    >
                        {isAvailable ? 'Go Offline' : 'Go Online'}
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-orange-50 p-4 rounded-2xl">
                        <p className="text-xs text-orange-600 font-bold uppercase tracking-wider">Earnings</p>
                        <p className="text-2xl font-black text-gray-900">${stats.earnings.toFixed(2)}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-2xl">
                        <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Deliveries</p>
                        <p className="text-2xl font-black text-gray-900">{stats.deliveries}</p>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="p-4 space-y-4">
                {activeOrder ? (
                    // ACTIVE ORDER VIEW
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-primary-100">
                            <div className="bg-primary-600 p-4 text-white">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold bg-primary-700 px-2 py-1 rounded text-xs">ACTIVE ORDER</span>
                                    <span className="font-mono text-sm">#{activeOrder._id.slice(-6)}</span>
                                </div>
                                <h2 className="text-xl font-bold">{activeOrder.restaurantId?.name || 'Unknown Restaurant'}</h2>
                                <p className="text-primary-100 text-sm">{activeOrder.restaurantId?.address}</p>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Customer Details */}
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                        👤
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase">Customer</p>
                                        <p className="font-semibold text-gray-900">{activeOrder.userId?.name}</p>
                                        <p className="text-sm text-gray-600">{activeOrder.userId?.phone}</p>
                                    </div>
                                </div>

                                {/* Delivery Location */}
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                        📍
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase">Deliver To</p>
                                        <p className="font-semibold text-gray-900">123 Main St, Apt 4B</p>
                                        <p className="text-sm text-gray-600">New York, NY 10001</p>
                                    </div>
                                </div>

                                {/* Items Summary */}
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="text-xs text-gray-500 font-bold uppercase mb-2">Order Items ({activeOrder.items?.length || 0})</p>
                                    <ul className="space-y-1">
                                        {activeOrder.items?.map((item, idx) => (
                                            <li key={idx} className="text-sm text-gray-700 flex justify-between">
                                                <span>{item.quantity}x {item.menuItemId?.name || 'Item'}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between font-bold">
                                        <span>Total to Collect</span>
                                        <span>${activeOrder.totalAmount?.toFixed(2)}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCompleteOrder}
                                    className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 shadow-lg shadow-green-200 transition-all active:scale-95"
                                >
                                    ✅ Complete Delivery
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    // AVAILABLE ORDERS LIST
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-gray-900 px-2">
                            Available Orders
                            <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{availableOrders.length}</span>
                        </h2>

                        {availableOrders.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
                                <span className="text-4xl block mb-2">😴</span>
                                <p className="text-gray-500">No orders available right now.</p>
                                <button onClick={fetchAvailableOrders} className="mt-4 text-primary-600 font-bold text-sm">Refresh List</button>
                            </div>
                        ) : (
                            availableOrders.map(order => (
                                <div key={order._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-primary-200 transition-all">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">{order.restaurantId?.name}</h3>
                                            <p className="text-xs text-gray-500">{order.restaurantId?.address}</p>
                                        </div>
                                        <div className="bg-green-100 text-green-700 px-3 py-1 rounded-lg font-bold text-sm">
                                            +${(order.deliveryFee || 5.00).toFixed(2)}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                        <span className="flex items-center gap-1">📍 2.4 km</span>
                                        <span className="flex items-center gap-1">⏱️ 15 min</span>
                                        <span className="flex items-center gap-1">📦 {order.items?.length} items</span>
                                    </div>

                                    <button
                                        onClick={() => handleAcceptOrder(order._id)}
                                        className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors"
                                    >
                                        Accept Order
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-50">
                <button className="flex flex-col items-center text-primary-600">
                    <span className="text-2xl">🏠</span>
                    <span className="text-[10px] font-bold mt-1">Home</span>
                </button>
                <button className="flex flex-col items-center text-gray-400 hover:text-gray-600">
                    <span className="text-2xl">📜</span>
                    <span className="text-[10px] font-bold mt-1">History</span>
                </button>
                <button className="flex flex-col items-center text-gray-400 hover:text-gray-600">
                    <span className="text-2xl">👤</span>
                    <span className="text-[10px] font-bold mt-1">Profile</span>
                </button>
            </div>
        </div>
    );
};

export default RiderDashboard;
