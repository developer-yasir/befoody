import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import axios from 'axios';

const RestaurantDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [restaurant, setRestaurant] = useState(null);
    const [orders, setOrders] = useState([]);
    const [foodItems, setFoodItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('orders');
    const [showAddItemModal, setShowAddItemModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [newItem, setNewItem] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        imageUrl: '',
        isAvailable: true,
        isVegetarian: false,
        isVegan: false
    });

    useEffect(() => {
        if (!user || user.role !== 'restaurant') {
            navigate('/');
            return;
        }
        fetchRestaurantData();

        // Poll for new orders every 10 seconds
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, [user, navigate]);

    const fetchRestaurantData = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Get restaurant owned by this user
            const restaurantsRes = await axios.get('http://localhost:5000/api/restaurants', config);
            const myRestaurant = restaurantsRes.data.find(r => r.ownerId === user._id);

            if (!myRestaurant) {
                addToast('No restaurant found for this account', 'error');
                return;
            }

            setRestaurant(myRestaurant);

            // Fetch orders and food items for this restaurant
            const [ordersRes, foodItemsRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/orders/restaurant/${myRestaurant._id}`, config),
                axios.get(`http://localhost:5000/api/fooditems?restaurantId=${myRestaurant._id}`, config)
            ]);

            // Orders are already filtered by backend
            setOrders(ordersRes.data);
            setFoodItems(foodItemsRes.data);
        } catch (error) {
            console.error('Error fetching restaurant data:', error);
            addToast('Failed to load restaurant data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        if (!restaurant) return;
        try {
            const token = localStorage.getItem('token');
            const ordersRes = await axios.get(`http://localhost:5000/api/orders/restaurant/${restaurant._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(ordersRes.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:5000/api/orders/${orderId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            addToast(`Order status updated to ${newStatus}`, 'success');
            fetchOrders();
        } catch (error) {
            console.error('Error updating order status:', error);
            addToast('Failed to update order status', 'error');
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                'http://localhost:5000/api/fooditems',
                { ...newItem, restaurantId: restaurant._id, price: parseFloat(newItem.price) },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            addToast('Menu item added successfully!', 'success');
            setShowAddItemModal(false);
            setNewItem({ name: '', description: '', price: '', category: '', imageUrl: '', isAvailable: true, isVegetarian: false, isVegan: false });
            fetchRestaurantData();
        } catch (error) {
            console.error('Error adding item:', error);
            addToast('Failed to add menu item', 'error');
        }
    };

    const handleUpdateItem = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:5000/api/fooditems/${editingItem._id}`,
                { ...editingItem, price: parseFloat(editingItem.price) },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            addToast('Menu item updated successfully!', 'success');
            setEditingItem(null);
            fetchRestaurantData();
        } catch (error) {
            console.error('Error updating item:', error);
            addToast('Failed to update menu item', 'error');
        }
    };

    const handleDeleteItem = async (itemId) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/fooditems/${itemId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            addToast('Menu item deleted successfully!', 'success');
            fetchRestaurantData();
        } catch (error) {
            console.error('Error deleting item:', error);
            addToast('Failed to delete menu item', 'error');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin text-6xl mb-4">🍽️</div>
                    <p className="text-gray-600">Loading restaurant dashboard...</p>
                </div>
            </div>
        );
    }

    if (!restaurant) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">No Restaurant Found</h2>
                    <p className="text-gray-600">Please contact admin to set up your restaurant.</p>
                </div>
            </div>
        );
    }

    const pendingOrders = orders.filter(o => o.status === 'pending');
    const preparingOrders = orders.filter(o => ['confirmed', 'preparing'].includes(o.status));
    const readyOrders = orders.filter(o => o.status === 'ready_for_pickup');
    const completedToday = orders.filter(o =>
        o.status === 'delivered' &&
        new Date(o.createdAt).toDateString() === new Date().toDateString()
    );
    const todayRevenue = completedToday.reduce((sum, o) => sum + o.totalAmount, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">
                        <span className="text-gradient bg-gradient-to-r from-orange-600 to-red-600">
                            {restaurant.name}
                        </span>
                    </h1>
                    <p className="text-gray-600">Restaurant Management Dashboard</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="card bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-yellow-100 text-sm mb-1">Pending Orders</p>
                                <p className="text-3xl font-bold">{pendingOrders.length}</p>
                            </div>
                            <div className="text-5xl opacity-20">🔔</div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-orange-500 to-red-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm mb-1">Preparing</p>
                                <p className="text-3xl font-bold">{preparingOrders.length}</p>
                            </div>
                            <div className="text-5xl opacity-20">👨‍🍳</div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-green-500 to-teal-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm mb-1">Ready for Pickup</p>
                                <p className="text-3xl font-bold">{readyOrders.length}</p>
                            </div>
                            <div className="text-5xl opacity-20">✅</div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm mb-1">Today's Revenue</p>
                                <p className="text-3xl font-bold">${todayRevenue.toFixed(0)}</p>
                            </div>
                            <div className="text-5xl opacity-20">💰</div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-6">
                    <div className="flex gap-2 border-b border-gray-200">
                        {['orders', 'menu'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-3 font-semibold capitalize transition-colors ${activeTab === tab
                                    ? 'text-orange-600 border-b-2 border-orange-600'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <div className="space-y-6">
                        {/* Pending Orders */}
                        {pendingOrders.length > 0 && (
                            <div className="card">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="text-2xl">🔔</span>
                                    New Orders ({pendingOrders.length})
                                </h2>
                                <div className="space-y-4">
                                    {pendingOrders.map((order) => (
                                        <div key={order._id} className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <p className="font-bold text-gray-900">Order #{order._id.slice(-8)}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {order.userId?.name || order.guestInfo?.name || 'Guest'} •
                                                        {new Date(order.createdAt).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                                <p className="text-xl font-bold text-orange-600">${order.totalAmount.toFixed(2)}</p>
                                            </div>
                                            <div className="mb-3">
                                                {order.items.map((item, idx) => (
                                                    <p key={idx} className="text-sm text-gray-700">
                                                        {item.quantity}x {item.name}
                                                    </p>
                                                ))}
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => updateOrderStatus(order._id, 'confirmed')}
                                                    className="btn btn-primary flex-1"
                                                >
                                                    Accept Order
                                                </button>
                                                <button
                                                    onClick={() => updateOrderStatus(order._id, 'cancelled')}
                                                    className="btn bg-red-500 text-white hover:bg-red-600 flex-1"
                                                >
                                                    Decline
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Preparing Orders */}
                        {preparingOrders.length > 0 && (
                            <div className="card">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="text-2xl">👨‍🍳</span>
                                    Preparing ({preparingOrders.length})
                                </h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {preparingOrders.map((order) => (
                                        <div key={order._id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <p className="font-bold text-gray-900">Order #{order._id.slice(-8)}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {order.items.length} items • ${order.totalAmount.toFixed(2)}
                                                    </p>
                                                </div>
                                                <span className="badge badge-warning">{order.status}</span>
                                            </div>
                                            <button
                                                onClick={() => updateOrderStatus(order._id, 'ready_for_pickup')}
                                                className="btn btn-success w-full"
                                            >
                                                Mark as Ready
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Ready for Pickup */}
                        {readyOrders.length > 0 && (
                            <div className="card">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="text-2xl">✅</span>
                                    Ready for Pickup ({readyOrders.length})
                                </h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {readyOrders.map((order) => (
                                        <div key={order._id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <p className="font-bold text-gray-900">Order #{order._id.slice(-8)}</p>
                                                    <p className="text-sm text-gray-600">Waiting for rider pickup</p>
                                                </div>
                                                <span className="badge badge-success">Ready</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {orders.length === 0 && (
                            <div className="card text-center py-12">
                                <div className="text-6xl mb-4">📦</div>
                                <p className="text-gray-600">No orders yet</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Menu Tab */}
                {activeTab === 'menu' && (
                    <div className="card">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Menu Management</h2>
                            <button
                                onClick={() => setShowAddItemModal(true)}
                                className="btn btn-primary"
                            >
                                + Add New Item
                            </button>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {foodItems.map((item) => (
                                <div key={item._id} className="border border-gray-200 rounded-lg p-4">
                                    <img
                                        src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
                                        alt={item.name}
                                        className="w-full h-32 object-cover rounded-lg mb-3"
                                    />
                                    <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-lg font-bold text-orange-600">${item.price.toFixed(2)}</span>
                                        <span className={`badge ${item.isAvailable ? 'badge-success' : 'badge-error'}`}>
                                            {item.isAvailable ? 'Available' : 'Unavailable'}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setEditingItem(item)}
                                            className="btn btn-sm bg-blue-500 text-white hover:bg-blue-600 flex-1"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteItem(item._id)}
                                            className="btn btn-sm bg-red-500 text-white hover:bg-red-600 flex-1"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {foodItems.length === 0 && (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🍽️</div>
                                <p className="text-gray-600">No menu items yet. Add your first item!</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Add Item Modal */}
                {showAddItemModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Menu Item</h2>
                            <form onSubmit={handleAddItem} className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Item Name"
                                    required
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    className="input-field"
                                />
                                <textarea
                                    placeholder="Description"
                                    required
                                    value={newItem.description}
                                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                    className="input-field"
                                    rows="3"
                                />
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="Price"
                                    required
                                    value={newItem.price}
                                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                                    className="input-field"
                                />
                                <input
                                    type="text"
                                    placeholder="Category (e.g., Pizza, Burger)"
                                    required
                                    value={newItem.category}
                                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                    className="input-field"
                                />
                                <input
                                    type="url"
                                    placeholder="Image URL"
                                    value={newItem.imageUrl}
                                    onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
                                    className="input-field"
                                />
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={newItem.isVegetarian}
                                            onChange={(e) => setNewItem({ ...newItem, isVegetarian: e.target.checked })}
                                        />
                                        <span className="text-sm">Vegetarian</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={newItem.isVegan}
                                            onChange={(e) => setNewItem({ ...newItem, isVegan: e.target.checked })}
                                        />
                                        <span className="text-sm">Vegan</span>
                                    </label>
                                </div>
                                <div className="flex gap-2">
                                    <button type="submit" className="btn btn-primary flex-1">
                                        Add Item
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddItemModal(false)}
                                        className="btn bg-gray-500 text-white hover:bg-gray-600 flex-1"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Item Modal */}
                {editingItem && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Menu Item</h2>
                            <form onSubmit={handleUpdateItem} className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Item Name"
                                    required
                                    value={editingItem.name}
                                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                    className="input-field"
                                />
                                <textarea
                                    placeholder="Description"
                                    required
                                    value={editingItem.description}
                                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                                    className="input-field"
                                    rows="3"
                                />
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="Price"
                                    required
                                    value={editingItem.price}
                                    onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                                    className="input-field"
                                />
                                <input
                                    type="text"
                                    placeholder="Category"
                                    required
                                    value={editingItem.category}
                                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                                    className="input-field"
                                />
                                <input
                                    type="url"
                                    placeholder="Image URL"
                                    value={editingItem.imageUrl}
                                    onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                                    className="input-field"
                                />
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={editingItem.isAvailable}
                                            onChange={(e) => setEditingItem({ ...editingItem, isAvailable: e.target.checked })}
                                        />
                                        <span className="text-sm">Available</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={editingItem.isVegetarian}
                                            onChange={(e) => setEditingItem({ ...editingItem, isVegetarian: e.target.checked })}
                                        />
                                        <span className="text-sm">Vegetarian</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={editingItem.isVegan}
                                            onChange={(e) => setEditingItem({ ...editingItem, isVegan: e.target.checked })}
                                        />
                                        <span className="text-sm">Vegan</span>
                                    </label>
                                </div>
                                <div className="flex gap-2">
                                    <button type="submit" className="btn btn-primary flex-1">
                                        Update Item
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditingItem(null)}
                                        className="btn bg-gray-500 text-white hover:bg-gray-600 flex-1"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RestaurantDashboard;
