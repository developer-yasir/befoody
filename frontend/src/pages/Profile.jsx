import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';

const Profile = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [editing, setEditing] = useState(false);
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: ''
        }
    });
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchProfileData();
    }, [isAuthenticated, navigate]);

    const fetchProfileData = async () => {
        try {
            const [ordersRes] = await Promise.all([
                api.get('/api/orders/my-orders')
            ]);

            setProfile({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || { street: '', city: '', state: '', zipCode: '' }
            });
            setOrders(ordersRes.data);
        } catch (error) {
            console.error('Error fetching profile data:', error);
            addToast('Failed to load profile data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await api.put(
                '/api/users/profile',
                profile
            );
            addToast('Profile updated successfully!', 'success');
            setEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            addToast('Failed to update profile', 'error');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin text-6xl mb-4">⚙️</div>
                    <p className="text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    const completedOrders = orders.filter(o => o.status === 'delivered');
    const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
    const totalSpent = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">
                        <span className="text-gradient">My Profile</span>
                    </h1>
                    <p className="text-gray-600">Manage your account and view order history</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Profile Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Stats Cards */}
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                <div className="text-center">
                                    <p className="text-blue-100 text-sm mb-1">Total Orders</p>
                                    <p className="text-3xl font-bold">{orders.length}</p>
                                </div>
                            </div>
                            <div className="card bg-gradient-to-br from-green-500 to-teal-600 text-white">
                                <div className="text-center">
                                    <p className="text-green-100 text-sm mb-1">Active Orders</p>
                                    <p className="text-3xl font-bold">{activeOrders.length}</p>
                                </div>
                            </div>
                            <div className="card bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                                <div className="text-center">
                                    <p className="text-purple-100 text-sm mb-1">Total Spent</p>
                                    <p className="text-3xl font-bold">${totalSpent.toFixed(0)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Profile Details */}
                        <div className="card">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-heading font-bold text-gray-900">
                                    Personal Information
                                </h2>
                                {!editing && (
                                    <button
                                        onClick={() => setEditing(true)}
                                        className="btn btn-primary"
                                    >
                                        Edit Profile
                                    </button>
                                )}
                            </div>

                            {editing ? (
                                <form onSubmit={handleUpdateProfile} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                                        <input
                                            type="text"
                                            value={profile.name}
                                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                            className="input-field"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                        <input
                                            type="email"
                                            value={profile.email}
                                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                            className="input-field"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                                        <input
                                            type="tel"
                                            value={profile.phone}
                                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Street Address</label>
                                        <input
                                            type="text"
                                            value={profile.address.street}
                                            onChange={(e) => setProfile({
                                                ...profile,
                                                address: { ...profile.address, street: e.target.value }
                                            })}
                                            className="input-field"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                                            <input
                                                type="text"
                                                value={profile.address.city}
                                                onChange={(e) => setProfile({
                                                    ...profile,
                                                    address: { ...profile.address, city: e.target.value }
                                                })}
                                                className="input-field"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                                            <input
                                                type="text"
                                                value={profile.address.state}
                                                onChange={(e) => setProfile({
                                                    ...profile,
                                                    address: { ...profile.address, state: e.target.value }
                                                })}
                                                className="input-field"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button type="submit" className="btn btn-primary flex-1">
                                            Save Changes
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditing(false)}
                                            className="btn bg-gray-500 text-white hover:bg-gray-600 flex-1"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                        <span className="text-2xl">👤</span>
                                        <div>
                                            <p className="text-sm text-gray-600">Name</p>
                                            <p className="font-semibold text-gray-900">{profile.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                        <span className="text-2xl">📧</span>
                                        <div>
                                            <p className="text-sm text-gray-600">Email</p>
                                            <p className="font-semibold text-gray-900">{profile.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                        <span className="text-2xl">📱</span>
                                        <div>
                                            <p className="text-sm text-gray-600">Phone</p>
                                            <p className="font-semibold text-gray-900">{profile.phone || 'Not provided'}</p>
                                        </div>
                                    </div>
                                    {profile.address.street && (
                                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                            <span className="text-2xl">📍</span>
                                            <div>
                                                <p className="text-sm text-gray-600">Address</p>
                                                <p className="font-semibold text-gray-900">
                                                    {profile.address.street}, {profile.address.city}, {profile.address.state}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="lg:col-span-1">
                        <div className="card sticky top-24">
                            <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">
                                Recent Orders
                            </h2>
                            {orders.length > 0 ? (
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {orders.slice(0, 5).map((order) => (
                                        <div key={order._id} className="p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {order.restaurantId?.name}
                                                </p>
                                                <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {order.status.replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600 mb-1">
                                                {order.items.length} items • ${order.totalAmount.toFixed(2)}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-4xl mb-2">📦</div>
                                    <p className="text-gray-600 text-sm">No orders yet</p>
                                    <button
                                        onClick={() => navigate('/restaurants')}
                                        className="btn btn-primary mt-3 text-sm"
                                    >
                                        Start Ordering
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
