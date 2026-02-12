import React from 'react';

const DeliveryMap = () => {
    return (
        <div className="w-full h-48 bg-gray-100 rounded-3xl overflow-hidden relative shadow-inner mb-6 px-4">
            <div className="absolute inset-0 bg-blue-50 pattern-dots opacity-30"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                        Map Navigation
                    </span>
                </div>
            </div>
            {/* Simulated Route Line */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M10,50 Q50,10 90,50" stroke="#3B82F6" strokeWidth="2" fill="none" strokeDasharray="5,5" />
            </svg>
        </div>
    );
};

export default DeliveryMap;
