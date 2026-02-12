import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Restaurants = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCuisine, setSelectedCuisine] = useState('All');
    const [sortBy, setSortBy] = useState('rating');
    const [priceRange, setPriceRange] = useState('all');
    const [deliveryTime, setDeliveryTime] = useState('all');
    const [showFilters, setShowFilters] = useState(false);

    const cuisines = ['All', 'Italian', 'Japanese', 'American', 'Mexican', 'Indian', 'Chinese'];

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/restaurants');
            setRestaurants(res.data);
        } catch (error) {
            console.error('Error fetching restaurants:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAndSortedRestaurants = restaurants
        .filter(restaurant => {
            const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                restaurant.cuisine.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesCuisine = selectedCuisine === 'All' || restaurant.cuisine.includes(selectedCuisine);
            const matchesDeliveryTime = deliveryTime === 'all' ||
                (deliveryTime === 'fast' && restaurant.deliveryTime <= 30) ||
                (deliveryTime === 'medium' && restaurant.deliveryTime > 30 && restaurant.deliveryTime <= 45) ||
                (deliveryTime === 'slow' && restaurant.deliveryTime > 45);
            const matchesPrice = priceRange === 'all' ||
                (priceRange === 'free' && restaurant.deliveryFee === 0) ||
                (priceRange === 'low' && restaurant.deliveryFee > 0 && restaurant.deliveryFee <= 2) ||
                (priceRange === 'high' && restaurant.deliveryFee > 2);

            return matchesSearch && matchesCuisine && matchesDeliveryTime && matchesPrice;
        })
        .sort((a, b) => {
            if (sortBy === 'rating') return b.rating - a.rating;
            if (sortBy === 'deliveryTime') return a.deliveryTime - b.deliveryTime;
            if (sortBy === 'deliveryFee') return a.deliveryFee - b.deliveryFee;
            return 0;
        });

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-heading font-bold text-gray-900 mb-4">
                        All <span className="text-gradient">Restaurants</span>
                    </h1>
                    <p className="text-gray-600">Discover amazing food from local restaurants</p>
                </div>

                {/* Search and Filters */}
                <div className="card mb-8">
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                        <input
                            type="text"
                            placeholder="Search restaurants..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input-field flex-1"
                        />
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="btn btn-outline md:hidden"
                        >
                            {showFilters ? 'Hide Filters' : 'Show Filters'} 🔽
                        </button>
                    </div>

                    {/* Filters */}
                    <div className={`${showFilters ? 'block' : 'hidden md:block'} space-y-4`}>
                        {/* Cuisine Filter */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Cuisine</label>
                            <div className="flex flex-wrap gap-2">
                                {cuisines.map((cuisine) => (
                                    <button
                                        key={cuisine}
                                        onClick={() => setSelectedCuisine(cuisine)}
                                        className={`btn text-sm py-2 ${selectedCuisine === cuisine
                                                ? 'btn-primary'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {cuisine}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sort, Price, and Delivery Time */}
                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="input-field"
                                >
                                    <option value="rating">⭐ Rating</option>
                                    <option value="deliveryTime">🕐 Delivery Time</option>
                                    <option value="deliveryFee">💰 Delivery Fee</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Fee</label>
                                <select
                                    value={priceRange}
                                    onChange={(e) => setPriceRange(e.target.value)}
                                    className="input-field"
                                >
                                    <option value="all">All Prices</option>
                                    <option value="free">Free Delivery</option>
                                    <option value="low">Under $2</option>
                                    <option value="high">Above $2</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Time</label>
                                <select
                                    value={deliveryTime}
                                    onChange={(e) => setDeliveryTime(e.target.value)}
                                    className="input-field"
                                >
                                    <option value="all">Any Time</option>
                                    <option value="fast">Under 30 min</option>
                                    <option value="medium">30-45 min</option>
                                    <option value="slow">45+ min</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Count */}
                <div className="mb-6 text-gray-600">
                    Found <span className="font-semibold text-gray-900">{filteredAndSortedRestaurants.length}</span> restaurants
                </div>

                {/* Restaurant Grid */}
                {loading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="card">
                                <div className="skeleton h-48 mb-4 rounded-lg"></div>
                                <div className="skeleton-text mb-2"></div>
                                <div className="skeleton-text w-2/3"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredAndSortedRestaurants.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No restaurants found</h3>
                        <p className="text-gray-600">Try adjusting your filters</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAndSortedRestaurants.map((restaurant, index) => (
                            <Link
                                key={restaurant._id}
                                to={`/restaurants/${restaurant._id}`}
                                className="card card-hover p-0 overflow-hidden group animate-scale-in"
                                style={{ animationDelay: `${index * 0.03}s` }}
                            >
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={restaurant.imageUrl}
                                        alt={restaurant.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    {restaurant.deliveryFee === 0 && (
                                        <span className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                                            FREE DELIVERY
                                        </span>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">
                                        {restaurant.name}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                        {restaurant.description}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {restaurant.cuisine.slice(0, 3).map((c, i) => (
                                            <span key={i} className="badge bg-primary-50 text-primary-700 text-xs">
                                                {c}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                        <div className="flex items-center gap-1">
                                            <span className="text-yellow-500 text-lg">⭐</span>
                                            <span className="font-bold text-gray-900">{restaurant.rating.toFixed(1)}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-600">
                                            <span className="flex items-center gap-1">
                                                🕐 {restaurant.deliveryTime}min
                                            </span>
                                            {restaurant.deliveryFee > 0 && (
                                                <span className="flex items-center gap-1 font-semibold text-primary-500">
                                                    ${restaurant.deliveryFee.toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Restaurants;
