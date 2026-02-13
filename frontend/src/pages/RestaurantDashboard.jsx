import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';

import RestaurantBottomNav from '../components/restaurant/RestaurantBottomNav';

const RestaurantDashboard = () => {
    const { user, logout, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [restaurant, setRestaurant] = useState(null);
    const [orders, setOrders] = useState([]);
    const [foodItems, setFoodItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'menu', or 'stats' (stats mobile only)
    const [mobileActiveColumn, setMobileActiveColumn] = useState('new'); // 'new', 'preparing', 'ready', 'out'

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
            <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-xl">👨‍🍳</div>
                    <div>
                        <h1 className="text-base md:text-lg font-black text-gray-900 leading-tight">{restaurant.name}</h1>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kitchen Hub</p>
                    </div>
                </div>

                {/* Desktop Tabs */}
                <div className="hidden md:flex bg-gray-100 p-1 rounded-lg">
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

                {/* Mobile Logout */}
                <button onClick={logout} className="md:hidden w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl text-gray-400">
                    🚪
                </button>
            </div>

            {/* --- ANALYTICS BAR --- */}
            <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 px-4 md:px-8 py-6 max-w-7xl mx-auto ${(activeTab !== 'stats' && activeTab !== 'orders') && 'hidden md:grid'}`}>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-xl md:text-2xl">💰</div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Revenue</p>
                        <p className="text-xl md:text-2xl font-black text-gray-900">${revenue.toFixed(2)}</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xl md:text-2xl">📦</div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Orders</p>
                        <p className="text-xl md:text-2xl font-black text-gray-900">{todayOrders.length}</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center text-xl md:text-2xl">🔔</div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Pending</p>
                        <p className="text-xl md:text-2xl font-black text-gray-900">{pendingCount}</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-xl md:text-2xl">⭐</div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Rating</p>
                        <p className="text-xl md:text-2xl font-black text-gray-900">{restaurant.rating}</p>
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="px-4 md:px-8 pb-12 max-w-7xl mx-auto">

                {/* 1. KANBAN BOARD VIEW */}
                {activeTab === 'orders' && (
                    <div className="flex flex-col gap-6">
                        {/* Mobile Column Switcher */}
                        <div className="flex md:hidden bg-gray-200/50 p-1.5 rounded-2xl gap-1 overflow-x-auto no-scrollbar">
                            {Object.keys(kanbanColumns).map(col => (
                                <button
                                    key={col}
                                    onClick={() => setMobileActiveColumn(col)}
                                    className={`flex-1 min-w-[100px] py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mobileActiveColumn === col ? 'bg-white text-gray-900 shadow-md scale-[1.02]' : 'text-gray-500'}`}
                                >
                                    {col} ({kanbanColumns[col].length})
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-auto md:h-[calc(100vh-250px)]">
                            {/* Column: New */}
                            <div className={`bg-gray-100/50 rounded-3xl p-4 flex flex-col ${mobileActiveColumn !== 'new' && 'hidden md:flex'}`}>
                                <div className="hidden md:flex items-center justify-between mb-4 px-2">
                                    <h3 className="font-bold text-gray-700">New Orders</h3>
                                    <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">{kanbanColumns.new.length}</span>
                                </div>
                                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                                    {kanbanColumns.new.map(order => (
                                        <div key={order._id} className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-orange-500 animate-in fade-in slide-in-from-bottom-2">
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="font-mono text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-500 uppercase">#{order._id.slice(-4)}</span>
                                                <span className="text-xs font-black text-orange-600">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <div className="space-y-2 mb-4">
                                                {order.items.map((item, i) => (
                                                    <div key={i} className="text-sm font-bold text-gray-800 flex justify-between">
                                                        <span>{item.quantity}x {item.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Value</span>
                                                <p className="font-black text-gray-900 text-xl">${order.totalAmount.toFixed(2)}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button onClick={() => updateOrderStatus(order._id, 'confirmed')} className="bg-gray-900 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all">Accept</button>
                                                <button onClick={() => updateOrderStatus(order._id, 'cancelled')} className="bg-white border border-gray-200 text-red-500 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-50 transition-all">Decline</button>
                                            </div>
                                        </div>
                                    ))}
                                    {kanbanColumns.new.length === 0 && <div className="text-center py-12 text-gray-400 text-xs font-black uppercase tracking-[0.2em] border-2 border-dashed border-gray-200 rounded-2xl">No new orders</div>}
                                </div>
                            </div>

                            {/* Column: Kitchen */}
                            <div className={`bg-gray-100/50 rounded-3xl p-4 flex flex-col ${mobileActiveColumn !== 'preparing' && 'hidden md:flex'}`}>
                                <div className="hidden md:flex items-center justify-between mb-4 px-2">
                                    <h3 className="font-bold text-gray-700">Kitchen</h3>
                                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">{kanbanColumns.preparing.length}</span>
                                </div>
                                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                                    {kanbanColumns.preparing.map(order => (
                                        <div key={order._id} className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-blue-500">
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="font-mono text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-500 uppercase">#{order._id.slice(-4)}</span>
                                                <span className="text-xs font-black text-blue-600 uppercase tracking-widest">{order.status === 'confirmed' ? 'Queued' : 'Cooking'}</span>
                                            </div>
                                            <div className="space-y-2 mb-4 opacity-80">
                                                {order.items.map((item, i) => (
                                                    <div key={i} className="text-sm font-bold text-gray-800 flex justify-between">
                                                        <span>{item.quantity}x {item.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <button onClick={() => updateOrderStatus(order._id, 'ready_for_pickup')} className="w-full bg-blue-600 text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
                                                Mark Ready 🔔
                                            </button>
                                        </div>
                                    ))}
                                    {kanbanColumns.preparing.length === 0 && <div className="text-center py-12 text-gray-400 text-xs font-black uppercase tracking-[0.2em] border-2 border-dashed border-gray-200 rounded-2xl">Kitchen Clear</div>}
                                </div>
                            </div>

                            {/* Column: Ready */}
                            <div className={`bg-gray-100/50 rounded-3xl p-4 flex flex-col ${mobileActiveColumn !== 'ready' && 'hidden md:flex'}`}>
                                <div className="hidden md:flex items-center justify-between mb-4 px-2">
                                    <h3 className="font-bold text-gray-700">Ready</h3>
                                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">{kanbanColumns.ready.length}</span>
                                </div>
                                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                                    {kanbanColumns.ready.map(order => (
                                        <div key={order._id} className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-green-500 opacity-90">
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="font-mono text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-500 uppercase">#{order._id.slice(-4)}</span>
                                                <span className="text-xs font-black text-green-600 uppercase tracking-widest">Ready</span>
                                            </div>
                                            <p className="text-sm font-black text-gray-800 mb-4">{order.items.length} Items Packed</p>
                                            <div className="py-3 bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-xl text-center border border-green-100">
                                                Awaiting Rider
                                            </div>
                                        </div>
                                    ))}
                                    {kanbanColumns.ready.length === 0 && <div className="text-center py-12 text-gray-400 text-xs font-black uppercase tracking-[0.2em] border-2 border-dashed border-gray-200 rounded-2xl">No units ready</div>}
                                </div>
                            </div>

                            {/* Column: Out */}
                            <div className={`bg-gray-100/50 rounded-3xl p-4 flex flex-col ${mobileActiveColumn !== 'out' && 'hidden md:flex'}`}>
                                <div className="hidden md:flex items-center justify-between mb-4 px-2">
                                    <h3 className="font-bold text-gray-700">On the Way</h3>
                                    <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-full">{kanbanColumns.out.length}</span>
                                </div>
                                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                                    {kanbanColumns.out.map(order => (
                                        <div key={order._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="font-mono text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-500 uppercase">#{order._id.slice(-4)}</span>
                                                <span className="text-xs font-black text-purple-600 uppercase tracking-widest">En Route</span>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-2xl border border-purple-100">
                                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl shadow-sm">🛵</div>
                                                <div>
                                                    <p className="text-[10px] font-black text-purple-400 uppercase leading-none mb-1">Assigned Rider</p>
                                                    <p className="text-sm font-black text-gray-900">{order.riderId?.userId?.name || 'Rider-449'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {kanbanColumns.out.length === 0 && <div className="text-center py-12 text-gray-400 text-xs font-black uppercase tracking-[0.2em] border-2 border-dashed border-gray-200 rounded-2xl">No active deliveries</div>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. MENU MANAGER VIEW */}
                {activeTab === 'menu' && (
                    <div className="animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-8 px-1">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900">Menu items</h2>
                                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest leading-none mt-1">{foodItems.length} active dishes</p>
                            </div>
                            <button onClick={() => setShowAddItemModal(true)} className="bg-gray-900 text-white w-12 h-12 md:w-auto md:px-6 md:py-3 rounded-2xl font-bold shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2">
                                <span className="text-2xl leading-none">+</span> <span className="hidden md:inline">Add Dish</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {foodItems.map(item => (
                                <div key={item._id} className={`bg-white rounded-[2.5rem] p-4 border transition-all flex flex-col ${!item.isAvailable ? 'border-gray-200 opacity-60 grayscale' : 'border-gray-100 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-1'}`}>
                                    <div className="relative h-48 mb-6 rounded-3xl overflow-hidden group">
                                        <img src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.name} />
                                        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => setEditingItem(item)} className="w-full bg-white py-2 rounded-xl shadow-sm hover:bg-gray-50 text-gray-900 font-black text-[10px] uppercase tracking-widest transition-all">Quick Edit</button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-start mb-3 px-1">
                                        <h3 className="font-black text-gray-900 text-lg leading-tight flex-1 pr-2">{item.name}</h3>
                                        <span className="font-black text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">${item.price.toFixed(2)}</span>
                                    </div>
                                    <p className="text-sm text-gray-400 font-medium line-clamp-2 mb-6 h-10 px-1">{item.description}</p>

                                    <div className="flex gap-2 mt-auto">
                                        <button
                                            onClick={() => toggleItemAvailability(item)}
                                            className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${item.isAvailable ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-green-50 text-green-500 hover:bg-green-500 hover:text-white'}`}
                                        >
                                            {item.isAvailable ? 'Disable' : 'Enable'}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteItem(item._id)}
                                            className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-2xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all border border-gray-100 shadow-sm"
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

            {/* Mobile Bottom Navigation */}
            <RestaurantBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

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
