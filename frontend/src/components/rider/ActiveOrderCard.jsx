import React from 'react';

const ActiveOrderCard = ({ order }) => {
    if (!order) {
        return (
            <div className="px-4">
                <div className="bg-white rounded-3xl p-8 text-center border-2 border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Orders</h3>
                    <p className="text-gray-500">You're all caught up! Stay online to receive new delivery requests.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 mb-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4 px-1">Current Delivery</h2>
            <div className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
                    <span className="bg-white border border-gray-200 text-gray-600 text-xs font-bold px-3 py-1 rounded-lg">
                        #{order.id}
                    </span>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs font-bold text-green-600 uppercase tracking-wide">In Progress</span>
                    </div>
                </div>

                <div className="p-6">
                    {/* Route Info */}
                    <div className="relative pl-8 space-y-8 mb-8">
                        {/* Connecting Line */}
                        <div className="absolute left-2.5 top-2 bottom-10 w-0.5 bg-gray-100"></div>

                        {/* Pickup */}
                        <div className="relative">
                            <div className="absolute -left-8 mt-1">
                                <div className="w-6 h-6 rounded-full bg-white border-4 border-green-500 shadow-sm"></div>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Pick Up</p>
                                <h3 className="text-lg font-black text-gray-900 mb-0.5">{order.restaurant}</h3>
                                <p className="text-sm text-gray-500">Restaurant Address Needed here...</p>
                            </div>
                        </div>

                        {/* Dropoff */}
                        <div className="relative">
                            <div className="absolute -left-8 mt-1">
                                <div className="w-6 h-6 rounded-full bg-white border-4 border-primary-500 shadow-sm"></div>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Drop Off</p>
                                <h3 className="text-lg font-black text-gray-900 mb-0.5">{order.customer}</h3>
                                <p className="text-sm text-gray-500">{order.address}</p>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-bold text-gray-900 text-sm">Order Items</h4>
                            <span className="text-xs font-bold text-gray-400">{order.items.length} Items</span>
                        </div>
                        <ul className="space-y-2">
                            {order.items.map((item, idx) => (
                                <li key={idx} className="flex text-sm text-gray-600">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 mr-2"></span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3">
                        <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            Call
                        </button>
                        <button className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary-500/30 transition-all flex items-center justify-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Complete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActiveOrderCard;
