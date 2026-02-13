import React, { useEffect, useState } from 'react';
import { getDeliveryHistory, getRiderProfile } from '../../services/riderService';

const HistoryView = () => {
    const [history, setHistory] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const [hist, prof] = await Promise.all([
                    getDeliveryHistory(),
                    getRiderProfile()
                ]);
                setHistory(hist);
                setProfile(prof);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        loadHistory();
    }, []);

    const getTier = (deliveries) => {
        if (deliveries >= 100) return { name: 'Platinum', color: 'bg-purple-100 text-purple-700', icon: '👑' };
        if (deliveries >= 20) return { name: 'Gold', color: 'bg-yellow-100 text-yellow-700', icon: '🥇' };
        return { name: 'Silver', color: 'bg-gray-100 text-gray-700', icon: '🥈' };
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading History...</div>;

    const tier = getTier(profile?.totalDeliveries || 0);

    return (
        <div className="pb-24 px-6 md:px-10 pt-8 md:pt-12">
            <h1 className="text-3xl font-black text-gray-900 mb-8">History</h1>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 mb-8">
                {/* Gamification Card */}
                <div className="xl:col-span-1 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden flex flex-col justify-center">
                    <div className="flex flex-col items-center text-center relative z-10">
                        <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center text-5xl shadow-inner mb-6 border border-gray-100 italic">
                            {tier.icon}
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Current Status</p>
                            <h2 className="text-3xl font-black text-gray-900 mb-1">{tier.name}</h2>
                            <p className="text-sm font-bold text-primary-600 bg-primary-50 px-4 py-1.5 rounded-full inline-block mt-2">{profile?.totalDeliveries} Lifetime Deliveries</p>
                        </div>
                    </div>
                    {/* Progress Bar (Mock) */}
                    <div className="mt-10">
                        <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                            <span>Next Tier Progress</span>
                            <span className="text-primary-600">80%</span>
                        </div>
                        <div className="h-3 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                            <div className="h-full bg-primary-500 w-[80%] rounded-full shadow-[0_0_15px_rgba(239,68,68,0.3)]"></div>
                        </div>
                        <p className="text-[10px] text-center text-gray-400 mt-4 font-bold uppercase italic">12 more to Gold</p>
                    </div>
                </div>

                {/* History List */}
                <div className="xl:col-span-3">
                    <h3 className="text-xl font-black text-gray-900 mb-6 px-1">Past Deliveries</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {history.map(order => (
                            <div key={order._id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow group">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📦</div>
                                    <div>
                                        <h4 className="font-black text-gray-900 text-lg leading-tight mb-1">{order.restaurantId?.name}</h4>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                                            {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-black text-gray-900 mb-1">+${order.deliveryFee?.toFixed(2)}</p>
                                    <span className="text-[10px] font-black text-green-600 bg-green-50 px-3 py-1.5 rounded-full uppercase tracking-widest border border-green-100">Completed</span>
                                </div>
                            </div>
                        ))}
                        {history.length === 0 && (
                            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                                <span className="text-4xl mb-4 block">🛒</span>
                                <p className="text-gray-400 font-bold uppercase tracking-widest">No delivery history found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HistoryView;
