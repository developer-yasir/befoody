import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import RiderHeader from '../components/Rider/RiderHeader';
import StatsOverview from '../components/Rider/StatsOverview';
import DeliveryMap from '../components/Rider/DeliveryMap';
import ActiveOrderCard from '../components/Rider/ActiveOrderCard';

const RiderDashboard = () => {
    const { user } = useAuth();
    const [isAvailable, setIsAvailable] = useState(true);
    const [activeTab, setActiveTab] = useState('home'); // 'home', 'earnings', 'profile'

    // Mock Data (Replace with API calls)
    const [stats] = useState({
        todayOrders: 5,
        totalEarnings: 120.50,
        rating: 4.8,
        pendingDeliveries: 1
    });

    const [activeOrder] = useState({
        id: 'ORD-7829',
        restaurant: 'Pizza Paradise',
        customer: 'John Doe',
        address: '123 Main St, Apt 4B',
        items: ['Pepperoni Pizza (L)', 'Coke (500ml)'],
        total: 24.50,
        status: 'Picked Up',
        time: '15 mins ago'
    });

    const toggleAvailability = () => {
        setIsAvailable(!isAvailable);
        // api.patch('/api/riders/availability', { isAvailable: !isAvailable });
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20"> {/* pb-20 for bottom nav spacing */}

            <RiderHeader isAvailable={isAvailable} toggleAvailability={toggleAvailability} />

            <div className="pt-2">
                <StatsOverview stats={stats} />

                {/* Available for orders banner if no active order */}
                {!activeOrder && isAvailable && (
                    <div className="px-4 mb-6">
                        <div className="bg-green-600 rounded-2xl p-4 shadow-lg shadow-green-500/20 text-white flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-lg">You're Online</h3>
                                <p className="text-green-100 text-sm">Finding nearby orders...</p>
                            </div>
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                                </svg>
                            </div>
                        </div>
                    </div>
                )}

                {activeOrder && (
                    <>
                        <DeliveryMap />
                        <ActiveOrderCard order={activeOrder} />
                    </>
                )}
            </div>

            {/* Bottom Navigation (Simulated) */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 pb-6 flex justify-between items-center z-40">
                <button
                    onClick={() => setActiveTab('home')}
                    className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-primary-600' : 'text-gray-400'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                    <span className="text-[10px] font-bold uppercase tracking-wide">Home</span>
                </button>
                <button
                    onClick={() => setActiveTab('earnings')}
                    className={`flex flex-col items-center gap-1 ${activeTab === 'earnings' ? 'text-primary-600' : 'text-gray-400'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    <span className="text-[10px] font-bold uppercase tracking-wide">Earnings</span>
                </button>
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'text-primary-600' : 'text-gray-400'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                    </svg>
                    <span className="text-[10px] font-bold uppercase tracking-wide">Profile</span>
                </button>
            </div>
        </div>
    );
};

export default RiderDashboard;
