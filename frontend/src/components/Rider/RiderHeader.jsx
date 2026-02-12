import React from 'react';
import { useAuth } from '../../context/AuthContext';

const RiderHeader = ({ isAvailable, toggleAvailability }) => {
    const { user } = useAuth();

    return (
        <div className="bg-white px-4 py-4 shadow-sm sticky top-0 z-50">
            <div className="flex justify-between items-center max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold border-2 border-primary-50">
                        {user?.name?.charAt(0) || 'R'}
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 leading-tight">
                            {user?.name?.split(' ')[0]}
                        </h1>
                        <p className="text-xs font-medium text-gray-500">
                            {isAvailable ? 'Ready for orders' : 'Currently offline'}
                        </p>
                    </div>
                </div>

                <button
                    onClick={toggleAvailability}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all shadow-sm ${isAvailable
                            ? 'bg-green-100 text-green-700 ring-2 ring-green-500/20'
                            : 'bg-gray-100 text-gray-600 ring-2 ring-gray-200'
                        }`}
                >
                    <div className={`w-2.5 h-2.5 rounded-full ${isAvailable ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                    {isAvailable ? 'Online' : 'Offline'}
                </button>
            </div>
        </div>
    );
};

export default RiderHeader;
