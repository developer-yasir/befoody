import React from 'react';
import { acceptOrder, completeDelivery, updateAvailability } from '../../services/riderService';

const HomeView = ({
    user,
    profile,
    stats,
    isAvailable,
    setIsAvailable,
    activeOrder,
    setActiveOrder,
    availableOrders,
    setAvailableOrders,
    fetchAvailableOrders,
    setLoading
}) => {

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const handleToggleAvailability = async () => {
        try {
            const newStatus = !isAvailable;
            await updateAvailability(newStatus);
            setIsAvailable(newStatus);
            if (newStatus) fetchAvailableOrders();
        } catch (err) {
            console.error('Failed to update status', err);
        }
    };

    const handleAcceptOrder = async (orderId) => {
        try {
            setLoading(true);
            const order = await acceptOrder(orderId);
            setActiveOrder(order);
            setAvailableOrders([]);
        } catch (err) {
            console.error(err);
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
            await fetchAvailableOrders();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pb-24">
            {/* Header */}
            <div className="bg-white rounded-b-[2.5rem] shadow-sm border-b border-gray-100 overflow-hidden relative mb-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100 rounded-full blur-3xl opacity-50 -mr-10 -mt-10"></div>
                <div className="p-6 relative z-10">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-xl shadow-inner">🛵</div>
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

            {/* Active Order or Available Orders */}
            <div className="px-6 md:px-10">
                {activeOrder ? (
                    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="flex h-3 w-3 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
                            </span>
                            <h2 className="text-xl font-black text-gray-800">Live Delivery</h2>
                        </div>

                        <div className="bg-white rounded-3xl shadow-2xl shadow-primary-500/10 overflow-hidden border border-gray-100 flex flex-col md:flex-row">
                            {/* Map Placeholder */}
                            <div className="h-64 md:h-auto md:w-1/2 bg-gray-100 relative grayscale opacity-80">
                                <img src="https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/-74.006,40.7128,13,0/600x600?access_token=MockToken" alt="Map View" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50">
                                    <p className="text-sm font-bold uppercase tracking-widest opacity-60 px-4 text-center">Map View Mock (Navigation Active)</p>
                                </div>
                            </div>

                            <div className="p-8 md:w-1/2 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 leading-tight mb-2">{activeOrder.restaurantId?.name}</h3>
                                    <p className="text-gray-500 text-sm mb-8">{activeOrder.restaurantId?.address}</p>

                                    <div className="relative border-l-2 border-gray-100 ml-3 space-y-10 mb-10">
                                        <div className="relative pl-8">
                                            <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-sm"></div>
                                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Pickup</p>
                                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                {activeOrder.items?.map((item, i) => (
                                                    <div key={i} className="flex justify-between items-center text-sm py-2 border-b border-gray-100 last:border-0 last:pb-0">
                                                        <span className="font-medium text-gray-700"><span className="font-bold text-gray-900">{item.quantity}x</span> {item.name || item.menuItemId?.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="relative pl-8">
                                            <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-4 border-primary-500 shadow-sm"></div>
                                            <p className="text-xs font-bold text-primary-600 uppercase mb-2">Dropoff</p>
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl shadow-inner">👤</div>
                                                <div>
                                                    <p className="text-lg font-bold text-gray-900">{activeOrder.userId?.name || 'Customer'}</p>
                                                    <p className="text-sm text-gray-500">123 Main St, Apt 4B • Code: 1234</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button onClick={handleCompleteOrder} className="w-full bg-gray-900 text-white font-bold py-5 rounded-2xl shadow-xl shadow-gray-200 hover:bg-black transition-all transform active:scale-[0.98]">
                                    Complete Delivery
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="flex justify-between items-center px-1">
                            <h2 className="text-2xl font-black text-gray-900">Nearby Orders</h2>
                            <span className="bg-primary-50 text-primary-700 text-xs font-bold px-4 py-2 rounded-full border border-primary-100">{availableOrders.length} Available</span>
                        </div>

                        {/* Busy Zone Mock */}
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg shadow-orange-500/20">
                            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div>
                                    <h3 className="font-black text-xl mb-1">🔥 High Demand Area</h3>
                                    <p className="text-sm font-medium opacity-90">+ $2.00 surge currently active in Downtown area</p>
                                </div>
                                <button className="bg-white/20 backdrop-blur-md px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-white/30 transition-all self-start md:self-center">
                                    View Map
                                </button>
                            </div>
                            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-8 -mt-8 blur-3xl"></div>
                        </div>

                        {availableOrders.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                <span className="text-5xl mb-4 block">📦</span>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Scanning for orders...</h3>
                                <p className="text-gray-500 max-w-sm mx-auto mb-6">We'll notify you as soon as a new delivery is available in your area.</p>
                                <button onClick={fetchAvailableOrders} className="bg-primary-50 text-primary-600 font-black px-8 py-3 rounded-2xl hover:bg-primary-100 transition-all border border-primary-100">
                                    Refresh List
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {availableOrders.map(order => (
                                    <div key={order._id} className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300 group">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">🍔</div>
                                                <div>
                                                    <h3 className="font-black text-gray-900 text-xl leading-tight mb-1">{order.restaurantId?.name}</h3>
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{order.restaurantId?.address}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-black text-green-600">{formatCurrency(order.deliveryFee || 5.00)}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Per Delivery</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="flex-1 bg-gray-50 py-3 rounded-2xl text-center border border-gray-100">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Distance</p>
                                                <p className="text-sm font-black text-gray-800">2.4 km</p>
                                            </div>
                                            <div className="flex-1 bg-gray-50 py-3 rounded-2xl text-center border border-gray-100">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Items</p>
                                                <p className="text-sm font-black text-gray-800">{order.items?.length || 0} items</p>
                                            </div>
                                        </div>

                                        <button onClick={() => handleAcceptOrder(order._id)} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-primary-600 transition-all shadow-xl shadow-gray-200 hover:shadow-primary-500/20 active:scale-[0.98]">
                                            Accept Delivery
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomeView;
