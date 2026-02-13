import React from 'react';

const Sidebar = ({ activeView, setActiveView, logout }) => {
    const navItems = [
        { id: 'home', icon: '🏠', label: 'Home' },
        { id: 'earnings', icon: '💰', label: 'Earnings' },
        { id: 'history', icon: '📜', label: 'History' },
        { id: 'profile', icon: '👤', label: 'Profile' },
    ];

    return (
        <div className="hidden md:flex flex-col w-64 bg-white h-screen shadow-xl border-r border-gray-100 p-6 fixed left-0 top-0 z-50">
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-xl">
                    🛵
                </div>
                <div>
                    <h1 className="text-xl font-black text-gray-900 tracking-tight">
                        Rider<span className="text-primary-600">.</span>
                    </h1>
                </div>
            </div>

            <nav className="flex-1 space-y-2">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveView(item.id)}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group font-bold ${activeView === item.id
                                ? 'bg-primary-50 text-primary-700 shadow-sm'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                    >
                        <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                        <span>{item.label}</span>
                        {activeView === item.id && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500"></div>
                        )}
                    </button>
                ))}
            </nav>

            <button
                onClick={logout}
                className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors font-bold mt-auto"
            >
                <span className="text-xl">🚪</span>
                <span>Log Out</span>
            </button>
        </div>
    );
};

export default Sidebar;
