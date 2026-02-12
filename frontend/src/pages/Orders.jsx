import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import OrderTimeline from '../components/OrderTimeline';

const Orders = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchOrders();
    }, [user]);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/api/orders/my-orders');
            setOrders(res.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReorder = (order) => {
        // Navigate to restaurant with items
        navigate(`/restaurants/${order.restaurantId._id}`);
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-blue-100 text-blue-800',
            preparing: 'bg-purple-100 text-purple-800',
            ready_for_pickup: 'bg-orange-100 text-orange-800',
            out_for_delivery: 'bg-indigo-100 text-indigo-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true;
        if (filter === 'active') return !['delivered', 'cancelled'].includes(order.status);
        if (filter === 'completed') return order.status === 'delivered';
        return true;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="skeleton h-12 w-64 mb-8"></div>
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="card">
                                <div className="skeleton h-32"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">
                        My <span className="text-gradient">Orders</span>
                    </h1>
                    <p className="text-gray-600">Track and manage your orders</p>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-3 mb-8">
                    <button
                        onClick={() => setFilter('all')}
                        className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                    >
                        All Orders
                    </button>
                    <button
                        onClick={() => setFilter('active')}
                        className={`btn ${filter === 'active' ? 'btn-primary' : 'btn-ghost'}`}
                    >
                        Active
                    </button>
                    <button
                        onClick={() => setFilter('completed')}
                        className={`btn ${filter === 'completed' ? 'btn-primary' : 'btn-ghost'}`}
                    >
                        Completed
                    </button>
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <div className="card text-center py-16">
                        <div className="text-6xl mb-4">📦</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No orders found</h3>
                        <p className="text-gray-600 mb-6">Start ordering delicious food!</p>
                        <button onClick={() => navigate('/restaurants')} className="btn btn-primary">
                            Browse Restaurants
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredOrders.map((order, index) => (
                            <div
                                key={order._id}
                                className="card animate-slide-up"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                {/* Order Header */}
                                <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-200">
                                    <div>
                                        <h3 className="text-lg font-heading font-bold text-gray-900 mb-1">
                                            {order.restaurantId?.name || 'Restaurant'}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            Order #{order._id.slice(-6)} • {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className={`badge ${getStatusColor(order.status)}`}>
                                        {order.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                </div>

                                {/* Order Timeline - Only for active orders */}
                                {!['delivered', 'cancelled'].includes(order.status) && (
                                    <div className="mb-6 bg-gray-50 rounded-lg p-4">
                                        <OrderTimeline currentStatus={order.status} />
                                    </div>
                                )}

                                {/* Order Items */}
                                <div className="mb-4">
                                    <h4 className="font-semibold text-gray-900 mb-3">Items:</h4>
                                    <div className="space-y-2">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-sm">
                                                <span className="text-gray-700">
                                                    {item.name} <span className="text-gray-500">x{item.quantity}</span>
                                                </span>
                                                <span className="font-semibold text-gray-900">
                                                    ${(item.price * item.quantity).toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Delivery Address */}
                                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm font-semibold text-gray-700 mb-1">Delivery Address:</p>
                                    <p className="text-sm text-gray-600">
                                        {order.deliveryAddress.street}, {order.deliveryAddress.city}
                                    </p>
                                </div>

                                {/* Order Footer */}
                                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                                    <div>
                                        <span className="text-sm text-gray-600">Total: </span>
                                        <span className="text-xl font-bold text-primary-500">
                                            ${order.totalAmount.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        {order.status === 'delivered' && (
                                            <>
                                                <button
                                                    onClick={() => handleReorder(order)}
                                                    className="btn btn-outline text-sm py-2"
                                                >
                                                    Reorder
                                                </button>
                                                <button className="btn btn-primary text-sm py-2">
                                                    ⭐ Rate Order
                                                </button>
                                            </>
                                        )}
                                        {!['delivered', 'cancelled'].includes(order.status) && (
                                            <button className="btn btn-primary text-sm py-2">
                                                Track Order
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
