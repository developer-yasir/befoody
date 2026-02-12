import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalRestaurants: 0,
        totalOrders: 0,
        totalRevenue: 0,
        activeRiders: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }
        fetchDashboardData();
    }, [user, navigate]);

    const fetchDashboardData = async () => {
        try {
            const [usersRes, restaurantsRes, ordersRes] = await Promise.all([
                api.get('/api/users'),
                api.get('/api/restaurants'),
                api.get('/api/orders/admin/all')
            ]);

            const users = usersRes.data;
            const restaurants = restaurantsRes.data;
            const orders = ordersRes.data;

            // Calculate stats
            const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
            const activeRiders = users.filter(u => u.role === 'rider').length;

            setStats({
                totalUsers: users.filter(u => u.role === 'customer').length,
                totalRestaurants: restaurants.length,
                totalOrders: orders.length,
                totalRevenue,
                activeRiders
            });

            setUsers(users);
            setRestaurants(restaurants);
            setRecentOrders(orders.slice(0, 10));
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            await api.delete(`/api/users/${userId}`);
            fetchDashboardData();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user');
        }
    };

    const deleteRestaurant = async (restaurantId) => {
        if (!window.confirm('Are you sure you want to delete this restaurant?')) return;

        try {
            await api.delete(`/api/restaurants/${restaurantId}`);
            fetchDashboardData();
        } catch (error) {
            console.error('Error deleting restaurant:', error);
            alert('Failed to delete restaurant');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin text-6xl mb-4">⚙️</div>
                    <p className="text-gray-600">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">
                        <span className="text-gradient bg-gradient-to-r from-blue-600 to-indigo-600">
                            Admin Dashboard
                        </span>
                    </h1>
                    <p className="text-gray-600">System-wide management and analytics</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm mb-1">Total Users</p>
                                <p className="text-3xl font-bold">{stats.totalUsers}</p>
                            </div>
                            <div className="text-5xl opacity-20">👥</div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-orange-500 to-red-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm mb-1">Restaurants</p>
                                <p className="text-3xl font-bold">{stats.totalRestaurants}</p>
                            </div>
                            <div className="text-5xl opacity-20">🍽️</div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-green-500 to-teal-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm mb-1">Total Orders</p>
                                <p className="text-3xl font-bold">{stats.totalOrders}</p>
                            </div>
                            <div className="text-5xl opacity-20">📦</div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm mb-1">Revenue</p>
                                <p className="text-3xl font-bold">${stats.totalRevenue.toFixed(0)}</p>
                            </div>
                            <div className="text-5xl opacity-20">💰</div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-cyan-100 text-sm mb-1">Active Riders</p>
                                <p className="text-3xl font-bold">{stats.activeRiders}</p>
                            </div>
                            <div className="text-5xl opacity-20">🏍️</div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-6">
                    <div className="flex gap-2 border-b border-gray-200">
                        {['overview', 'users', 'restaurants', 'orders'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-3 font-semibold capitalize transition-colors ${activeTab === tab
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Recent Orders */}
                        <div className="card">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
                            <div className="space-y-3">
                                {recentOrders.slice(0, 5).map((order) => (
                                    <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-semibold text-gray-900">Order #{order._id.slice(-6)}</p>
                                            <p className="text-sm text-gray-600">{order.restaurantId?.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">${order.totalAmount.toFixed(2)}</p>
                                            <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="card">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Platform Health</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Active Orders</span>
                                    <span className="font-bold text-gray-900">
                                        {recentOrders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Completed Today</span>
                                    <span className="font-bold text-gray-900">
                                        {recentOrders.filter(o => o.status === 'delivered').length}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Average Order Value</span>
                                    <span className="font-bold text-gray-900">
                                        ${stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : '0.00'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Total Riders</span>
                                    <span className="font-bold text-gray-900">{stats.activeRiders}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="card">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">User Management</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Phone</th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4">{user.name}</td>
                                            <td className="py-3 px-4">{user.email}</td>
                                            <td className="py-3 px-4">
                                                <span className={`badge ${user.role === 'admin' ? 'badge-error' :
                                                    user.role === 'restaurant' ? 'badge-warning' :
                                                        user.role === 'rider' ? 'badge-info' :
                                                            'badge-success'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">{user.phone || 'N/A'}</td>
                                            <td className="py-3 px-4 text-right">
                                                {user.role !== 'admin' && (
                                                    <button
                                                        onClick={() => deleteUser(user._id)}
                                                        className="text-red-600 hover:text-red-800 text-sm font-semibold"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'restaurants' && (
                    <div className="card">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Restaurant Management</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {restaurants.map((restaurant) => (
                                <div key={restaurant._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <img
                                        src={restaurant.imageUrl}
                                        alt={restaurant.name}
                                        className="w-full h-32 object-cover rounded-lg mb-3"
                                    />
                                    <h3 className="font-bold text-gray-900 mb-1">{restaurant.name}</h3>
                                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{restaurant.description}</p>
                                    <div className="flex items-center justify-between text-sm mb-3">
                                        <span className="text-yellow-500">⭐ {restaurant.rating.toFixed(1)}</span>
                                        <span className="text-gray-600">{restaurant.deliveryTime} min</span>
                                    </div>
                                    <button
                                        onClick={() => deleteRestaurant(restaurant._id)}
                                        className="btn btn-sm bg-red-500 text-white hover:bg-red-600 w-full"
                                    >
                                        Delete Restaurant
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="card">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">All Orders</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Order ID</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Restaurant</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((order) => (
                                        <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4 font-mono text-sm">#{order._id.slice(-8)}</td>
                                            <td className="py-3 px-4">{order.restaurantId?.name || 'N/A'}</td>
                                            <td className="py-3 px-4">
                                                {order.userId?.name || order.guestInfo?.name || 'Guest'}
                                            </td>
                                            <td className="py-3 px-4 font-semibold">${order.totalAmount.toFixed(2)}</td>
                                            <td className="py-3 px-4">
                                                <span className={`badge ${order.status === 'delivered' ? 'badge-success' :
                                                    order.status === 'cancelled' ? 'badge-error' :
                                                        order.status === 'out_for_delivery' ? 'badge-info' :
                                                            'badge-warning'
                                                    }`}>
                                                    {order.status.replace(/_/g, ' ')}
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
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
