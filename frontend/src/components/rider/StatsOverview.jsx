import React from 'react';

const StatsOverview = ({ stats }) => {
    return (
        <div className="grid grid-cols-3 gap-3 px-4 py-6 max-w-7xl mx-auto">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Earned</p>
                <h3 className="text-lg font-black text-gray-900">${stats.totalEarnings.toFixed(2)}</h3>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Orders</p>
                <h3 className="text-lg font-black text-gray-900">{stats.todayOrders}</h3>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                </div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Rating</p>
                <h3 className="text-lg font-black text-gray-900">{stats.rating}</h3>
            </div>
        </div>
    );
};

export default StatsOverview;
