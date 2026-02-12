import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import PromoBanner from '../components/PromoBanner';
import HowItWorks from '../components/HowItWorks';
import PopularDishes from '../components/PopularDishes';

const Home = () => {
    const { user } = useAuth(); // Get user from context
    const navigate = useNavigate();
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCuisine, setSelectedCuisine] = useState('All');

    const cuisines = ['All', 'Italian', 'Japanese', 'American', 'Mexican', 'Indian', 'Chinese'];

    useEffect(() => {
        // Redirect based on role
        if (user) {
            if (user.role === 'admin') {
                navigate('/admin');
                return;
            }
            if (user.role === 'restaurant') {
                navigate('/restaurant-dashboard');
                return;
            }
            if (user.role === 'rider') {
                navigate('/rider-dashboard');
                return;
            }
        }

        fetchRestaurants();
    }, [user, navigate]);

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

    const filteredRestaurants = restaurants.filter(restaurant => {
        const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            restaurant.cuisine.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCuisine = selectedCuisine === 'All' || restaurant.cuisine.includes(selectedCuisine);
        return matchesSearch && matchesCuisine;
    });

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                    <div className="text-center animate-fade-in">
                        <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6">
                            Delicious Food,
                            <br />
                            <span className="text-yellow-300">Delivered Fast</span>
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 text-white/90">
                            Order from your favorite restaurants and get it delivered to your door
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto">
                            <div className="flex gap-2 bg-white rounded-full p-2 shadow-2xl">
                                <input
                                    type="text"
                                    placeholder="Search for restaurants or cuisines..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 px-6 py-3 rounded-full focus:outline-none text-gray-900"
                                />
                                <button className="btn btn-primary rounded-full px-8">
                                    🔍 Search
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Promo Banner */}
                <div className="mb-12 animate-slide-up">
                    <PromoBanner />
                </div>

                {/* Cuisine Filter Pills */}
                <div className="mb-8 animate-slide-up">
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                        {cuisines.map((cuisine) => (
                            <button
                                key={cuisine}
                                onClick={() => setSelectedCuisine(cuisine)}
                                className={`btn whitespace-nowrap ${selectedCuisine === cuisine
                                    ? 'btn-primary'
                                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                    }`}
                            >
                                {cuisine}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Featured Restaurants */}
                <div className="mb-12">
                    <h2 className="text-3xl md:text-4xl font-heading font-bold mb-8">
                        Featured <span className="text-gradient">Restaurants</span>
                    </h2>

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
                    ) : filteredRestaurants.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">🔍</div>
                            <p className="text-gray-600 text-lg">No restaurants found</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredRestaurants.map((restaurant, index) => (
                                <Link
                                    key={restaurant._id}
                                    to={`/restaurants/${restaurant._id}`}
                                    className="card card-hover p-0 overflow-hidden group animate-scale-in"
                                    style={{ animationDelay: `${index * 0.05}s` }}
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
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">
                                            {restaurant.name}
                                        </h3>
                                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                            {restaurant.description}
                                        </p>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {restaurant.cuisine.slice(0, 2).map((c, i) => (
                                                <span key={i} className="badge bg-gray-100 text-gray-700 text-xs">
                                                    {c}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-1">
                                                <span className="text-yellow-500">⭐</span>
                                                <span className="font-semibold">{restaurant.rating.toFixed(1)}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-600">
                                                <span>🕐 {restaurant.deliveryTime} min</span>
                                                {restaurant.deliveryFee > 0 && (
                                                    <span>💰 ${restaurant.deliveryFee.toFixed(2)}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Popular Dishes */}
                <PopularDishes />

                {/* How It Works */}
                <HowItWorks />

                {/* CTA Section */}
                <div className="mt-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-12 text-center text-white">
                    <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
                        Hungry? Order Now!
                    </h2>
                    <p className="text-xl mb-8 opacity-90">
                        Get your favorite food delivered in minutes
                    </p>
                    <Link to="/restaurants" className="btn bg-white text-primary-500 hover:bg-gray-100 text-lg px-8 py-4">
                        Browse All Restaurants
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Home;
