import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';

const RiderDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [rider, setRider] = useState(null);
    const [availableOrders, setAvailableOrders] = useState([]);
    const [activeDeliveries, setActiveDeliveries] = useState([]);
    const [deliveryHistory, setDeliveryHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAvailable, setIsAvailable] = useState(true);

    useEffect(() => {
        if (!user || user.role !== 'rider') {
            navigate('/');
            return;
        }
        fetchRiderData();

        // Poll for new orders every 10 seconds
        const interval = setInterval(fetchAvailableOrders, 10000);
        return () => clearInterval(interval);
    }, [user, navigate]);

    const fetchRiderData = async () => {
        try {
            const [riderRes, availableRes, deliveriesRes] = await Promise.all([
                api.get('/api/riders/profile'),
                api.get('/api/riders/available-orders'),
                api.get('/api/riders/my-deliveries')
            ]);

            setRider(riderRes.data);
            setAvailableOrders(availableRes.data);

            const active = deliveriesRes.data.filter(d => !['delivered', 'cancelled'].includes(d.status));
            const history = deliveriesRes.data.filter(d => ['delivered', 'cancelled'].includes(d.status));

            setActiveDeliveries(active);
            setDeliveryHistory(history);
        } catch (error) {
            console.error('Error fetching rider data:', error);
            addToast('Failed to load rider data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableOrders = async () => {
        try {
            const res = await api.get('/api/riders/available-orders');
            setAvailableOrders(res.data);
        } catch (error) {
            console.error('Error fetching available orders:', error);
        }
    };

    const acceptOrder = async (orderId) => {
        try {
            await api.post(`/api/riders/accept-order/${orderId}`, {});
            addToast('Order accepted! Start delivery now.', 'success');
            fetchRiderData();
        } catch (error) {
            console.error('Error accepting order:', error);
            addToast('Failed to accept order', 'error');
        }
    };

    const updateDeliveryStatus = async (orderId, status) => {
        try {
            await api.put(
                `/api/orders/${orderId}/status`,
                { status }
            );
            addToast(`Delivery status updated to ${status}`, 'success');
            fetchRiderData();
        } catch (error) {
            console.error('Error updating delivery status:', error);
            addToast('Failed to update delivery status', 'error');
        }
    };

    const completeDelivery = async (orderId) => {
        try {
            await api.post(`/api/riders/complete-delivery/${orderId}`, {});
            addToast('Delivery completed! Great job! 🎉', 'success');
            fetchRiderData();
        } catch (error) {
            console.error('Error completing delivery:', error);
            addToast('Failed to complete delivery', 'error');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin text-6xl mb-4">🏍️</div>
                    <p className="text-gray-600">Loading rider dashboard...</p>
                </div>
            </div>
        );
    }

    const todayDeliveries = deliveryHistory.filter(d =>
        new Date(d.createdAt).toDateString() === new Date().toDateString()
    );
    const todayEarnings = todayDeliveries.reduce((sum, d) => sum + (d.deliveryFee || 2.99), 0);
    const weekEarnings = deliveryHistory
        .filter(d => {
            const deliveryDate = new Date(d.createdAt);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return deliveryDate >= weekAgo;
        })
        .reduce((sum, d) => sum + (d.deliveryFee || 2.99), 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">
                            <span className="text-gradient bg-gradient-to-r from-green-600 to-teal-600">
                                Rider Dashboard
                            </span>
                        </h1>
                        <p className="text-gray-600">Welcome back, {user.name}!</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-gray-700 font-semibold">Status:</span>
                        <button
                            onClick={() => setIsAvailable(!isAvailable)}
                            className={`px-6 py-3 rounded-lg font-bold transition-all ${isAvailable
                                ? 'bg-green-500 text-white hover:bg-green-600'
                                : 'bg-gray-400 text-white hover:bg-gray-500'
                                }`}
                        >
                            {isAvailable ? '✅ Available' : '⏸️ Offline'}
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="card bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-yellow-100 text-sm mb-1">Available Orders</p>
                                <p className="text-3xl font-bold">{availableOrders.length}</p>
                            </div>
                            <div className="text-5xl opacity-20">📦</div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm mb-1">Active Deliveries</p>
                                <p className="text-3xl font-bold">{activeDeliveries.length}</p>
                            </div>
                            <div className="text-5xl opacity-20">🚚</div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-green-500 to-teal-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm mb-1">Today's Earnings</p>
                                <p className="text-3xl font-bold">${todayEarnings.toFixed(2)}</p>
                            </div>
                            <div className="text-5xl opacity-20">💰</div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm mb-1">Week's Earnings</p>
                                <p className="text-3xl font-bold">${weekEarnings.toFixed(2)}</p>
                            </div>
                            <div className="text-5xl opacity-20">📊</div>
                        </div>
                    </div>
                </div>

                {/* Active Deliveries */}
                {activeDeliveries.length > 0 && (
                    <div className="card mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="text-2xl">🚚</span>
                            Active Deliveries ({activeDeliveries.length})
                        </h2>
                        <div className="space-y-4">
                            {activeDeliveries.map((order) => (
                                <div key={order._id} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <p className="font-bold text-gray-900">Order #{order._id.slice(-8)}</p>
                                            <p className="text-sm text-gray-600">{order.restaurantId?.name}</p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                📍 {order.deliveryAddress.street}, {order.deliveryAddress.city}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-green-600">
                                                +${(order.deliveryFee || 2.99).toFixed(2)}
                                            </p>
                                            <span className="badge badge-info">{order.status.replace(/_/g, ' ')}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {order.status === 'ready_for_pickup' && (
                                            <button
                                                onClick={() => updateDeliveryStatus(order._id, 'out_for_delivery')}
                                                className="btn btn-primary flex-1"
                                            >
                                                Start Delivery
                                            </button>
                                        )}
                                        {order.status === 'out_for_delivery' && (
                                            <button
                                                onClick={() => completeDelivery(order._id)}
                                                className="btn btn-success flex-1"
                                            >
                                                Complete Delivery
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Available Orders */}
                {isAvailable && availableOrders.length > 0 && (
                    <div className="card mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="text-2xl">📦</span>
                            Available Orders ({availableOrders.length})
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {availableOrders.map((order) => (
                                <div key={order._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <p className="font-bold text-gray-900">{order.restaurantId?.name}</p>
                                            <p className="text-sm text-gray-600">Order #{order._id.slice(-8)}</p>
                                            <p className="text-sm text-gray-600 mt-2">
                                                📍 {order.deliveryAddress.street}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {order.deliveryAddress.city}, {order.deliveryAddress.state}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-green-600">
                                                +${(order.deliveryFee || 2.99).toFixed(2)}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {order.items.length} items
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => acceptOrder(order._id)}
                                        className="btn btn-primary w-full"
                                    >
                                        Accept Delivery
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!isAvailable && (
                    <div className="card text-center py-12 mb-8">
                        <div className="text-6xl mb-4">⏸️</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">You're Offline</h3>
                        <p className="text-gray-600 mb-4">Set your status to "Available" to see new orders</p>
                    </div>
                )}

                {isAvailable && availableOrders.length === 0 && activeDeliveries.length === 0 && (
                    <div className="card text-center py-12 mb-8">
                        <div className="text-6xl mb-4">🎉</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
                        <p className="text-gray-600">No orders available right now. Check back soon!</p>
                    </div>
                )}

                {/* Delivery History */}
                <div className="card">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="text-2xl">📋</span>
                        Delivery History
                    </h2>
                    {deliveryHistory.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Order ID</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Restaurant</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Delivery Fee</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {deliveryHistory.slice(0, 10).map((order) => (
                                        <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4 font-mono text-sm">#{order._id.slice(-8)}</td>
                                            <td className="py-3 px-4">{order.restaurantId?.name || 'N/A'}</td>
                                            <td className="py-3 px-4 font-semibold text-green-600">
                                                +${(order.deliveryFee || 2.99).toFixed(2)}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`badge ${order.status === 'delivered' ? 'badge-success' : 'badge-error'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📦</div>
                            <p className="text-gray-600">No delivery history yet</p>
                        </div>
                    )}
                </div>

                {/* Earnings Summary */}
                <div className="card mt-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Earnings Summary</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center p-6 bg-green-50 rounded-lg">
                            <p className="text-gray-600 mb-2">Today</p>
                            <p className="text-3xl font-bold text-green-600">${todayEarnings.toFixed(2)}</p>
                            <p className="text-sm text-gray-500 mt-1">{todayDeliveries.length} deliveries</p>
                        </div>
                        <div className="text-center p-6 bg-blue-50 rounded-lg">
                            <p className="text-gray-600 mb-2">This Week</p>
                            <p className="text-3xl font-bold text-blue-600">${weekEarnings.toFixed(2)}</p>
                            <p className="text-sm text-gray-500 mt-1">
                                {deliveryHistory.filter(d => {
                                    const deliveryDate = new Date(d.createdAt);
                                    const weekAgo = new Date();
                                    weekAgo.setDate(weekAgo.getDate() - 7);
                                    return deliveryDate >= weekAgo;
                                }).length} deliveries
                            </p>
                        </div>
                        <div className="text-center p-6 bg-purple-50 rounded-lg">
                            <p className="text-gray-600 mb-2">Total</p>
                            <p className="text-3xl font-bold text-purple-600">
                                ${deliveryHistory.reduce((sum, d) => sum + (d.deliveryFee || 2.99), 0).toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">{deliveryHistory.length} deliveries</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RiderDashboard;
