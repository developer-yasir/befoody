import React, { useState, useEffect, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const Dishes = () => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { addToast } = useToast();
    const [dishes, setDishes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [sortBy, setSortBy] = useState('popular'); // price-low, price-high, popular

    const categories = ['All', 'Pizza', 'Burger', 'Sushi', 'Sushi', 'Desserts', 'Healthy', 'Beverages'];

    useEffect(() => {
        fetchDishes();
    }, []);

    const fetchDishes = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/fooditems');
            setDishes(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dishes:', error);
            setLoading(false);
        }
    };

    const filteredDishes = useMemo(() => {
        return dishes.filter(dish => {
            const matchesSearch = dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (dish.description && dish.description.toLowerCase().includes(searchTerm.toLowerCase()));

            // Actually categories should match dish.category if available, or name/description
            const matchesCategory = activeFilter === 'All' || activeFilter === 'Veg' ||
                (dish.cuisine && dish.cuisine.toLowerCase() === activeFilter.toLowerCase()) ||
                (dish.name.toLowerCase().includes(activeFilter.toLowerCase()));

            return matchesSearch && matchesCategory;
        }).sort((a, b) => {
            if (sortBy === 'price-low') return a.price - b.price;
            if (sortBy === 'price-high') return b.price - a.price;
            return 0; // default (popular/random)
        });
    }, [dishes, searchTerm, activeFilter, sortBy]);

    return (
        <div className="min-h-screen bg-gray-50 pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter mb-4">
                        Discover <span className="text-primary-600">Delicious</span>
                    </h1>
                    <p className="text-gray-500 font-medium max-w-2xl">
                        Browse through our curated selection of top-rated dishes from the best restaurants around you.
                    </p>
                </div>

                {/* Filters & Search */}
                <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 mb-12 flex flex-col md:flex-row gap-6">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Search dishes or ingredients..."
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-500 font-bold transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <select
                            className="px-6 py-4 rounded-2xl bg-gray-50 border-none font-bold focus:ring-2 focus:ring-primary-500"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="popular">Popularity</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                        </select>
                    </div>
                </div>

                {/* Category Pills */}
                <div className="flex gap-3 overflow-x-auto no-scrollbar mb-12 pb-2">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveFilter(cat)}
                            className={`px-8 py-3 rounded-full text-sm font-black whitespace-nowrap transition-all ${activeFilter === cat
                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                                : 'bg-white text-gray-600 border border-gray-100 hover:border-primary-200'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                    <button
                        onClick={() => setActiveFilter(activeFilter === 'Veg' ? 'All' : 'Veg')}
                        className={`px-8 py-3 rounded-full text-sm font-black whitespace-nowrap transition-all border ${activeFilter === 'Veg'
                            ? 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-500/30'
                            : 'bg-white text-green-600 border-green-100 hover:bg-green-50'
                            }`}
                    >
                        🌱 Vegetarian Only
                    </button>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-gray-200 aspect-square rounded-[2rem] mb-4"></div>
                                <div className="bg-gray-200 h-6 w-3/4 rounded-lg mb-2"></div>
                                <div className="bg-gray-200 h-4 w-1/2 rounded-lg"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredDishes.length === 0 ? (
                    <div className="text-center py-32 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
                        <div className="text-6xl mb-6">🏜️</div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">No dishes found</h3>
                        <p className="text-gray-500 font-medium mb-8">Try adjusting your filters or search term.</p>
                        <button
                            onClick={() => { setSearchTerm(''); setActiveFilter('All'); }}
                            className="bg-primary-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-primary-500/30"
                        >
                            Reset All Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {filteredDishes.map((dish) => (
                            <div
                                key={dish._id}
                                className="group bg-white rounded-[2.5rem] p-4 border border-gray-50 shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                            >
                                <div className="relative aspect-square rounded-[2rem] overflow-hidden mb-6">
                                    <img
                                        src={dish.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
                                        alt={dish.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    {dish.isVegetarian && (
                                        <div className="absolute top-4 left-4 w-8 h-8 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center border border-green-100">
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest">
                                        ★ {dish.rating || '4.8'}
                                    </div>

                                    {/* Action Buttons Overlay */}
                                    <div className="absolute inset-x-4 bottom-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                addToCart(dish);
                                                addToast(`${dish.name} added to cart!`, 'success');
                                            }}
                                            className="w-full bg-primary-600 text-white py-3 rounded-2xl font-black shadow-xl shadow-primary-500/30 hover:bg-primary-700"
                                        >
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>

                                <div className="px-2">
                                    <div className="flex items-start justify-between gap-3 mb-1">
                                        <h3
                                            className="text-lg font-black text-gray-900 leading-tight group-hover:text-primary-600 transition-colors cursor-pointer"
                                            onClick={() => navigate(`/dishes/${dish._id}`)}
                                        >
                                            {dish.name}
                                        </h3>
                                        <p className="text-xl font-black text-primary-600 tracking-tight">${dish.price.toFixed(2)}</p>
                                    </div>
                                    <p className="text-xs font-bold text-gray-400 capitalize mb-4">
                                        {dish.cuisine || 'Fast Food'} • {dish.isVegetarian ? 'Vegetarian' : 'Non-Veg'}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-gray-100"></div>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">View Restaurant</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dishes;
