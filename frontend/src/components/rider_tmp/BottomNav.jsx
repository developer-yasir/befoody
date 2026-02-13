import React from 'react';

const BottomNav = ({ activeView, setActiveView }) => {
    const navItems = [
        { id: 'home', icon: '🏠', label: 'Home' },
        { id: 'earnings', icon: '💰', label: 'Earnings' },
        { id: 'history', icon: '📜', label: 'History' },
        { id: 'profile', icon: '👤', label: 'Profile' },
    ];

    return (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
            <div className="bg-white/90 backdrop-blur-md border border-gray-100 rounded-full shadow-2xl shadow-gray-200/50 px-6 py-2 flex items-center gap-6 pointer-events-auto">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveView(item.id)}
                        className={`flex flex-col items-center justify-center w-10 h-10 transition-all duration-300 relative ${activeView === item.id ? 'text-primary-600 scale-110' : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        {activeView === item.id && (
                            <span className="absolute -top-1 w-1 h-1 bg-primary-600 rounded-full"></span>
                        )}
                        <span className="text-xl">{item.icon}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default BottomNav;
