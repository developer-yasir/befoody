import React, { memo } from 'react';

const CuisineCategories = ({ activeCategory, onCategoryChange }) => {
    const categories = [
        { name: 'All', icon: '🍽️' },
        { name: 'Italian', icon: '🍕' },
        { name: 'American', icon: '🍔' },
        { name: 'Asian', icon: '🍱' },
        { name: 'Healthy', icon: '🥗' },
        { name: 'Desserts', icon: '🍰' },
        { name: 'Beverages', icon: '🥤' }
    ];

    return (
        <div className="py-12 bg-gray-50 overflow-x-auto no-scrollbar">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Explore Cuisines</h2>
                        <p className="text-gray-500 font-medium">Find exactly what you're looking for</p>
                    </div>
                    <div className="hidden md:flex gap-2">
                        <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-white hover:shadow-md transition-all">←</button>
                        <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-white hover:shadow-md transition-all">→</button>
                    </div>
                </div>

                <div className="flex gap-6 pb-4">
                    {categories.map((cat) => (
                        <button
                            key={cat.name}
                            onClick={() => onCategoryChange(cat.name)}
                            className={`flex-shrink-0 flex flex-col items-center gap-3 p-6 rounded-3xl transition-all duration-300 transform hover:-translate-y-2 ${activeCategory === cat.name
                                ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/30'
                                : 'bg-white text-gray-600 hover:shadow-lg'
                                }`}
                        >
                            <span className="text-4xl">{cat.icon}</span>
                            <span className="font-black text-sm tracking-tight">{cat.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default memo(CuisineCategories);
