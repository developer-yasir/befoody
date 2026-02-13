import React from 'react';

const RestaurantBottomNav = ({ activeTab, setActiveTab }) => {
    const navItems = [
        { id: 'orders', icon: '📋', label: 'Orders' },
        { id: 'menu', icon: '🍽️', label: 'Menu' },
        { id: 'stats', icon: '📊', label: 'Stats' },
    ];

    return (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none md:hidden px-6">
            <div className="bg-white/90 backdrop-blur-md border border-gray-100 rounded-full shadow-2xl shadow-gray-200/50 px-6 py-2 flex items-center justify-between w-full max-w-sm pointer-events-auto">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`flex flex-col items-center justify-center transition-all duration-300 relative ${activeTab === item.id ? 'text-orange-600 scale-110' : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        {activeTab === item.id && (
                            <span className="absolute -top-1 w-1 h-1 bg-orange-600 rounded-full scale-150"></span>
                        )}
                        <span className="text-xl mb-0.5">{item.icon}</span>
                        <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default RestaurantBottomNav;
