import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';

const RestaurantDashboard = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [restaurant, setRestaurant] = useState(null);
    const [orders, setOrders] = useState([]);
    const [foodItems, setFoodItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'menu'

    // Menu Item State
    const [showAddItemModal, setShowAddItemModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [newItem, setNewItem] = useState({
        name: '', description: '', price: '', category: '', imageUrl: '', isAvailable: true, isVegetarian: false, isVegan: false
    });

    useEffect(() => {
        if (authLoading) return;
        if (!user || user.role !== 'restaurant') {
            navigate('/');
            return;
        }
        fetchRestaurantData();
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, [user, navigate, authLoading]);

    const fetchRestaurantData = async () => {
        try {
            const restaurantsRes = await api.get('/api/restaurants');
            const myRestaurant = restaurantsRes.data.find(r => r.ownerId === user._id);

            if (!myRestaurant) {
                addToast('No restaurant found for this account', 'error');
                return;
            }

            setRestaurant(myRestaurant);
            const [ordersRes, foodItemsRes] = await Promise.all([
                api.get(`/api/orders/restaurant/${myRestaurant._id}`),
                api.get(`/api/fooditems?restaurantId=${myRestaurant._id}`)
            ]);

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
            const ordersRes = await api.get(`/api/orders/restaurant/${restaurant._id}`);
            setOrders(ordersRes.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await api.put(`/api/orders/${orderId}/status`, { status: newStatus });
            addToast(`Order moved to ${newStatus.replace('_', ' ').toUpperCase()}`, 'success');
            fetchOrders();
        } catch (error) {
            console.error('Error updating order status:', error);
            addToast('Failed to update order status', 'error');
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/fooditems', { ...newItem, restaurantId: restaurant._id, price: parseFloat(newItem.price) });
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
            await api.put(`/api/fooditems/${editingItem._id}`, { ...editingItem, price: parseFloat(editingItem.price) });
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
            await api.delete(`/api/fooditems/${itemId}`);
            addToast('Menu item deleted successfully!', 'success');
            fetchRestaurantData();
        } catch (error) {
            console.error('Error deleting item:', error);
            addToast('Failed to delete menu item', 'error');
        }
    };

    const toggleItemAvailability = async (item) => {
        try {
            await api.put(`/api/fooditems/${item._id}`, { ...item, isAvailable: !item.isAvailable });
            addToast(`Item is now ${!item.isAvailable ? 'Available' : 'Unavailable'}`, 'success');
            fetchRestaurantData();
        } catch (error) {
            addToast('Failed to toggle availability', 'error');
        }
    };

    if (loading || authLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 space-y-4">
                <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium animate-pulse">Loading Kitchen...</p>
            </div>
        );
    }

    if (!restaurant) return <div className="p-8 text-center text-gray-500">No Restaurant Found. Contact Support.</div>;

    // Analytics Calculation
    const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString());
    const revenue = todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const pendingCount = orders.filter(o => o.status === 'pending').length;

    // Group Orders for Kanban
    const kanbanColumns = {
        new: orders.filter(o => o.status === 'pending'),
        preparing: orders.filter(o => o.status === 'confirmed' || o.status === 'preparing'),
        ready: orders.filter(o => o.status === 'ready_for_pickup'),
        out: orders.filter(o => o.status === 'out_for_delivery')
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            {/* --- HEADER --- */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-xl">👨‍🍳</div>
                    <div>
                        <h1 className="text-lg font-black text-gray-900 leading-tight">{restaurant.name}</h1>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Command Center</p>
                    </div>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'orders' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Orders Board
                    </button>
                    <button
                        onClick={() => setActiveTab('menu')}
                        className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'menu' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Menu Manager
                    </button>
                </div>
            </div>

            {/* --- ANALYTICS BAR --- */}
            <div className="grid grid-cols-4 gap-6 px-8 py-6 max-w-7xl mx-auto">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-2xl">💰</div>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Today's Revenue</p>
                        <p className="text-2xl font-black text-gray-900">${revenue.toFixed(2)}</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-2xl">📦</div>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Orders</p>
                        <p className="text-2xl font-black text-gray-900">{todayOrders.length}</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center text-2xl">🔔</div>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Pending Action</p>
                        <p className="text-2xl font-black text-gray-900">{pendingCount}</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-2xl">⭐</div>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Rating</p>
                        <p className="text-2xl font-black text-gray-900">{restaurant.rating}</p>
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="px-8 pb-12 max-w-7xl mx-auto">

                {/* 1. KANBAN BOARD VIEW */}
                {activeTab === 'orders' && (
                    <div className="grid grid-cols-4 gap-6 h-[calc(100vh-250px)]">
                        {/* Column: New */}
                        <div className="bg-gray-100/50 rounded-3xl p-4 flex flex-col">
                            <div className="flex items-center justify-between mb-4 px-2">
                                <h3 className="font-bold text-gray-700">New Orders</h3>
                                <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">{kanbanColumns.new.length}</span>
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                                {kanbanColumns.new.map(order => (
                                    <div key={order._id} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-orange-500 animate-in fade-in slide-in-from-bottom-2">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-mono text-xs text-gray-400">#{order._id.slice(-4)}</span>
                                            <span className="text-xs font-bold text-orange-600">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div className="space-y-1 mb-3">
                                            {order.items.map((item, i) => (
                                                <div key={i} className="text-sm font-medium text-gray-800 flex justify-between">
                                                    <span>{item.quantity}x {item.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-right font-black text-gray-900 mb-3 text-lg">${order.totalAmount.toFixed(2)}</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button onClick={() => updateOrderStatus(order._id, 'confirmed')} className="bg-gray-900 text-white py-2 rounded-lg text-xs font-bold hover:bg-gray-800">Accept</button>
                                            <button onClick={() => updateOrderStatus(order._id, 'cancelled')} className="dg-white border border-gray-200 text-red-500 py-2 rounded-lg text-xs font-bold hover:bg-red-50">Decline</button>
                                        </div>
                                    </div>
                                ))}
                                {kanbanColumns.new.length === 0 && <div className="text-center py-10 text-gray-400 text-sm font-medium border-2 border-dashed border-gray-200 rounded-xl">No new orders</div>}
                            </div>
                        </div>

                        {/* Column: Preparing */}
                        <div className="bg-gray-100/50 rounded-3xl p-4 flex flex-col">
                            <div className="flex items-center justify-between mb-4 px-2">
                                <h3 className="font-bold text-gray-700">Kitchen</h3>
                                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">{kanbanColumns.preparing.length}</span>
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                                {kanbanColumns.preparing.map(order => (
                                    <div key={order._id} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-mono text-xs text-gray-400">#{order._id.slice(-4)}</span>
                                            <span className="text-xs font-bold text-blue-600">{order.status === 'confirmed' ? 'Queued' : 'Cooking'}</span>
                                        </div>
                                        <div className="space-y-1 mb-3 opacity-80">
                                            {order.items.map((item, i) => (
                                                <div key={i} className="text-sm text-gray-800 flex justify-between">
                                                    <span>{item.quantity}x {item.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <button onClick={() => updateOrderStatus(order._id, 'ready_for_pickup')} className="w-full bg-blue-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-blue-700 mt-2">
                                            Mark Ready 🔔
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Column: Ready */}
                        <div className="bg-gray-100/50 rounded-3xl p-4 flex flex-col">
                            <div className="flex items-center justify-between mb-4 px-2">
                                <h3 className="font-bold text-gray-700">Ready</h3>
                                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">{kanbanColumns.ready.length}</span>
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                                {kanbanColumns.ready.map(order => (
                                    <div key={order._id} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500 opacity-80 hover:opacity-100 transition-opacity">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-mono text-xs text-gray-400">#{order._id.slice(-4)}</span>
                                            <span className="text-xs font-bold text-green-600">Waiting Pickup</span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-800 mb-2">{order.items.length} Items</p>
                                        <div className="p-2 bg-green-50 text-green-700 text-xs font-bold rounded-lg text-center">
                                            Rider Notified
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Column: Out */}
                        <div className="bg-gray-100/50 rounded-3xl p-4 flex flex-col">
                            <div className="flex items-center justify-between mb-4 px-2">
                                <h3 className="font-bold text-gray-700">Out for Delivery</h3>
                                <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-full">{kanbanColumns.out.length}</span>
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                                {kanbanColumns.out.map(order => (
                                    <div key={order._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-mono text-xs text-gray-400">#{order._id.slice(-4)}</span>
                                            <span className="text-xs font-bold text-purple-600">On Way</span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs">🛵</div>
                                            <span className="text-sm font-medium text-gray-700">{order.riderId?.userId?.name || 'Rider'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. MENU MANAGER VIEW */}
                {activeTab === 'menu' && (
                    <div className="animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-gray-900">Menu items</h2>
                            <button onClick={() => setShowAddItemModal(true)} className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-gray-800 transition-all flex items-center gap-2">
                                <span className="text-xl">+</span> Add New Item
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {foodItems.map(item => (
                                <div key={item._id} className={`bg-white rounded-3xl p-4 border transition-all ${!item.isAvailable ? 'border-gray-200 opacity-70 grayscale' : 'border-gray-100 hover:shadow-xl hover:-translate-y-1'}`}>
                                    <div className="relative h-48 mb-4 rounded-2xl overflow-hidden group">
                                        <img src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={item.name} />
                                        <button onClick={() => setEditingItem(item)} className="absolute top-3 right-3 bg-white/90 p-2 rounded-lg shadow-sm hover:bg-white text-gray-700 font-bold text-xs backdrop-blur-sm">Only Edit</button>
                                    </div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-gray-900 text-lg leading-tight">{item.name}</h3>
                                        <span className="font-black text-green-600">${item.price}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">{item.description}</p>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => toggleItemAvailability(item)}
                                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-colors ${item.isAvailable ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                                        >
                                            {item.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteItem(item._id)}
                                            className="w-10 flex items-center justify-center bg-gray-50 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* --- MODALS --- */}
            {(showAddItemModal || editingItem) && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl">
                        <h2 className="text-2xl font-black text-gray-900 mb-6">{editingItem ? 'Edit Item' : 'New Dish'}</h2>
                        <form onSubmit={editingItem ? handleUpdateItem : handleAddItem} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Name</label>
                                    <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                        value={editingItem ? editingItem.name : newItem.name}
                                        onChange={e => (editingItem ? setEditingItem({ ...editingItem, name: e.target.value }) : setNewItem({ ...newItem, name: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Price</label>
                                    <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                        type="number" step="0.01"
                                        value={editingItem ? editingItem.price : newItem.price}
                                        onChange={e => (editingItem ? setEditingItem({ ...editingItem, price: e.target.value }) : setNewItem({ ...newItem, price: e.target.value }))}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                                <textarea className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                    rows="3"
                                    value={editingItem ? editingItem.description : newItem.description}
                                    onChange={e => (editingItem ? setEditingItem({ ...editingItem, description: e.target.value }) : setNewItem({ ...newItem, description: e.target.value }))}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Image URL</label>
                                <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                    value={editingItem ? editingItem.imageUrl : newItem.imageUrl}
                                    onChange={e => (editingItem ? setEditingItem({ ...editingItem, imageUrl: e.target.value }) : setNewItem({ ...newItem, imageUrl: e.target.value }))}
                                />
                            </div>

                            <div className="flex gap-4 py-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="w-5 h-5 rounded text-green-600 focus:ring-green-500"
                                        checked={editingItem ? editingItem.isVegetarian : newItem.isVegetarian}
                                        onChange={e => (editingItem ? setEditingItem({ ...editingItem, isVegetarian: e.target.checked }) : setNewItem({ ...newItem, isVegetarian: e.target.checked }))}
                                    />
                                    <span className="font-bold text-gray-700 text-sm">Vegetarian</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="w-5 h-5 rounded text-green-600 focus:ring-green-500"
                                        checked={editingItem ? editingItem.isVegan : newItem.isVegan}
                                        onChange={e => (editingItem ? setEditingItem({ ...editingItem, isVegan: e.target.checked }) : setNewItem({ ...newItem, isVegan: e.target.checked }))}
                                    />
                                    <span className="font-bold text-gray-700 text-sm">Vegan</span>
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => { setShowAddItemModal(false); setEditingItem(null) }} className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg">Save Item</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RestaurantDashboard;
